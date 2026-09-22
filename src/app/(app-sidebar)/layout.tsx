// Components
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { TrialExpiredAlert } from '@/components/TrialExpiredAlert'
import { PartialBlockAlert } from '@/components/PartialBlockAlert'
import { BillingPendingAlert } from '@/components/BillingPendingAlert'
import { AiChatWidget } from '@/components/ai/AiChatWidget'

// Types
import type { PropsWithChildren } from 'react'

export default async function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-screen">
      <TrialExpiredAlert />
      <PartialBlockAlert />
      <BillingPendingAlert />
      <MobileHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-gray-100 pl-6 pr-2 py-4 overflow-y-auto pb-20 lg:pl-6 max-lg:px-4">
          {children}
        </main>
        <AiChatWidget />
      </div>
    </div>
  )
}
