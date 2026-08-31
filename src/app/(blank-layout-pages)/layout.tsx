// Type Imports
import type { PropsWithChildren } from 'react'

// Components
import { OpenAiPixel } from '@/components/OpenAiPixel'

export default function BlankLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-screen">
      {/* Pixel do funil de cadastro — inerte até habilitado (§4/§4.2) */}
      <OpenAiPixel />
      {children}
    </div>
  )
}
