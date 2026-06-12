import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { MainNav } from '@/components/main-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
