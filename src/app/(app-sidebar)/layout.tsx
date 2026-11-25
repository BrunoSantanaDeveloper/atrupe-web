// Components
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { TrialExpiredAlert } from '@/components/TrialExpiredAlert'
import { PartialBlockAlert } from '@/components/PartialBlockAlert'
import { BillingPendingAlert } from '@/components/BillingPendingAlert'
import { AiChatWidget } from '@/components/ai/AiChatWidget'
import {
  SuporteWhatsAppBotao,
  SuporteWhatsAppProvider,
} from '@/components/suporte/SuporteWhatsApp'

// Lib
import { buscarNumeroDoSuporte } from '@/lib/suporte-whatsapp.server'

// Types
import type { PropsWithChildren } from 'react'

export default async function AppLayout({ children }: PropsWithChildren) {
  const numeroDoSuporte = await buscarNumeroDoSuporte()

  return (
    <SuporteWhatsAppProvider numero={numeroDoSuporte}>
      <div className="flex flex-col h-screen">
        <TrialExpiredAlert />
        <PartialBlockAlert />
        <BillingPendingAlert />
        <MobileHeader />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 bg-gray-100 pl-6 pr-2 py-4 overflow-y-auto pb-36 lg:pl-6 max-lg:px-4">
            {children}
          </main>
          {/* Os botões flutuantes, um sobre o outro: o suporte no WhatsApp e o
              assistente de IA (este só com acesso à IA). */}
          <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
            <SuporteWhatsAppBotao />
            <AiChatWidget />
          </div>
        </div>
      </div>
    </SuporteWhatsAppProvider>
  )
}
