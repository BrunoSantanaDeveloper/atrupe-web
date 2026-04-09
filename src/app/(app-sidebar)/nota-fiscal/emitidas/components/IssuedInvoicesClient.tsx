'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'

// UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

// Icons
import {
  IconDotsVertical,
  IconFileText,
  IconPrinter,
  IconBan,
  IconFileInvoice,
  IconRefresh,
  IconPencil,
  IconHash,
  IconReceipt,
  IconCurrencyReal,
  IconCalendar,
  IconPlus,
} from '@tabler/icons-react'
import Link from 'next/link'

// Actions
import { getData, createItemNew } from '@/actions/_cruds'

// Types
import { Nfe, Nfce } from '@/types/fiscal/nfe'
import { useQuery } from '@tanstack/react-query'

async function getNfes(page = 1, limit = 20) {
  const result = await getData({
    route: '/fiscal/nfe',
    filters: { page: String(page), limit: String(limit) },
  })

  if (!result.success) {
    toast.error('Erro ao buscar notas fiscais: ' + result.message)
    return { items: [], total: 0 }
  }

  return result.data
}

async function getNfces(page = 1, limit = 20) {
  const result = await getData({
    route: '/fiscal/nfce',
    filters: { page: String(page), limit: String(limit) },
  })

  if (!result.success) {
    toast.error('Erro ao buscar notas fiscais (NFC-e): ' + result.message)
    return { items: [], total: 0 }
  }

  return result.data
}

async function getNfses(page = 1, limit = 20) {
  const result = await getData({
    route: '/fiscal/nfse',
    filters: { page: String(page), limit: String(limit) },
  })

  if (!result.success) {
    toast.error('Erro ao buscar NFS-e: ' + result.message)
    return { items: [], total: 0 }
  }

  return result.data
}

type BadgeVariant =
  | 'default'
  | 'outline'
  | 'success'
  | 'warning'
  | 'purple'
  | 'blue'
  | 'error'
  | 'neutral'

const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  AUTHORIZED: { label: 'Autorizada', variant: 'success' },
  PROCESSING: { label: 'Processando', variant: 'warning' },
  REJECTED: { label: 'Rejeitada', variant: 'error' },
  CANCELLED: { label: 'Cancelada', variant: 'neutral' },
  ERROR: { label: 'Erro', variant: 'error' },
  DRAFT: { label: 'Rascunho', variant: 'outline' },
}

export function IssuedInvoicesClient() {
  const [page] = useState(1)
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  const [correctionNfeId, setCorrectionNfeId] = useState<string | null>(null)
  const [correctionText, setCorrectionText] = useState('')
  const [isSendingCorrection, setIsSendingCorrection] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelNfeId, setCancelNfeId] = useState<string | null>(null)
  const [cancelJustificativa, setCancelJustificativa] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [inutDialogOpen, setInutDialogOpen] = useState(false)
  const [inutNumInicial, setInutNumInicial] = useState('')
  const [inutNumFinal, setInutNumFinal] = useState('')
  const [inutJustificativa, setInutJustificativa] = useState('')
  const [isInutilizando, setIsInutilizando] = useState(false)

  const {
    data: nfeData,
    isLoading: isLoadingNfe,
    refetch: refetchNfe,
  } = useQuery({
    queryKey: ['nfes', page],
    queryFn: () => getNfes(page),
  })

  const {
    data: nfceData,
    isLoading: isLoadingNfce,
    refetch: refetchNfce,
  } = useQuery({
    queryKey: ['nfces', page],
    queryFn: () => getNfces(page),
  })

  const {
    data: nfseData,
    isLoading: isLoadingNfse,
    refetch: refetchNfse,
  } = useQuery({
    queryKey: ['nfses', page],
    queryFn: () => getNfses(page),
  })

  const nfceSummary = useMemo(() => {
    const items: Nfce[] = nfceData?.items || []
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let countToday = 0
    let totalToday = 0
    let countMonth = 0
    let totalMonth = 0

    items.forEach((item) => {
      if (item.status !== 'AUTHORIZED') return
      const emDate = item.dataEmissao ? new Date(item.dataEmissao) : null
      if (!emDate) return

      const itemDateStr = format(emDate, 'yyyy-MM-dd')
      if (itemDateStr === todayStr) {
        countToday++
        totalToday += item.valorTotal || 0
      }
      if (emDate.getMonth() === currentMonth && emDate.getFullYear() === currentYear) {
        countMonth++
        totalMonth += item.valorTotal || 0
      }
    })

    return { countToday, totalToday, countMonth, totalMonth }
  }, [nfceData])

  const handleDownloadXml = (xml: string | undefined, filename: string) => {
    if (!xml) {
      toast.error('XML não disponível')
      return
    }
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.xml`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleOpenDanfe = (url: string | undefined) => {
    if (!url) {
      toast.error('DANFE não disponível')
      return
    }
    window.open(url, '_blank')
  }

  const handleCorrectionLetter = async () => {
    if (!correctionNfeId) return
    if (correctionText.length < 15) {
      toast.error('A correção deve ter no mínimo 15 caracteres.')
      return
    }
    if (correctionText.length > 1000) {
      toast.error('A correção deve ter no máximo 1000 caracteres.')
      return
    }

    setIsSendingCorrection(true)
    try {
      const result = await createItemNew({
        route: `/fiscal/nfe/${correctionNfeId}/correction-letter`,
        data: { correcao: correctionText },
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao enviar carta de correção')
      }
      toast.success('Carta de correção enviada com sucesso!')
      setCorrectionDialogOpen(false)
      setCorrectionText('')
      setCorrectionNfeId(null)
      refetchNfe()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar'
      toast.error(message)
    } finally {
      setIsSendingCorrection(false)
    }
  }

  const handleCancelNfe = async () => {
    if (!cancelNfeId) return
    if (cancelJustificativa.length < 15) {
      toast.error('A justificativa deve ter no mínimo 15 caracteres.')
      return
    }

    setIsCancelling(true)
    try {
      const result = await createItemNew({
        route: `/fiscal/nfe/${cancelNfeId}/cancel`,
        data: { justificativa: cancelJustificativa },
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao cancelar NF-e')
      }
      toast.success('NF-e cancelada com sucesso!')
      setCancelDialogOpen(false)
      setCancelJustificativa('')
      setCancelNfeId(null)
      refetchNfe()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar'
      toast.error(message)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleInutilizar = async () => {
    const numInicial = parseInt(inutNumInicial)
    const numFinal = parseInt(inutNumFinal)

    if (!numInicial || !numFinal) {
      toast.error('Informe os números inicial e final.')
      return
    }
    if (numInicial > numFinal) {
      toast.error('Número inicial deve ser menor ou igual ao final.')
      return
    }
    if (inutJustificativa.length < 15) {
      toast.error('A justificativa deve ter no mínimo 15 caracteres.')
      return
    }

    setIsInutilizando(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/nfe/inutilizar',
        data: {
          numeroInicial: numInicial,
          numeroFinal: numFinal,
          justificativa: inutJustificativa,
        },
      })
      if (!result.success) {
        throw new Error(result.message || 'Erro ao inutilizar')
      }
      toast.success(
        `Numeração ${numInicial} a ${numFinal} inutilizada com sucesso!`,
      )
      setInutDialogOpen(false)
      setInutNumInicial('')
      setInutNumFinal('')
      setInutJustificativa('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao inutilizar'
      toast.error(message)
    } finally {
      setIsInutilizando(false)
    }
  }

  const renderTable = (items: (Nfe | Nfce)[]) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <IconFileInvoice size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">Nenhuma nota fiscal encontrada</p>
          <p className="text-sm">As notas fiscais emitidas aparecerão aqui.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número / Série</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusInfo = statusMap[item.status] || {
                label: item.status,
                variant: 'default',
              }
              // Use type assertion or check properties safely
              const clientName =
                item.quotation?.client?.corporateName ||
                item.quotation?.client?.name ||
                'Cliente não identificado'

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.numero}</span>
                      <span className="text-xs text-gray-500">
                        Série {item.serie}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{clientName}</TableCell>
                  <TableCell>
                    {item.dataEmissao
                      ? format(new Date(item.dataEmissao), 'dd/MM/yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.valorTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        {item.danfeUrl && (
                          <DropdownMenuItem
                            onClick={() => handleOpenDanfe(item.danfeUrl)}
                          >
                            <IconPrinter className="mr-2 h-4 w-4" />
                            Ver DANFE (PDF)
                          </DropdownMenuItem>
                        )}
                        {item.xmlAutorizado && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleDownloadXml(
                                item.xmlAutorizado,
                                `NFe-${item.numero}`,
                              )
                            }
                          >
                            <IconFileText className="mr-2 h-4 w-4" />
                            Baixar XML
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {item.status === 'AUTHORIZED' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setCorrectionNfeId(item.id)
                              setCorrectionText('')
                              setCorrectionDialogOpen(true)
                            }}
                          >
                            <IconPencil className="mr-2 h-4 w-4" />
                            Carta de Correção
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={item.status !== 'AUTHORIZED'}
                          onClick={() => {
                            setCancelNfeId(item.id)
                            setCancelJustificativa('')
                            setCancelDialogOpen(true)
                          }}
                        >
                          <IconBan className="mr-2 h-4 w-4" />
                          Cancelar Nota
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Notas Fiscais Emitidas
            </h2>
            <p className="text-muted-foreground">
              Gerencie suas notas fiscais eletrônicas (NF-e) e de consumidor
              (NFC-e).
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            refetchNfe()
            refetchNfce()
            refetchNfse()
          }}
        >
          <IconRefresh size={20} />
        </Button>
      </div>

      <Tabs defaultValue="nfe" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nfe">NF-e (Nota Fiscal Eletrônica)</TabsTrigger>
          <TabsTrigger value="nfse">NFS-e (Serviços)</TabsTrigger>
          <TabsTrigger value="nfce">NFC-e (Consumidor)</TabsTrigger>
        </TabsList>
        <TabsContent value="nfe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NF-e Emitidas</CardTitle>
              <CardDescription>
                Lista de notas fiscais modelo 55.
              </CardDescription>
            </CardHeader>
            <div className="flex gap-2 px-6 pb-4">
              <Button
                variant="neutralOutline"
                size="sm"
                onClick={() => {
                  setInutNumInicial('')
                  setInutNumFinal('')
                  setInutJustificativa('')
                  setInutDialogOpen(true)
                }}
              >
                <IconHash className="h-4 w-4 mr-1" />
                Inutilizar Numeração
              </Button>
            </div>
            <CardContent>
              {isLoadingNfe ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                renderTable(nfeData?.items || [])
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nfse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NFS-e Emitidas</CardTitle>
              <CardDescription>
                Lista de notas fiscais de serviço eletrônicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNfse ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !nfseData?.items?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <IconFileInvoice size={48} className="mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma NFS-e encontrada</p>
                  <p className="text-sm">As notas fiscais de serviço emitidas aparecerão aqui.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número / Série</TableHead>
                        <TableHead>Tomador</TableHead>
                        <TableHead>Emissão</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nfseData.items.map((nfse: any) => {
                        const nfseStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
                          AUTHORIZED: { label: 'Autorizada', variant: 'success' },
                          PENDING: { label: 'Pendente', variant: 'warning' },
                          PROCESSING: { label: 'Processando', variant: 'warning' },
                          REJECTED: { label: 'Rejeitada', variant: 'error' },
                          CANCELLED: { label: 'Cancelada', variant: 'neutral' },
                          ERROR: { label: 'Erro', variant: 'error' },
                        }
                        const nfseStatus = nfseStatusMap[nfse.status as string] || { label: nfse.status, variant: 'default' as BadgeVariant }

                        const tomador =
                          nfse.quotation?.client?.corporateName ||
                          nfse.quotation?.client?.name ||
                          nfse.order?.quotation?.client?.name ||
                          'Tomador não identificado'

                        return (
                          <TableRow key={nfse.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{nfse.numero}</span>
                                <span className="text-xs text-gray-500">
                                  Série {nfse.serie}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{tomador}</TableCell>
                            <TableCell>
                              {nfse.dataEmissao
                                ? format(new Date(nfse.dataEmissao), 'dd/MM/yyyy HH:mm')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {(nfse.valorServicos || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={nfseStatus.variant}>
                                {nfseStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {nfse.pdfUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => window.open(nfse.pdfUrl, '_blank')}
                                  title="Ver PDF"
                                >
                                  <IconPrinter className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nfce" className="space-y-4">
          {/* NFC-e Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Vendas Hoje</CardTitle>
                <IconReceipt className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nfceSummary.countToday}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {nfceSummary.totalToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Vendas no Mês</CardTitle>
                <IconCalendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nfceSummary.countMonth}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {nfceSummary.totalMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ticket Médio (Mês)</CardTitle>
                <IconCurrencyReal className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nfceSummary.countMonth > 0
                    ? (nfceSummary.totalMonth / nfceSummary.countMonth).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'R$ 0,00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Valor médio por venda</p>
              </CardContent>
            </Card>
            <Card className="bg-brand-25 border-brand-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-brand-700">Nova Venda</CardTitle>
                <IconPlus className="h-4 w-4 text-brand-500" />
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full mt-1">
                  <Link href="/nota-fiscal/emitir-nfce">
                    <IconReceipt className="h-4 w-4 mr-2" />
                    Abrir PDV
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* NFC-e Table */}
          <Card>
            <CardHeader>
              <CardTitle>NFC-e Emitidas</CardTitle>
              <CardDescription>
                Lista de notas fiscais de consumidor modelo 65.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNfce ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                renderTable(nfceData?.items || [])
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    {/* Carta de Correção Dialog */}
    <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Carta de Correção (CC-e)</DialogTitle>
          <DialogDescription>
            Informe o texto da correção. A carta de correção não corrige valor,
            dados cadastrais ou alíquota. Mínimo 15 caracteres.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Label htmlFor="correctionText">Texto da Correção *</Label>
          <Textarea
            id="correctionText"
            value={correctionText}
            onChange={(e) => setCorrectionText(e.target.value)}
            placeholder="Descreva a correção a ser feita na nota fiscal..."
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 text-right">
            {correctionText.length}/1000 caracteres
            {correctionText.length > 0 && correctionText.length < 15 && (
              <span className="text-orange-500 ml-2">Mínimo 15 caracteres</span>
            )}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCorrectionDialogOpen(false)}
            disabled={isSendingCorrection}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCorrectionLetter}
            disabled={isSendingCorrection || correctionText.length < 15}
          >
            {isSendingCorrection ? 'Enviando...' : 'Enviar Carta de Correção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Cancelamento Dialog */}
    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Cancelar NF-e</DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. A nota será cancelada junto à SEFAZ.
            Informe a justificativa (mínimo 15 caracteres).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Label htmlFor="cancelJustificativa">Justificativa *</Label>
          <Textarea
            id="cancelJustificativa"
            value={cancelJustificativa}
            onChange={(e) => setCancelJustificativa(e.target.value)}
            placeholder="Informe o motivo do cancelamento..."
            rows={4}
            maxLength={255}
          />
          <p className="text-xs text-gray-500 text-right">
            {cancelJustificativa.length}/255 caracteres
            {cancelJustificativa.length > 0 && cancelJustificativa.length < 15 && (
              <span className="text-orange-500 ml-2">Mínimo 15 caracteres</span>
            )}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCancelDialogOpen(false)}
            disabled={isCancelling}
          >
            Voltar
          </Button>
          <Button
            variant="error"
            onClick={handleCancelNfe}
            disabled={isCancelling || cancelJustificativa.length < 15}
          >
            {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Inutilização Dialog */}
    <Dialog open={inutDialogOpen} onOpenChange={setInutDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inutilizar Numeração NF-e</DialogTitle>
          <DialogDescription>
            Inutilize uma faixa de numeração que não será utilizada.
            A numeração inutilizada não poderá ser usada para emissão.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inutNumInicial">Número Inicial *</Label>
              <Input
                id="inutNumInicial"
                type="number"
                min={1}
                value={inutNumInicial}
                onChange={(e) => setInutNumInicial(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inutNumFinal">Número Final *</Label>
              <Input
                id="inutNumFinal"
                type="number"
                min={1}
                value={inutNumFinal}
                onChange={(e) => setInutNumFinal(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inutJustificativa">Justificativa *</Label>
            <Textarea
              id="inutJustificativa"
              value={inutJustificativa}
              onChange={(e) => setInutJustificativa(e.target.value)}
              placeholder="Informe o motivo da inutilização..."
              rows={4}
              maxLength={255}
            />
            <p className="text-xs text-gray-500 text-right">
              {inutJustificativa.length}/255 caracteres
              {inutJustificativa.length > 0 && inutJustificativa.length < 15 && (
                <span className="text-orange-500 ml-2">Mínimo 15 caracteres</span>
              )}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setInutDialogOpen(false)}
            disabled={isInutilizando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleInutilizar}
            disabled={
              isInutilizando ||
              !inutNumInicial ||
              !inutNumFinal ||
              inutJustificativa.length < 15
            }
          >
            {isInutilizando ? 'Inutilizando...' : 'Confirmar Inutilização'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
