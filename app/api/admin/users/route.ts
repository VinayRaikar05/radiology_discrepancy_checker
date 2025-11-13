import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions, createUser } from "@/lib/auth"
import { databaseService } from "@/lib/database"

const ADMIN_ROLES = new Set(["admin"])
const VALID_ROLES = new Set(["admin", "radiologist", "reviewer", "resident"])

function sanitizeUser(user: any) {
  if (!user) return null
  const { password_hash: _password_hash, ...safe } = user
  return safe
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.has(session.user.role)) {
    return null
  }
  return session
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await databaseService.getUsers()
    return NextResponse.json({ users: users.map(sanitizeUser) })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : ""
    const department = typeof body.department === "string" ? body.department.trim() : ""
    const role = typeof body.role === "string" ? body.role.trim() : "radiologist"
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !fullName || !department || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (!VALID_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 })
    }

    try {
      const newUser = await createUser({
        email,
        password,
        fullName,
        department,
        role,
      })

      return NextResponse.json({ user: sanitizeUser(newUser) }, { status: 201 })
    } catch (error: any) {
      if (error?.code === "23505") {
        return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("User creation error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
