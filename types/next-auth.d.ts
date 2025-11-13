import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      email?: string
      name?: string
      role?: string
      department?: string
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    department: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string
    role?: string
    department?: string
    name?: string
  }
}
