"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import admins from "@/mocks/admins.json"
import customers from "@/mocks/customers.json"

export default function AdminDashboard() {
  const totalAdmins = admins.length
  const activeAdmins = admins.filter(a => a.status === "Active").length
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === "Active").length

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Total admin users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Admins</CardTitle>
            <CardDescription>Currently active admins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Total app customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Customers</CardTitle>
            <CardDescription>Currently active customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCustomers}</div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}
