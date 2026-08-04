'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

// UI
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import {
  ClientSelect,
  ClientData,
  clientToNfseTomador,
} from '../../components/ClientSelect'
import { NfseTomadorSection } from '../../../../emitir-nfse/[orderId]/components/NfseTomadorSection'
import { NfseDadosFiscaisSection } from '../../../../emitir-nfse/[orderId]/components/NfseDadosFiscaisSection'
import { NfseTotaisSection } from '../../../../emitir-nfse/[orderId]/components/NfseTotaisSection'
import { InvoiceDeliveryAddressSection } from '../../../../emitir/[orderId]/components/InvoiceDeliveryAddressSection'
import { InvoiceRecipientEditDialog } from '../../../../emitir/[orderId]/components/InvoiceRecipientEditDialog'
import { useClientAddresses } from '@/hooks/queries/useClientAddresses'
import type {
  NfePrepareEntrega,
  NfePrepareDestinatario,
} from '@/types/fiscal/nfe-prepare'

// Icons
import {
  IconX,
  IconArrowLeft,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertTriangleFilled,
} from '@tabler/icons-react'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrepareStandaloneData {
  rpsNumero?: number
  rpsSerie?: string
  naturezaOperacao?: number
  aliquotaIss?: number
  issRetido?: boolean
  codigoServico?: string
  codigoMunicipio?: number
  ambiente?: string
}

interface ClientAddressItem {
  id: string
  label?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
  type?: string
}

// Map ClientData (from ClientSelect) to the shape NfseTomadorSection expects
function tomadorToClientData(
  tomador: ReturnType<typeof clientToNfseTomador>,
  name: string,
) {
  return {
    name,
    cnpj: tomador.cnpj,
    cpf: tomador.cpf,
    email: tomador.email,
    address: tomador.endereco
      ? [
          {
            street: tomador.endereco,
            number: tomador.numero,
            complement: tomador.complemento,
            neighborhood: tomador.bairro,
            city: tomador.municipio,
            state: tomador.uf,
            zipcode: tomador.cep,
          },
        ]
      : undefined,
  }
}

function tomadorToDestinatario(
  tomador: ReturnType<typeof clientToNfseTomador>,
  client: ClientData,
  override: NfePrepareDestinatario | null,
): NfePrepareDestinatario {
  return {
    razaoSocial: tomador.razaoSocial,
    cnpjCpf: client.cnpjCpf || '',
    idEstrangeiro: tomador.idEstrangeiro,
    ie: client.ie || '',
    email: tomador.email,
    telefone: override?.telefone || client.phone || '',
    cep: tomador.cep,
    estado: tomador.uf,
    cidade: tomador.municipio,
    bairro: tomador.bairro,
    endereco: tomador.endereco,
    numero: tomador.numero,
    complemento: tomador.complemento,
    pais: client.country || 'Brasil',
  }
}

// ─── Currency input ────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseBRL(display: string): number {
  const digits = display.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}

interface CurrencyInputProps {
  id: string
  value: number
  onChange: (value: number) => void
}

function CurrencyInput({ id, value, onChange }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatBRL(value))

  useEffect(() => {
    setDisplay(formatBRL(value))
  }, [value])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
        R$
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        className="pl-9"
        placeholder="0,00"
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          if (digits === '') {
            setDisplay('')
            return
          }
          const num = Number(digits) / 100
          setDisplay(
            num.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          )
        }}
        onBlur={() => {
          const parsed = parseBRL(display || '0')
          onChange(parsed)
          setDisplay(formatBRL(parsed))
        }}
        onFocus={(e) => e.target.select()}
      />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StandaloneNfseForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prepare defaults
  const [prepareData, setPrepareData] = useState<PrepareStandaloneData | null>(
    null,
  )

  // Client / tomador
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [entrega, setEntrega] = useState<NfePrepareEntrega | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  )
  const [isTomadorEditOpen, setIsTomadorEditOpen] = useState(false)
  const [tomadorOverride, setTomadorOverride] =
    useState<NfePrepareDestinatario | null>(null)

  // Form fields
  const [codigoServico, setCodigoServico] = useState('')
  const [discriminacao, setDiscriminacao] = useState('')
  const [aliquotaIss, setAliquotaIss] = useState<number>(0)
  const [issRetido, setIssRetido] = useState(false)
  const [valorServicos, setValorServicos] = useState<number>(0)

  const router = useRouter()

  const { data: addresses } = useClientAddresses({
    clientId: selectedClient?.id || '',
  })

  // GET /client não retorna endereços, então o ClientSelect entrega o cliente
  // sem endereço; completamos com o primeiro endereço de /address/client/:id.
  const primaryAddress = addresses?.[0]

  const effectiveTomador = selectedClient
    ? (() => {
        const base = clientToNfseTomador(selectedClient)
        return {
          ...base,
          razaoSocial: tomadorOverride?.razaoSocial || base.razaoSocial,
          email: tomadorOverride?.email || base.email,
          endereco:
            tomadorOverride?.endereco ||
            base.endereco ||
            primaryAddress?.street ||
            '',
          numero:
            tomadorOverride?.numero ||
            base.numero ||
            primaryAddress?.number ||
            '',
          complemento:
            tomadorOverride?.complemento ||
            base.complemento ||
            primaryAddress?.complement ||
            '',
          bairro:
            tomadorOverride?.bairro ||
            base.bairro ||
            primaryAddress?.neighborhood ||
            '',
          municipio:
            tomadorOverride?.cidade ||
            base.municipio ||
            primaryAddress?.city ||
            '',
          uf: tomadorOverride?.estado || base.uf || primaryAddress?.state || '',
          cep:
            tomadorOverride?.cep || base.cep || primaryAddress?.zipcode || '',
        }
      })()
    : null

  const fetchDefaults = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getItem({
        route: '/fiscal/nfse/prepare-standalone',
      })

      if (!result.success || !result.data) {
        setPrepareData(null)
      } else {
        const data = result.data as PrepareStandaloneData
        setPrepareData(data)

        if (data.aliquotaIss !== undefined) setAliquotaIss(data.aliquotaIss)
        if (data.issRetido !== undefined) setIssRetido(data.issRetido)
        if (data.codigoServico) setCodigoServico(data.codigoServico)
      }
    } catch {
      setPrepareData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDefaults()
  }, [fetchDefaults])

  const handleClientSelect = (client: ClientData | null) => {
    setSelectedClient(client)
    setSelectedAddressId(null)
    setEntrega(null)
    setTomadorOverride(null)
  }

  const handleTomadorSave = (updated: NfePrepareDestinatario) => {
    setTomadorOverride(updated)
    setIsTomadorEditOpen(false)
    toast.success('Dados do tomador atualizados')
  }

  const handleEntregaToggle = (enabled: boolean) => {
    if (enabled) {
      const defaultEntrega = {
        cnpjCpf: selectedClient?.cnpjCpf || '',
        endereco: effectiveTomador?.endereco || '',
        numero: effectiveTomador?.numero || 'S/N',
        complemento: effectiveTomador?.complemento || '',
        bairro: effectiveTomador?.bairro || '',
        cidade: effectiveTomador?.municipio || '',
        estado: effectiveTomador?.uf || '',
        cep: effectiveTomador?.cep || '',
      }
      setEntrega(defaultEntrega)
      setSelectedAddressId(null)
      toast.success('Local de prestação habilitado')
    } else {
      setEntrega(null)
      setSelectedAddressId(null)
      toast.info('Local de prestação desabilitado')
    }
  }

  const handleEntregaAddressSelect = (address: ClientAddressItem | null) => {
    if (!address) {
      setSelectedAddressId(null)
      setEntrega({
        cnpjCpf: selectedClient?.cnpjCpf || '',
        endereco: '',
        numero: 'S/N',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      })
      return
    }
    setSelectedAddressId(address.id)
    setEntrega({
      cnpjCpf: selectedClient?.cnpjCpf || '',
      endereco: address.street || '',
      numero: address.number || 'S/N',
      complemento: address.complement || '',
      bairro: address.neighborhood || '',
      cidade: address.city || '',
      estado: address.state || '',
      cep: address.zipcode || '',
    })
    toast.success(
      `Local de prestação alterado para "${address.label || 'Principal'}"`,
    )
  }

  const handleEntregaChange = (updatedEntrega: NfePrepareEntrega) => {
    setEntrega(updatedEntrega)
  }

  const handleEmit = async () => {
    if (!selectedClient || !effectiveTomador) {
      toast.error('Selecione um cliente / tomador do serviço')
      return
    }
    if (!codigoServico.trim()) {
      toast.error('Código do serviço é obrigatório')
      return
    }
    if (!discriminacao.trim()) {
      toast.error('Discriminação do serviço é obrigatória')
      return
    }
    if (!valorServicos || valorServicos <= 0) {
      toast.error('Valor dos serviços deve ser maior que zero')
      return
    }

    setIsEmitting(true)

    try {
      const payload = {
        tomador: effectiveTomador,
        codigoServico,
        discriminacao,
        valorServicos,
        aliquotaIss: aliquotaIss || undefined,
        issRetido,
        naturezaOperacao: prepareData?.naturezaOperacao,
        codigoMunicipio: prepareData?.codigoMunicipio,
        ...(entrega
          ? {
              entregaEndereco: entrega.endereco,
              entregaNumero: entrega.numero,
              entregaComplemento: entrega.complemento || null,
              entregaBairro: entrega.bairro,
              entregaCep: entrega.cep,
              entregaMunicipio: entrega.cidade,
              entregaUf: entrega.estado,
            }
          : {}),
      }

      const result = await createItemNew({
        route: '/fiscal/nfse/emit-full',
        data: payload,
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFS-e')
      }

      toast.success('NFS-e avulsa emitida com sucesso!')
      router.push('/nota-fiscal/emitir?tab=gestao')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao emitir NFS-e'
      toast.error(message)
    } finally {
      setIsEmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const isHomologacao = prepareData?.ambiente === 'HOMOLOGACAO'

  // ─── Tomador display data ──────────────────────────────────────────────────
  const tomadorDisplayClient = effectiveTomador
    ? tomadorToClientData(effectiveTomador, effectiveTomador.razaoSocial)
    : undefined

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // ─── Error state (fatal) ───────────────────────────────────────────────────
  if (error) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Card className="border-error-200 bg-error-50">
            <CardContent className="flex items-center gap-4 py-6">
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <p className="font-semibold text-error-700">
                  Erro ao carregar configurações fiscais
                </p>
                <p className="text-sm text-error-600">{error}</p>
              </div>
              <Button
                variant="neutralOutline"
                onClick={fetchDefaults}
                className="ml-auto"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    )
  }

  // ─── Main form ─────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="iconSm"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => router.push('/nota-fiscal/emitir')}
                aria-label="Voltar para emissão avulsa"
              >
                <IconArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Nota Fiscal Avulsa — NFS-e
                </h1>
                {selectedClient && (
                  <span className="text-xl text-gray-400">
                    {selectedClient.name}
                  </span>
                )}
                <Badge variant="blueLight" className="ml-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  Em digitação
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <CustomButton
              icon={IconX}
              title="Cancelar digitação"
              iconVariant="errorLight"
              onClick={() => router.push('/nota-fiscal/emitir')}
            />
            <CustomButton
              icon={IconCircleCheck}
              title={isEmitting ? 'Emitindo...' : 'Emitir NFS-e'}
              iconVariant="successLight"
              onClick={handleEmit}
              disabled={isEmitting}
              isLoading={isEmitting}
            />
          </div>
        </div>

        {/* Homologação banner */}
        {isHomologacao && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-warning-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Client selection */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <ClientSelect
              onSelect={handleClientSelect}
              selectedClient={selectedClient}
              label="Cliente / Tomador do Serviço *"
              placeholder="Buscar cliente por nome ou CNPJ/CPF..."
            />
          </CardContent>
        </Card>

        {/* Tomador section — shown after client selected */}
        {tomadorDisplayClient && (
          <NfseTomadorSection
            client={tomadorDisplayClient}
            servicesTotal={formatCurrency(valorServicos)}
            onEditClick={() => setIsTomadorEditOpen(true)}
          />
        )}

        {selectedClient && (
          <InvoiceDeliveryAddressSection
            entrega={entrega}
            clientId={selectedClient.id}
            selectedAddressId={selectedAddressId}
            addresses={addresses}
            onEntregaToggle={handleEntregaToggle}
            onAddressSelect={handleEntregaAddressSelect}
            onEntregaChange={handleEntregaChange}
          />
        )}

        {/* Service value */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="valorServicos"
                className="text-sm font-medium text-gray-700"
              >
                Valor dos Serviços *
              </label>
              <CurrencyInput
                id="valorServicos"
                value={valorServicos}
                onChange={setValorServicos}
              />
              <p className="text-xs text-gray-500">
                Valor total bruto dos serviços prestados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fiscal data (service code, ISS, discriminação) */}
        <NfseDadosFiscaisSection
          codigoServico={codigoServico}
          aliquotaIss={aliquotaIss}
          issRetido={issRetido}
          discriminacao={discriminacao}
          onCodigoServicoChange={setCodigoServico}
          onAliquotaIssChange={setAliquotaIss}
          onIssRetidoChange={setIssRetido}
          onDiscriminacaoChange={setDiscriminacao}
        />

        {/* Totals */}
        <NfseTotaisSection
          servicesTotal={valorServicos}
          aliquotaIss={aliquotaIss}
          issRetido={issRetido}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Tomador edit dialog */}
      {selectedClient && effectiveTomador && (
        <InvoiceRecipientEditDialog
          open={isTomadorEditOpen}
          onOpenChange={setIsTomadorEditOpen}
          destinatario={tomadorToDestinatario(
            effectiveTomador,
            selectedClient,
            tomadorOverride,
          )}
          clientId={selectedClient.id}
          onSave={handleTomadorSave}
        />
      )}
    </TooltipProvider>
  )
}
