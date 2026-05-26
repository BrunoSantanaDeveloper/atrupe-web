'use client'

import { useState, useEffect } from 'react'

// UI
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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

// Components
import { Topbar } from '@/components/common/Topbar'
import { InvoiceResultsTable } from './InvoiceResultsTable'
import { NfeAvulsaSection } from './NfeAvulsaSection'
import { FiscalModulePendingBanner } from '../../components/FiscalModulePendingBanner'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'
import { ExportXmlButton } from '@/components/common/fiscal/ExportXmlButton'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { cn } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface NfeListType {
  id: string
  numero: number
  serie: number
  destinatario?: {
    nome?: string
  }
}

export function IssueInvoice({ searchParams }: SearchParamsType) {
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedSpecialType, setSelectedSpecialType] = useState<
    'normal' | 'devolution' | 'complementary'
  >('normal')
  const [selectedNfeId, setSelectedNfeId] = useState<string>('')
  const [nfeList, setNfeList] = useState<NfeListType[]>([])
  const [isLoadingNfes, setIsLoadingNfes] = useState(false)

  const handleOpenModal = () => {
    setModalOpen(true)
    setStep(1)
    setSelectedSpecialType('normal')
    setSelectedNfeId('')
  }

  useEffect(() => {
    if (
      selectedSpecialType === 'devolution' ||
      selectedSpecialType === 'complementary'
    ) {
      setIsLoadingNfes(true)
      getData({
        route: '/fiscal/nfe',
        filters: { status: 'AUTHORIZED', limit: '100' },
      })
        .then((res) => {
          if (res.success && res.data) {
            const rawData = res.data
            let dataArray: NfeListType[] = []
            if (Array.isArray(rawData)) {
              dataArray = rawData as NfeListType[]
            } else if (
              rawData &&
              typeof rawData === 'object' &&
              'data' in rawData &&
              Array.isArray((rawData as Record<string, unknown>).data)
            ) {
              dataArray = (rawData as Record<string, unknown>)
                .data as NfeListType[]
            }
            setNfeList(dataArray)
          }
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          setIsLoadingNfes(false)
        })
    }
  }, [selectedSpecialType])

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

  const avulsaTypes = [
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
      href: '#',
      disabled: true,
      badge: 'Breve',
    },
  ]

  const isTypeDisabled = (key: string) => {
    if (selectedSpecialType !== 'normal') {
      return key !== 'nfe'
    }
    return key === 'nfce'
  }

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
                <Button LeftIcon={IconFilePlus} onClick={handleOpenModal}>
                  Emitir Nota Avulsa
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
                          if (type.key === 'normal') {
                            setStep(2)
                          }
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
                        {type.key === 'normal' && (
                          <IconChevronRight
                            size={18}
                            className="text-gray-400 shrink-0"
                          />
                        )}
                      </button>

                      {isSelected && type.key !== 'normal' && (
                        <div className="pl-14 pr-2 pb-2">
                          <Label className="text-xs text-gray-500 mb-1.5 block">
                            Selecione a NF-e de origem *
                          </Label>
                          <Select
                            value={selectedNfeId}
                            onValueChange={setSelectedNfeId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a nota fiscal original..." />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingNfes ? (
                                <SelectItem value="loading" disabled>
                                  Carregando notas...
                                </SelectItem>
                              ) : nfeList.length === 0 ? (
                                <SelectItem value="empty" disabled>
                                  Nenhuma nota autorizada encontrada
                                </SelectItem>
                              ) : (
                                nfeList.map((nfe) => (
                                  <SelectItem key={nfe.id} value={nfe.id}>
                                    NF-e {nfe.numero}/{nfe.serie} -{' '}
                                    {nfe.destinatario?.nome ||
                                      'Cliente não informado'}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
                        ? `/nota-fiscal/emitir/avulsa/nfe?devolutionOf=${selectedNfeId}`
                        : selectedSpecialType === 'complementary'
                          ? `/nota-fiscal/emitir/avulsa/nfe?complementaryOf=${selectedNfeId}`
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
                          size={18}
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
            className={cn(
              step === 2 || selectedSpecialType !== 'normal'
                ? 'sm:justify-between'
                : 'justify-end',
            )}
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
            {step === 1 && selectedSpecialType !== 'normal' && (
              <>
                <div></div>
                <Button
                  RightIcon={IconChevronRight}
                  onClick={() => setStep(2)}
                  disabled={!selectedNfeId}
                >
                  Avançar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FiscalModuleGate>
  )
}
