interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "radiologist" | "reviewer" | "resident"
  department: string
}

// Demo users for development - in production, these would come from your database
const demoUsers = [
  {
    id: "1",
    email: "admin@radiologyai.com",
    password: "admin123",
    full_name: "System Administrator",
    role: "admin" as const,
    department: "IT",
  },
  {
    id: "2",
    email: "dr.smith@hospital.com",
    password: "doctor123",
    full_name: "Dr. Sarah Smith",
    role: "radiologist" as const,
    department: "Radiology",
  },
  {
    id: "3",
    email: "dr.johnson@hospital.com",
    password: "reviewer123",
    full_name: "Dr. Michael Johnson",
    role: "reviewer" as const,
    department: "Radiology",
  },
  {
    id: "4",
    email: "resident@hospital.com",
    password: "resident123",
    full_name: "Dr. Alex Chen",
    role: "resident" as const,
    department: "Radiology",
  },
]

/**
 * Authenticate user with email and password
 * In production, this would query your database and use bcrypt for password verification
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = demoUsers.find((u) => u.email === email && u.password === password)

  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  }

  return null
}

/**
 * Create an authentication token for a user
 * In production, this would use JWT or your session management system
 */
export function createAuthToken(user: User): string {
  // Simple base64 encoding for demo purposes
  // In production, use proper JWT signing with a secret key
  const tokenData = JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  return Buffer.from(tokenData).toString("base64")
}

/**
 * Verify an authentication token
 * In production, this would verify JWT signatures
 */
export function verifyAuthToken(token: string): any | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const tokenData = JSON.parse(decoded)

    // Check if token is expired
    if (tokenData.exp < Date.now()) {
      return null
    }

    return tokenData
  } catch (error) {
    return null
  }
}

import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await authenticateUser(credentials.email, credentials.password)

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            department: user.department,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.department = user.department
      }
      return token
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.department = token.department
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
}
