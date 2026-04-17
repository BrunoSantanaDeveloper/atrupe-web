import React from 'react'
import { Switch } from '@/components/ui/switch'

export const dynamic = 'force-dynamic'

export default function SwitchSandboxPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <h2 className="text-2xl font-medium text-[#252e3b] mb-4">
          Toggle / Switch
        </h2>
        <p className="text-sm border-l-4 border-[#14b375] pl-3 mb-8 text-gray-500">
          Toggles representam dois estados excludentes (On/Off). Padrões Figma:
          Verde principal (Success), Default Size e Small Size.
        </p>

        <div className="flex gap-20 bg-white p-12 rounded-lg border border-dashed border-[#eaecf0]">
          {/* Default Sizing Column */}
          <div className="flex flex-col gap-10">
            <h3 className="text-sm font-semibold text-gray-400">
              Default (w-11 h-6)
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Switch id="d1" />
              </div>

              <div className="flex items-center gap-3">
                <Switch id="d2" defaultChecked />
              </div>

              <div className="flex items-center gap-3">
                <Switch id="d3" disabled />
              </div>

              <div className="flex items-center gap-3">
                <Switch id="d4" defaultChecked disabled />
              </div>
            </div>
          </div>

          {/* Small Sizing Column */}
          <div className="flex flex-col gap-10">
            <h3 className="text-sm font-semibold text-gray-400">
              Small (w-9 h-5)
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Switch id="s1" sizing="sm" />
              </div>

              <div className="flex items-center gap-3">
                <Switch id="s2" sizing="sm" defaultChecked />
              </div>

              <div className="flex items-center gap-3">
                <Switch id="s3" sizing="sm" disabled />
              </div>

              <div className="flex items-center gap-3">
                <Switch id="s4" sizing="sm" defaultChecked disabled />
              </div>
            </div>
          </div>

          {/* With Label Right */}
          <div className="flex flex-col gap-10">
            <h3 className="text-sm font-semibold text-gray-400">
              Layout Combinations
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Switch id="r1" />
                <label
                  htmlFor="r1"
                  className="text-sm font-medium leading-none text-[#344054] cursor-pointer"
                >
                  Lembrar de mim
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="r2" sizing="sm" defaultChecked />
                <label
                  htmlFor="r2"
                  className="text-sm font-medium leading-none text-[#344054] cursor-pointer"
                >
                  Lembrar de mim
                </label>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <Switch id="r3" defaultChecked />
                <div className="grid gap-1">
                  <label
                    htmlFor="r3"
                    className="text-sm font-medium leading-none text-[#344054] cursor-pointer"
                  >
                    Lembrar de mim
                  </label>
                  <p className="text-sm text-[#667085]">
                    Salve meus dados de login para a próxima vez.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 mt-4">
                <Switch id="r4" sizing="sm" />
                <div className="grid gap-1">
                  <label
                    htmlFor="r4"
                    className="text-sm font-medium leading-none text-[#344054] cursor-pointer text-muted-foreground"
                  >
                    Lembrar de mim
                  </label>
                  <p className="text-sm text-[#667085] opacity-80">
                    Salve meus dados de login para a próxima vez.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
