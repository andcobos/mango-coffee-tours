import { cookies } from 'next/headers'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_session')?.value === 'authenticated'

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
