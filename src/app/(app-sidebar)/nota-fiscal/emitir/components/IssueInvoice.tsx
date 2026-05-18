'use client'

// UI
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

// Next
import Link from 'next/link'

// Icons
import { IconFilePlus } from '@tabler/icons-react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { InvoiceResultsTable } from './InvoiceResultsTable'
import { NfeAvulsaSection } from './NfeAvulsaSection'
import { FiscalModulePendingBanner } from '../../components/FiscalModulePendingBanner'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'
import { ExportXmlButton } from '@/components/common/fiscal/ExportXmlButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function IssueInvoice({ searchParams }: SearchParamsType) {
  return (
    <FiscalModuleGate>
      <TooltipProvider>
        <div className="space-y-5 h-full flex flex-col">
          <FiscalModulePendingBanner />
          <Topbar
            title="Emissão de Nota Fiscal"
            primaryCta={
              <div className="flex items-center gap-3">
                <ExportXmlButton />
                <Button asChild LeftIcon={IconFilePlus}>
                  <Link href="/nota-fiscal/emitir/avulsa">
                    Emitir Nota Avulsa
                  </Link>
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
            {/* Left Sidebar - Client Search 
            <div className="col-span-12 lg:col-span-4 h-full">
              <ClientSearchSidebar searchParams={searchParams} />
            </div> */}

            {/* Right Content - Results and Filters */}
            <div className="col-span-12 lg:col-span-12 h-full">
              <InvoiceResultsTable searchParams={searchParams} />
            </div>
          </div>

          <NfeAvulsaSection searchParams={searchParams} />
        </div>
      </TooltipProvider>
    </FiscalModuleGate>
  )
}
