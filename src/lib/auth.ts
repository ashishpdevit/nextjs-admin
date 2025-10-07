"use client"

export interface User {
  email: string
  name?: string
  roleId: string
  role?: string
  permissions?: string[]
}

// Development credentials
const DEV_CREDENTIALS = {
  email: "admin@yopmail.com",
  password: "AdminPass123!",
  user: {
    email: "admin@yopmail.com",
    name: "Admin User",
    roleId: "super-admin",
    role: "Super Admin",
    permissions: ["*"],
  } satisfies User,
}

export function setAuth(auth: boolean, user?: User) {
  const maxAge = auth ? 60 * 60 * 24 * 7 : 0 // 7 days
  document.cookie = `auth=${auth ? "1" : ""}; Path=/; Max-Age=${maxAge}`
  if (user) {
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; Path=/; Max-Age=${maxAge}`
  }
}

export function getAuthClient(): boolean {
  if (typeof document === "undefined") return false
  return /(?:^|; )auth=1(?:;|$)/.test(document.cookie)
}

export function getCurrentUser(): User | null {
  if (typeof document === "undefined") return null
  const userCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user="))
    ?.split("=")[1]

  if (!userCookie) return null

  try {
    return JSON.parse(decodeURIComponent(userCookie)) as User
  } catch {
    return null
  }
}

export function validateCredentials(email: string, password: string): { valid: boolean; user?: User } {
  if (email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password) {
    return {
      valid: true,
      user: DEV_CREDENTIALS.user,
    }
  }

  return { valid: false }
}

export function login(email: string, password: string): { success: boolean; message?: string } {
  const validation = validateCredentials(email, password)

  if (!validation.valid || !validation.user) {
    return {
      success: false,
      message: "Invalid email or password",
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(validation.user))
  }
  setAuth(true, validation.user)

  return { success: true }
}

export async function logout() {
  if (typeof window !== "undefined") {
    await logoutWithAPI()

    // localStorage.removeItem("user")
    // localStorage.removeItem("auth_token")

  }
  setAuth(false)
  if (typeof document !== "undefined") {
    document.cookie = "user=; Path=/; Max-Age=0"
  }
}

export async function loginWithAPI(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string; user?: User, token?: string }>
{
  try {
    const { axios } = await import("@/lib/axios")
    const responseAPI = await axios.post<{ success: boolean; message?: string; data?: { admin?: User, token?: string } }>("/api/admin/auth/login", {
      email,
      password,
    })

    const response = responseAPI.data || {}
    if (response && response.success && response.data?.admin) {
      console.log("111-admin",response.data?.admin, typeof response.data?.admin)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data?.admin))
        localStorage.setItem("auth_token", response.data?.token || "")
      }
      setAuth(true, response.data?.admin)
    }

    return response
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Network error. Please try again.",
    }
  }
}

export async function logoutWithAPI(): Promise<{ success: boolean }> {
  try {
    const { axios } = await import("@/lib/axios")
    const response = await axios.post("/api/admin/auth/logout", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("auth_token")}`
      }
    })
    if (response.data && response.data.success) {
      console.log("139-responseData",response.data)
      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
        localStorage.removeItem("auth_token")
      }
    }
  } catch {
    // Continue even if API call fails
  }

  // logout()
  return { success: true }
}
