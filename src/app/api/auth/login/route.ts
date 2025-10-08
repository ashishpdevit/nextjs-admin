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
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || "Test@123",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, message: errorData.message || "Invalid credentials" },
        { status: 401 }
      )
    }

    const data = await response.json()
    
    // Ensure the response has the expected structure
    if (data && data.data && data.data.admin) {
      // Map the admin data to include proper role information
      const admin = data.data.admin
      const normalizedAdmin = {
        email: admin.email,
        name: admin.name || admin.email,
        roleId: admin.role_id || admin.roleId || 2, // Default to super-admin role ID 2
        role: admin.role || "Super Admin",
        // Only include permissions if explicitly provided by backend
        // Otherwise, permissions will be fetched based on roleId from RBAC data
        ...(admin.permissions && { permissions: admin.permissions })
      }
      
      return NextResponse.json({
        success: true,
        message: data.message || "Login successful",
        data: {
          admin: normalizedAdmin,
          token: data.data.token
        }
      })
    }
    
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

