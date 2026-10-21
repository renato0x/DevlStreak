import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Nav } from "@/components/nav"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-[100svh] flex flex-col bg-[#0a0a0a]">
      <Nav />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  )
}
