'use client'

import { useState } from 'react'

// UI
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Next
import Link from 'next/link'

// Icons
import {
  IconFilePlus,
  IconChevronRight,
  IconArrowLeft,
  IconArrowBackUp,
  IconPlus,
  IconBuildingStore,
  IconTool,
  IconFileInvoice,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Components
import { Topbar } from '@/components/common/Topbar'
import { InvoiceResultsTable } from './InvoiceResultsTable'
import { NfeAvulsaSection } from './NfeAvulsaSection'
import { FiscalModulePendingBanner } from '../../components/FiscalModulePendingBanner'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'
import { ExportXmlButton } from '@/components/common/fiscal/ExportXmlButton'
import { FiscalEnvironmentBadge } from '@/components/common/fiscal/FiscalEnvironmentBadge'

// Libs
import { cn } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface AvulsaType {
  key: string
  icon: typeof IconFilePlus
  title: string
  description: string
  href: string
  disabled: boolean
  badge?: string
}

export function IssueInvoice({ searchParams }: SearchParamsType) {
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedSpecialType, setSelectedSpecialType] = useState<
    'normal' | 'devolution' | 'complementary'
  >('normal')

  const handleOpenModal = () => {
    setModalOpen(true)
    setStep(1)
    setSelectedSpecialType('normal')
  }

  const specialTypes: {
    key: 'normal' | 'devolution' | 'complementary'
    icon: typeof IconFilePlus
    title: string
    description: string
  }[] = [
    {
      key: 'normal',
      icon: IconFilePlus,
      title: 'Nota Fiscal Normal',
      description: 'Nota fiscal comum para venda de produtos ou serviços',
    },
    {
      key: 'devolution',
      icon: IconArrowBackUp,
      title: 'NF-e de Devolução',
      description: 'Nota de entrada/retorno para devolução de mercadorias',
    },
    {
      key: 'complementary',
      icon: IconPlus,
      title: 'NF-e Complementar',
      description: 'Nota para complementar valores, impostos ou quantidade',
    },
  ]

  const avulsaTypes: AvulsaType[] = [
    {
      key: 'nfe',
      icon: IconBuildingStore,
      title: 'NF-e (Produto)',
      description: 'Nota Fiscal Eletrônica para venda de produtos',
      href: '/nota-fiscal/emitir/avulsa/nfe',
      disabled: false,
    },
    {
      key: 'nfse',
      icon: IconTool,
      title: 'NFS-e (Serviço)',
      description:
        'Nota Fiscal de Serviço Eletrônica para prestação de serviços',
      href: '/nota-fiscal/emitir/avulsa/nfse',
      disabled: false,
    },
    {
      key: 'nfce',
      icon: IconFileInvoice,
      title: 'NFC-e (Consumidor)',
      description: 'Nota Fiscal de Consumidor Eletrônica para venda ao varejo',
      href: '/nota-fiscal/emitir/avulsa/nfce',
      disabled: false,
    },
  ]

  const isTypeDisabled = (key: string) => {
    if (selectedSpecialType !== 'normal') {
      return key !== 'nfe'
    }
    return false
  }

  return (
    <FiscalModuleGate>
      <TooltipProvider>
        <div className="space-y-5 h-full flex flex-col">
          <FiscalModulePendingBanner />
          <Topbar
            title="Emissão de nota fiscal"
            primaryCta={
              <div className="flex items-center gap-3">
                <div className="hidden flex-wrap gap-2 xl:flex">
                  <FiscalEnvironmentBadge documentType="NFE" showDocumentType />
                  <FiscalEnvironmentBadge
                    documentType="NFSE"
                    showDocumentType
                  />
                  <FiscalEnvironmentBadge
                    documentType="NFCE"
                    showDocumentType
                  />
                </div>
                <ExportXmlButton />
                <Button LeftIcon={IconFilePlus} onClick={handleOpenModal}>
                  Emitir nota avulsa
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

      {/* 2-Step Standalone Invoice Choice Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {step === 1
                ? 'Emitir Nota Fiscal Avulsa'
                : 'Selecione o modelo da nota'}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? 'Selecione o tipo de nota fiscal que deseja emitir.'
                : 'Selecione se é uma nota de produto, serviço ou consumidor.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {step === 1 ? (
              <div className="space-y-3">
                {specialTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedSpecialType === type.key
                  return (
                    <div key={type.key} className="space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSpecialType(type.key)
                          setStep(2)
                        }}
                        className={cn(
                          'w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all',
                          isSelected
                            ? 'border-brand-500 bg-brand-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            isSelected
                              ? 'bg-brand-100 text-brand-600'
                              : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800">
                            {type.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {type.description}
                          </p>
                        </div>
                        <IconChevronRight
                          size={ICON_SIZE.md}
                          className="text-gray-400 shrink-0"
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {avulsaTypes.map((type) => {
                  const Icon = type.icon
                  const isDisabled = isTypeDisabled(type.key)
                  const href =
                    type.key === 'nfe'
                      ? selectedSpecialType === 'devolution'
                        ? '/nota-fiscal/emitir/avulsa/nfe?defaultFinality=4'
                        : selectedSpecialType === 'complementary'
                          ? '/nota-fiscal/emitir/avulsa/nfe?defaultFinality=2'
                          : '/nota-fiscal/emitir/avulsa/nfe'
                      : type.href

                  const content = (
                    <div
                      className={cn(
                        'flex items-center gap-4 rounded-lg border p-4 text-left transition-all',
                        isDisabled
                          ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                          : 'cursor-pointer border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          isDisabled
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-brand-100 text-brand-600',
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-semibold text-sm',
                            isDisabled ? 'text-gray-400' : 'text-gray-800',
                          )}
                        >
                          {type.title}
                        </p>
                        <p
                          className={cn(
                            'text-xs mt-0.5',
                            isDisabled ? 'text-gray-400' : 'text-gray-500',
                          )}
                        >
                          {type.description}
                        </p>
                      </div>
                      {type.badge ? (
                        <Badge
                          variant="neutralLight"
                          className="shrink-0 text-xs"
                        >
                          {type.badge}
                        </Badge>
                      ) : (
                        <IconChevronRight
                          size={ICON_SIZE.md}
                          className={cn(
                            'shrink-0 transition-transform',
                            isDisabled
                              ? 'text-gray-300'
                              : 'text-gray-400 group-hover:translate-x-0.5 group-hover:text-brand-500',
                          )}
                        />
                      )}
                    </div>
                  )

                  if (isDisabled) {
                    return <div key={type.key}>{content}</div>
                  }

                  return (
                    <Link
                      key={type.key}
                      href={href}
                      onClick={() => setModalOpen(false)}
                      className="block"
                    >
                      {content}
                    </Link>
                  )
                })}
              </div>
            )}
          </DialogBody>

          <DialogFooter
            className={cn(step === 2 ? 'sm:justify-between' : 'justify-end')}
          >
            {step === 2 && (
              <Button
                variant="outline"
                LeftIcon={IconArrowLeft}
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FiscalModuleGate>
  )
}
