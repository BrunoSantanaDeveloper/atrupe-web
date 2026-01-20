'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
    IconSearch,
    IconDotsVertical,
    IconFileText, // For XML
    IconPrinter, // For PDF
    IconBan, // For Cancel
    IconDownload,
    IconEye,
    IconFileInvoice,
    IconRefresh,
} from '@tabler/icons-react'

// Actions
import { getData } from '@/actions/_cruds'

// Types
import { Nfe, Nfce, NfeStatus } from '@/types/fiscal/nfe'
import { useQuery } from '@tanstack/react-query'

async function getNfes(page = 1, limit = 20, search = '') {
    const result = await getData({
        route: '/fiscal/nfe',
        filters: { page, limit },
    })
    return result.success ? result.data : { items: [], total: 0 }
}

async function getNfces(page = 1, limit = 20, search = '') {
    const result = await getData({
        route: '/fiscal/nfce',
        filters: { page, limit },
    })
    return result.success ? result.data : { items: [], total: 0 }
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple' | 'blue' }> = {
    AUTHORIZED: { label: 'Autorizada', variant: 'success' },
    PROCESSING: { label: 'Processando', variant: 'warning' },
    REJECTED: { label: 'Rejeitada', variant: 'destructive' },
    CANCELLED: { label: 'Cancelada', variant: 'secondary' },
    ERROR: { label: 'Erro', variant: 'destructive' },
    DRAFT: { label: 'Rascunho', variant: 'outline' },
}

export function IssuedInvoicesClient() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('nfe')
    const [page, setPage] = useState(1)

    const { data: nfeData, isLoading: isLoadingNfe, refetch: refetchNfe } = useQuery({
        queryKey: ['nfes', page],
        queryFn: () => getNfes(page),
    })

    const { data: nfceData, isLoading: isLoadingNfce, refetch: refetchNfce } = useQuery({
        queryKey: ['nfces', page],
        queryFn: () => getNfces(page),
    })

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

    const renderTable = (items: (Nfe | Nfce)[], type: 'NFe' | 'NFCe') => {
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
                            const statusInfo = statusMap[item.status] || { label: item.status, variant: 'default' }
                            // Use type assertion or check properties safely
                            const clientName = item.quotation?.client?.corporateName || item.quotation?.client?.name || 'Cliente não identificado'

                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.numero}</span>
                                            <span className="text-xs text-gray-500">Série {item.serie}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{clientName}</TableCell>
                                    <TableCell>
                                        {item.dataEmissao ? format(new Date(item.dataEmissao), 'dd/MM/yyyy HH:mm') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <IconDotsVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                {item.danfeUrl && (
                                                    <DropdownMenuItem onClick={() => handleOpenDanfe(item.danfeUrl)}>
                                                        <IconPrinter className="mr-2 h-4 w-4" />
                                                        Ver DANFE (PDF)
                                                    </DropdownMenuItem>
                                                )}
                                                {item.xmlAutorizado && (
                                                    <DropdownMenuItem onClick={() => handleDownloadXml(item.xmlAutorizado, `NFe-${item.numero}`)}>
                                                        <IconFileText className="mr-2 h-4 w-4" />
                                                        Baixar XML
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    disabled={item.status !== 'AUTHORIZED'}
                                                    onClick={() => toast.info('Funcionalidade de cancelamento em breve')}
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Notas Fiscais Emitidas</h2>
                        <p className="text-muted-foreground">
                            Gerencie suas notas fiscais eletrônicas (NF-e) e de consumidor (NFC-e).
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => { refetchNfe(); refetchNfce(); }}>
                    <IconRefresh size={20} />
                </Button>
            </div>

            <Tabs defaultValue="nfe" onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="nfe">NF-e (Nota Fiscal Eletrônica)</TabsTrigger>
                    <TabsTrigger value="nfce">NFC-e (Consumidor)</TabsTrigger>
                </TabsList>
                <TabsContent value="nfe" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>NF-e Emitidas</CardTitle>
                            <CardDescription>Lista de notas fiscais modelo 55.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingNfe ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                renderTable(nfeData?.items || [], 'NFe')
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="nfce" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>NFC-e Emitidas</CardTitle>
                            <CardDescription>Lista de notas fiscais de consumidor modelo 65.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingNfce ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                renderTable(nfceData?.items || [], 'NFCe')
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
