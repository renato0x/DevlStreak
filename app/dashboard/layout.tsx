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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:p-6">{children}</main>
    </div>
  )
}
