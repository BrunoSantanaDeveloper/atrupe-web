import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { IconHelpCircle as HelpCircle } from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

export default function TooltipSandboxPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-25 p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <h2 className="text-2xl font-medium text-[#252e3b] mb-4">Tooltips</h2>
        <p className="text-sm border-l-4 border-brand-400 pl-3 mb-8 text-gray-500">
          Reprodução fiel do Figma: Suporte a tooltips Dark/Light com sombras
          padronizadas, setas customizadas renderizadas SVG dinamicamente e
          validação de tamanhos e tipografias (Complex Formats x Simple
          Formats).
        </p>

        <TooltipProvider delayDuration={100}>
          <div className="flex gap-20 p-16 rounded-xl border border-dashed border-gray-200 bg-gray-100/50 justify-center min-h-[600px] items-center">
            {/* LIGHT TOOLTIPS SECTION */}
            <div className="flex flex-col gap-12 items-center min-w-[300px]">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 tracking-widest uppercase">
                Light Mode
              </h3>

              {/* Top Simple */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Top Simple
                  </button>
                </TooltipTrigger>
                <TooltipContent intent="light" side="top">
                  <p className="text-xs font-semibold text-center text-gray-700">
                    Texto do tooltip
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Bottom Simple */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Bottom Simple
                  </button>
                </TooltipTrigger>
                <TooltipContent intent="light" side="bottom">
                  <p className="text-xs font-semibold text-center text-gray-700">
                    Texto do tooltip
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Left Complex */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Left Complex
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  intent="light"
                  side="left"
                  className="p-3 w-[304px]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-left text-gray-700">
                      Texto do tooltip
                    </p>
                    <p className="text-xs text-left text-gray-500">
                      Tooltips are used to describe or identify an element. In
                      most scenarios, tooltips help the user understand the
                      meaning, function or alt-text of an element.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Right Complex */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Right Complex
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  intent="light"
                  side="right"
                  className="p-3 w-[296px]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-left text-gray-700">
                      Texto do tooltip
                    </p>
                    <p className="text-xs text-left text-gray-500">
                      Tooltips are used to describe or identify an element. In
                      most scenarios, tooltips help the user understand the
                      meaning, function or alt-text of an element.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* DARK TOOLTIPS SECTION */}
            <div className="flex flex-col gap-12 items-center min-w-[300px]">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 tracking-widest uppercase">
                Dark Mode
              </h3>

              {/* Top Simple */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Top Simple
                  </button>
                </TooltipTrigger>
                <TooltipContent intent="dark" side="top">
                  <p className="text-xs font-semibold text-center text-white">
                    Texto do tooltip
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Bottom Simple */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Bottom Simple
                  </button>
                </TooltipTrigger>
                <TooltipContent intent="dark" side="bottom">
                  <p className="text-xs font-semibold text-center text-white">
                    Texto do tooltip
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Left Complex */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Left Complex
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  intent="dark"
                  side="left"
                  className="p-3 w-[304px]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-left text-white">
                      Texto do tooltip
                    </p>
                    <p className="text-xs text-left text-gray-300">
                      Tooltips are used to describe or identify an element. In
                      most scenarios, tooltips help the user understand the
                      meaning, function or alt-text of an element.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Right Complex */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600">
                    <HelpCircle className="w-4 h-4" /> Right Complex
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  intent="dark"
                  side="right"
                  className="p-3 w-[296px]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-left text-white">
                      Texto do tooltip
                    </p>
                    <p className="text-xs text-left text-gray-300">
                      Tooltips are used to describe or identify an element. In
                      most scenarios, tooltips help the user understand the
                      meaning, function or alt-text of an element.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
