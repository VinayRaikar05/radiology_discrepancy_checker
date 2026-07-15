import { compare, genSalt, hash } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getSupabaseForServer } from "@/lib/supabase"

type UserRole = "admin" | "radiologist" | "reviewer" | "resident"

interface UserRecord {
  id: string
  email: string
  full_name: string
  role: UserRole
  department: string
  password_hash: string | null
  is_active: boolean
}

// ──────────────────────────────────────────────────────────────────────────────
// Login attempt tracking (in-memory — resets on deploy)
// ──────────────────────────────────────────────────────────────────────────────
interface LoginAttempt {
  count: number
  lastAttempt: number
  lockedUntil: number | null
}

const loginAttempts = new Map<string, LoginAttempt>()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

function checkLoginAttempt(email: string): { allowed: boolean; minutesRemaining?: number } {
  const attempt = loginAttempts.get(email)
  if (!attempt) return { allowed: true }

  const now = Date.now()

  // Check if currently locked out
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const minutesRemaining = Math.ceil((attempt.lockedUntil - now) / 60_000)
    return { allowed: false, minutesRemaining }
  }

  // Reset if lockout has expired
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(email)
    return { allowed: true }
  }

  return { allowed: true }
}

function recordFailedLogin(email: string): void {
  const now = Date.now()
  const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: now, lockedUntil: null }

  // Reset counter if last attempt was more than lockout duration ago
  if (now - attempt.lastAttempt > LOCKOUT_DURATION_MS) {
    attempt.count = 0
  }

  attempt.count += 1
  attempt.lastAttempt = now

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS
  }

  loginAttempts.set(email, attempt)
}

function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email)
}

// Periodically clean up stale login attempt entries
setInterval(() => {
  const cutoff = Date.now() - LOCKOUT_DURATION_MS * 2
  for (const [email, attempt] of loginAttempts) {
    if (attempt.lastAttempt < cutoff) {
      loginAttempts.delete(email)
    }
  }
}, 5 * 60_000)

// ──────────────────────────────────────────────────────────────────────────────
// Password hashing
// ──────────────────────────────────────────────────────────────────────────────
export async function hashPassword(password: string) {
  const salt = await genSalt(12)
  return hash(password, salt)
}

// ──────────────────────────────────────────────────────────────────────────────
// Authentication
// ──────────────────────────────────────────────────────────────────────────────
export async function authenticateUser(email: string, password: string) {
  // Check for lockout
  const { allowed, minutesRemaining } = checkLoginAttempt(email)
  if (!allowed) {
    throw new Error(
      `Account temporarily locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
    )
  }

  const supabaseAdmin = getSupabaseForServer()
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, department, password_hash, is_active")
    .eq("email", email)
    .single()

  if (error) {
    console.error("authenticateUser error:", error)
    recordFailedLogin(email)
    return null
  }

  if (!data || !data.is_active || !data.password_hash) {
    recordFailedLogin(email)
    return null
  }

  const passwordValid = await compare(password, data.password_hash)
  if (!passwordValid) {
    recordFailedLogin(email)
    return null
  }

  // Successful login — clear any failed attempts
  clearLoginAttempts(email)

  return {
    id: data.id,
    email: data.email,
    name: data.full_name,
    role: data.role,
    department: data.department,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// User creation
// ──────────────────────────────────────────────────────────────────────────────
export async function createUser({
  email,
  password,
  fullName,
  role = "radiologist",
  department,
}: {
  email: string
  password: string
  fullName: string
  role?: UserRole
  department: string
}) {
  const password_hash = await hashPassword(password)

  const supabaseAdmin = getSupabaseForServer()
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      full_name: fullName,
      role,
      department,
      password_hash,
      is_active: true,
    })
    .select("id, email, full_name, role, department")
    .single()

  if (error) {
    console.error("createUser error:", error)
    throw error
  }

  return data
}

// ──────────────────────────────────────────────────────────────────────────────
// NextAuth configuration
// ──────────────────────────────────────────────────────────────────────────────
function getNextAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === "test") {
      return "test-secret-key-not-used-in-production-1234567890"
    }
    throw new Error(
      "NEXTAUTH_SECRET is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    )
  }
  return secret
}

let _authOptions: NextAuthOptions | null = null

export function getAuthOptions(): NextAuthOptions {
  if (!_authOptions) {
    _authOptions = {
      providers: [
        Credentials({
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
              return null
            }

            try {
              const user = await authenticateUser(credentials.email, credentials.password)
              return user
            } catch (error) {
              // Surface lockout errors to the user
              if (error instanceof Error && error.message.includes("temporarily locked")) {
                throw error
              }
              return null
            }
          },
        }),
      ],
      callbacks: {
        jwt({ token, user }) {
          if (user) {
            token.role = (user as any).role
            token.department = (user as any).department
            token.name = user.name
          }
          return token
        },
        session({ session, token }) {
          if (session.user) {
            session.user.id = token.sub
            session.user.role = token.role
            session.user.department = token.department
            session.user.name = token.name
          }
          return session
        },
      },
      pages: {
        signIn: "/login",
        error: "/login",
      },
      session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours — sessions expire after 8h of inactivity
      },
      jwt: {
        maxAge: 8 * 60 * 60, // JWT tokens expire after 8 hours
      },
      secret: getNextAuthSecret(),
    }
  }
  return _authOptions
}

/**
 * @deprecated Use getAuthOptions() instead. This getter exists for backward compatibility
 * but is lazy — it defers secret resolution until first access.
 */
export const authOptions: NextAuthOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuthOptions(), prop, receiver)
  },
  ownKeys() {
    return Reflect.ownKeys(getAuthOptions())
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getAuthOptions(), prop)
  },
  has(_target, prop) {
    return Reflect.has(getAuthOptions(), prop)
  },
})
