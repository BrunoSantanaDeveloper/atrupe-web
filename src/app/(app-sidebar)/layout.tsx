// Components
import { Sidebar } from '@/components/layout/Sidebar'
import { TrialExpiredAlert } from '@/components/TrialExpiredAlert'

// Types
import type { PropsWithChildren } from 'react'

export default async function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-screen">
      <TrialExpiredAlert />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-gray-100 pl-6 pr-2 py-4 overflow-y-auto pb-20">
          {children}
        </main>
      </div>
    </div>
  )
}
