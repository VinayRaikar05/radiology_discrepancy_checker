import { NextResponse } from "next/server"

import { createUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : ""
    const department = typeof body.department === "string" ? body.department.trim() : ""

    if (!email || !password || !fullName || !department) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 })
    }

    try {
      const user = await createUser({
        email,
        password,
        fullName,
        department,
        role: "radiologist",
      })

      return NextResponse.json(
        {
          user,
          message: "Account created successfully. You can now sign in.",
        },
        { status: 201 },
      )
    } catch (error: any) {
      if (error?.code === "23505") {
        return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 })
  }
}


