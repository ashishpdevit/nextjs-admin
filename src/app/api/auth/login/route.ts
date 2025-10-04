import { NextRequest, NextResponse } from "next/server"

// Development credentials for demo
const DEV_CREDENTIALS = {
  email: "admin@yopmail.com",
  password: "AdminPass123!"
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // For development: validate against hardcoded credentials
    // if (email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password) {
    //   const user = {
    //     email: email,
    //     name: "Admin User",
    //     roleId: "super-admin",
    //     role: "Super Admin",
    //     permissions: ["*"]
    //   }

    //   return NextResponse.json({
    //     success: true,
    //     message: "Login successful",
    //     user: user
    //   })
    // }

    // TODO: Replace with actual API call to your backend
    // Example implementation:
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    

    // Invalid credentials
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 }
    )

  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

