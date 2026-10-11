// UI
import { Card } from '@/components/ui/card'

// Component
import { Logo } from '@/components/Logo'
import { AttributionCapture } from '@/components/AttributionCapture'

// Types
import type { PropsWithChildren } from 'react'

export default async function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 py-8 overflow-y-auto">
      {/* Captura oppref + UTMs na entrada do funil (§6) */}
      <AttributionCapture />
      <div className="w-full max-w-[1440px] flex justify-center items-center gap-10 flex-col-reverse lg:flex-row mx-auto px-4 my-auto">
        {/* Coluna da esquerda - Banner */}
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative">
          <div className="flex-grow-0 flex-shrink-0 w-full lg:w-[744px] aspect-square lg:h-[744px] relative overflow-hidden rounded-3xl">
            <img
              src="/img/auth-start.png"
              alt="Atrupe Banner"
              className="w-full h-full object-cover absolute left-0 top-0"
            />
            {/* Gradiente estilo Figma overlay 
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-transparent to-[#b53b17]/90 mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[242px] bg-gradient-to-b from-[#B53B17]/0 to-[#B53B17]"></div> */}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 relative gap-10 py-4 w-full lg:w-[464px]">
          <a href="http://www.atrupe.com.br/" target="_blank" rel="noreferrer">
            <Logo text width={154} />
          </a>
          <Card className="rounded-2xl w-full px-8 py-10 bg-white border border-gray-200 shadow-sm">
            {children}
          </Card>
        </div>
      </div>
    </div>
  )
}
