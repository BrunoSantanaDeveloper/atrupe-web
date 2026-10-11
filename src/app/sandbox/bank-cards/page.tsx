import React from 'react'
import { BankCard } from '@/components/ui/bank-card'

export const dynamic = 'force-dynamic'

export default function BankCardsSandboxPage() {
  const intents = [
    'glass',
    'vibrant',
    'mint',
    'dark',
    'light',
    'peach',
  ] as const
  const layouts = ['full', 'split-horizontal', 'split-vertical'] as const

  return (
    <div className="flex flex-col min-h-screen bg-gray-300 p-8">
      <div className="max-w-[1500px] mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium text-[#252e3b]">
            Bank Cards (Decoupled Visual Variants)
          </h2>
          <p className="text-sm border-l-4 border-[#7b61ff] pl-3 text-gray-600 max-w-2xl bg-white/50 p-2 rounded-r-md">
            Abstracted all 36 combinatorics do Figma. Inclui lógica abstrata de
            alto-contraste em texto (Dark vs Light fonts dependendo das áreas de
            overlay do Design System), máscaras tipográficas SVG (`hasLines`), e
            logos polimórficos de bandeira de cartão que detectam as camadas
            subjacentes.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-x-12 gap-y-16">
          {layouts.map((layout) => (
            <div
              key={layout}
              className="flex flex-col gap-6 p-6 rounded-2xl bg-white/30 border border-white/40 shadow-sm backdrop-blur-sm"
            >
              <h3 className="uppercase tracking-widest text-gray-700 text-xs font-bold border-b border-[#344054]/10 pb-2">
                Layout: {layout}
              </h3>

              <div className="flex flex-col gap-8">
                {intents.map((intent) => (
                  <div
                    key={intent}
                    className="flex flex-col sm:flex-row gap-6 relative group"
                  >
                    {/* Without Lines */}
                    <div className="flex flex-col items-center gap-2">
                      <BankCard
                        intent={intent}
                        layout={layout}
                        hasLines={false}
                        name="OLIVIA RHYE"
                        number="1234 1234 1234 1234"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                        {intent} - Plain
                      </span>
                    </div>

                    {/* With Lines */}
                    <div className="flex flex-col items-center gap-2">
                      <BankCard
                        intent={intent}
                        layout={layout}
                        hasLines={true}
                        name="OLIVIA RHYE"
                        number="1234 1234 1234 1234"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                        {intent} - Topography
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
