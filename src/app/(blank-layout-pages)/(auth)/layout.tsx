// UI
import { Card } from '@/components/ui/card'

// Component
import { Logo } from '@/components/Logo'

// Types
import type { PropsWithChildren } from 'react'

export default async function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 py-8 overflow-y-auto">
      <div className="w-full max-w-[1248px] flex items-center gap-10 flex-col-reverse lg:flex-row mx-auto px-4 my-auto">
        {/* Coluna da esquerda */}
        <div className="w-full max-w-[744px] aspect-square rounded-3xl bg-[url('/img/auth-start.png')] bg-cover relative">
          <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-3xl bg-gradient-to-t from-[#B53B17] to-transparent"></div>
        </div>

        {/* Coluna do formulário */}
        <div className="flex flex-col items-center justify-center w-full max-w-[464px] gap-10 py-4">
          <a href="http://www.atrupe.com.br/" target="_blank">
            <Logo text width={154} />
          </a>
          <Card className="rounded-2xl w-full px-8 py-10">{children}</Card>
        </div>
      </div>
    </div>
  )
}
