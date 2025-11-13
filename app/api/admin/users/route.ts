import { NextResponse } from "next/server"

// Mock users data - in a real app, this would come from a database
const mockUsers = [
  {
    id: "1",
    email: "admin@radiologyai.com",
    full_name: "System Administrator",
    role: "admin",
    department: "IT",
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    last_login: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    email: "dr.smith@hospital.com",
    full_name: "Dr. Sarah Smith",
    role: "radiologist",
    department: "Radiology",
    is_active: true,
    created_at: "2024-01-16T09:00:00Z",
    last_login: "2024-01-20T13:45:00Z",
  },
  {
    id: "3",
    email: "dr.johnson@hospital.com",
    full_name: "Dr. Michael Johnson",
    role: "reviewer",
    department: "Radiology",
    is_active: true,
    created_at: "2024-01-17T11:00:00Z",
    last_login: "2024-01-20T12:15:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json({ users: mockUsers })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, full_name, role, department, password } = body

    // In a real app, you would:
    // 1. Validate the input
    // 2. Hash the password
    // 3. Save to database
    // 4. Return the created user

    const newUser = {
      id: Date.now().toString(),
      email,
      full_name,
      role,
      department,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("User creation error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
