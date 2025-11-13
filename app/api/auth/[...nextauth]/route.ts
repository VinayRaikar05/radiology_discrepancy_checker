import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const authConfig = {
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

        // Demo users for development
        const demoUsers = [
          {
            id: "1",
            email: "admin@radiologyai.com",
            password: "admin123",
            name: "System Administrator",
            role: "admin",
            department: "IT",
          },
          {
            id: "2",
            email: "dr.smith@hospital.com",
            password: "doctor123",
            name: "Dr. Sarah Smith",
            role: "radiologist",
            department: "Radiology",
          },
          {
            id: "3",
            email: "dr.johnson@hospital.com",
            password: "reviewer123",
            name: "Dr. Michael Johnson",
            role: "reviewer",
            department: "Radiology",
          },
        ]

        const user = demoUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
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
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).department = token.department
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

const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }
