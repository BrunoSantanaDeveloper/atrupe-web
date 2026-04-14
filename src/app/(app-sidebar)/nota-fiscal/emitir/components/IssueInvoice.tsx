'use client'

// UI
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ClientSearchSidebar } from './ClientSearchSidebar'
import { InvoiceResultsTable } from './InvoiceResultsTable'
import { FiscalModulePendingBanner } from '../../components/FiscalModulePendingBanner'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function IssueInvoice({ searchParams }: SearchParamsType) {
  return (
    <FiscalModuleGate>
      <TooltipProvider>
        <div className="space-y-5 h-full flex flex-col">
          <FiscalModulePendingBanner />
          <Topbar title="Emissão de Nota Fiscal" />

          <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
            {/* Left Sidebar - Client Search */}
            <div className="col-span-12 lg:col-span-4 h-full">
              <ClientSearchSidebar searchParams={searchParams} />
            </div>

            {/* Right Content - Results and Filters */}
            <div className="col-span-12 lg:col-span-8 h-full">
              <InvoiceResultsTable searchParams={searchParams} />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </FiscalModuleGate>
  )
}
