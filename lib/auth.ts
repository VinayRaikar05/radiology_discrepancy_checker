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

export async function hashPassword(password: string) {
  const salt = await genSalt(12)
  return hash(password, salt)
}

export async function authenticateUser(email: string, password: string) {
  const supabaseAdmin = getSupabaseForServer()
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, role, department, password_hash, is_active")
    .eq("email", email)
    .single()

  if (error) {
    console.error("authenticateUser error:", error)
    return null
  }

  if (!data || !data.is_active || !data.password_hash) {
    return null
  }

  const passwordValid = await compare(password, data.password_hash)
  if (!passwordValid) {
    return null
  }

  return {
    id: data.id,
    email: data.email,
    name: data.full_name,
    role: data.role,
    department: data.department,
  }
}

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

export const authOptions: NextAuthOptions = {
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

        const user = await authenticateUser(credentials.email, credentials.password)
        return user
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
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
}
