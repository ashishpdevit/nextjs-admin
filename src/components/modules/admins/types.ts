export type Admin = {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive"
  password?: string
}

export type CreateAdminInput = {
  name: string
  email: string
  password: string
  role: string
  status: "Active" | "Inactive"
}

export type UpdateAdminInput = {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive"
  password?: string
}

