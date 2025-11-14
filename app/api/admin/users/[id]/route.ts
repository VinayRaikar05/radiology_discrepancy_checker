import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions, hashPassword } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

const supabaseAdmin = createServerClient()

const ADMIN_ROLES = new Set(["admin"])
const VALID_ROLES = new Set(["admin", "radiologist", "reviewer", "resident"])

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.has(session.user.role)) {
    return null
  }
  return session
}

function sanitizeUser(user: any) {
  if (!user) return null
  const { password_hash: _password_hash, ...safe } = user
  return safe
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const updates: Record<string, any> = {}

    if (typeof body.email === "string") {
      updates.email = body.email.trim().toLowerCase()
    }
    if (typeof body.full_name === "string") {
      updates.full_name = body.full_name.trim()
    }
    if (typeof body.department === "string") {
      updates.department = body.department.trim()
    }
    if (typeof body.role === "string") {
      const role = body.role.trim()
      if (!VALID_ROLES.has(role)) {
        return NextResponse.json({ error: "Invalid role." }, { status: 400 })
      }
      updates.role = role
    }
    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 })
      }
      updates.password_hash = await hashPassword(body.password)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, email, full_name, role, department, is_active, created_at, updated_at")
      .single()

    if (error) {
      console.error("Update user error:", error)
      return NextResponse.json({ error: "Failed to update user." }, { status: 500 })
    }

    return NextResponse.json({ user: sanitizeUser(data) })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin.from("users").update({ is_active: false }).eq("id", id)

    if (error) {
      console.error("Delete user error:", error)
      return NextResponse.json({ error: "Failed to deactivate user." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to deactivate user." }, { status: 500 })
  }
}


