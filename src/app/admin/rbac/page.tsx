import { redirect } from "next/navigation"

export default function RbacIndexPage() {
  redirect("/admin/rbac/modules")
}
