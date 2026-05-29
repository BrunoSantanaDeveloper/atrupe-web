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

interface StandaloneNfseAddress {
  id?: string
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
  const [selectedAddress, setSelectedAddress] =
    useState<StandaloneNfseAddress | null>(null)

  // Form fields
  const [codigoServico, setCodigoServico] = useState('')
  const [discriminacao, setDiscriminacao] = useState('')
  const [aliquotaIss, setAliquotaIss] = useState<number>(0)
  const [issRetido, setIssRetido] = useState(false)
  const [valorServicos, setValorServicos] = useState<number>(0)

  const router = useRouter()

  const fetchDefaults = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getItem({
        route: '/fiscal/nfse/prepare-standalone',
      })

      if (!result.success || !result.data) {
        // Non-fatal: we can still work without defaults
        setPrepareData(null)
      } else {
        const data = result.data as PrepareStandaloneData
        setPrepareData(data)

        // Pre-fill fields from defaults
        if (data.aliquotaIss !== undefined) setAliquotaIss(data.aliquotaIss)
        if (data.issRetido !== undefined) setIssRetido(data.issRetido)
        if (data.codigoServico) setCodigoServico(data.codigoServico)
      }
    } catch {
      // Non-fatal: defaults loading failure shouldn't block the form
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
    setSelectedAddress(null)
  }

  const handleEmit = async () => {
    if (!selectedClient) {
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
      const tomador = clientToNfseTomador(selectedClient)
      if (selectedAddress) {
        tomador.endereco = selectedAddress.street || ''
        tomador.numero = selectedAddress.number || 'S/N'
        tomador.complemento = selectedAddress.complement || ''
        tomador.bairro = selectedAddress.neighborhood || ''
        tomador.cep = selectedAddress.zipcode || ''
        tomador.municipio = selectedAddress.city || ''
        tomador.uf = selectedAddress.state || ''
      }

      const payload = {
        // Tomador
        tomador,
        // Serviço
        codigoServico,
        discriminacao,
        valorServicos: Math.round(valorServicos * 100), // cents
        // Fiscal
        aliquotaIss: aliquotaIss || undefined,
        issRetido,
        // Optional RPS / config from prepare-standalone
        naturezaOperacao: prepareData?.naturezaOperacao,
        codigoMunicipio: prepareData?.codigoMunicipio,
        rpsSerie: prepareData?.rpsSerie,
        rpsNumero: prepareData?.rpsNumero,
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
  const tomadorDisplayClient = selectedClient
    ? tomadorToClientData(
        clientToNfseTomador(selectedClient),
        selectedClient.name,
      )
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
            client={
              selectedAddress
                ? { ...tomadorDisplayClient, address: [selectedAddress] }
                : tomadorDisplayClient
            }
            servicesTotal={formatCurrency(valorServicos)}
            clientId={selectedClient?.id}
            onAddressChange={setSelectedAddress}
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
                Valor dos Serviços (R$) *
              </label>
              <input
                id="valorServicos"
                type="number"
                min="0"
                step="0.01"
                value={valorServicos || ''}
                onChange={(e) => setValorServicos(Number(e.target.value))}
                placeholder="Ex: 500.00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
    </TooltipProvider>
  )
}
