'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'

// Hooks
import { useAlertDialog } from '@/store/useAlertDialog'

// UI
import { toast } from 'sonner'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogDescription,
} from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

// Components
import { InvoiceFormHeader } from './InvoiceFormHeader'
import { InvoiceEmissionConfigSection } from '../../components/InvoiceEmissionConfigSection'
import { InvoiceRecipientSection } from './InvoiceRecipientSection'
import {
  InvoiceDeliveryAddressSection,
  type ClientAddressItem,
} from './InvoiceDeliveryAddressSection'
import { InvoiceItems } from './InvoiceItems'
import { InvoicePayment } from './InvoicePayment'
import { Topbar } from '@/components/common/Topbar'
import { InvoiceTransport } from './InvoiceTransport'
import { InvoiceDownloadAuth } from './InvoiceDownloadAuth'
import { InvoiceTotalsSection } from './InvoiceTotalsSection'
import { InvoiceRecipientEditDialog } from './InvoiceRecipientEditDialog'
import { CorrectionLetterDialog } from '@/components/common/fiscal/CorrectionLetterDialog'
import { NfePreviewDialog } from '@/components/common/fiscal/preview/NfePreviewDialog'
import { CorrectionHistorySection } from '@/components/common/fiscal/CorrectionHistorySection'
import {
  ClientSelect,
  clientToNfeRecipient,
  getConsumidorFinalFromClient,
} from '../../avulsa/components/ClientSelect'
import {
  getCountryNameByBacen,
  getBacenCodeByName,
} from '@/consts/country-codes'

// Icons
import {
  IconMessage,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconBan,
  IconUserSearch,
} from '@tabler/icons-react'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { totaisDosItensNaNota } from '@/lib/nota-fiscal-valores'

// Types
import type {
  NfePrepareResponse,
  NfePrepareItem,
  NfePrepareDestinatario,
  NfePrepareEntrega,
} from '@/types/fiscal/nfe-prepare'
import type { NfePreview } from '@/types/fiscal/nfe-preview'
import type { ClientData } from '../../avulsa/components/ClientSelect'

/**
 * Item no formato que o PATCH do rascunho aceita (NfeDraftItemDto). A API
 * recusa campo que não conhece, e o CFOP vai como número, como na emissão.
 */
function itemParaRascunho(item: NfePrepareItem) {
  const cfop = Number(String(item.cfop ?? '').replace(/\D/g, ''))
  return {
    itemNumber: item.itemNumber,
    productId: item.productId,
    productCode: item.productCode || undefined,
    description: item.description,
    ncm: item.ncm,
    cfop: Number.isInteger(cfop) && cfop > 0 ? cfop : undefined,
    cstIcms: item.cstIcms,
    cstIpi: item.cstIpi,
    cstPis: item.cstPis,
    cstCofins: item.cstCofins,
    unit: item.unit,
    uCom: item.uCom,
    ean: item.ean,
    ceantrib: item.ceantrib,
    quantity: item.quantity,
    unitValue: item.unitValue,
    discount: item.discount,
    freight: item.freight,
    insurance: item.insurance,
    totalValue: item.totalValue,
    isService: !!item.isService,
    needsConfiguration: !!item.needsConfiguration,
    sourceOrderId: item.sourceOrderId,
    sourceOrderCode: item.sourceOrderCode,
    // Para o diálogo ainda converter a unidade depois de reabrir a nota.
    pieceQuantity: item.pieceQuantity,
    measureQuantity: item.measureQuantity,
    measureUnit: item.measureUnit,
  }
}

interface Props {
  id?: string
  orderIds?: string[]
}

export function IssueInvoiceForm({ id, orderIds }: Props) {
  const alertDialog = useAlertDialog()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previa, setPrevia] = useState<NfePreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NfePrepareResponse | null>(null)
  const [originalItems, setOriginalItems] = useState<
    NfePrepareResponse['items'] | null
  >(null)
  const [isRecipientEditOpen, setIsRecipientEditOpen] = useState(false)
  const [isClientChangeOpen, setIsClientChangeOpen] = useState(false)
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  // Gravação dos itens no rascunho (ver salvarItensNoRascunho): só a lista
  // mais recente espera, e vai uma gravação por vez.
  const itensPendentes = useRef<{
    draftId: string
    origemItens?: string
    items: NfePrepareItem[]
  } | null>(null)
  const gravandoItens = useRef(false)
  // Gravação da cobrança (duplicatas e forma de pagamento) no rascunho, pelo
  // mesmo caminho dos itens: só a versão mais recente espera, uma por vez.
  const cobrancaPendente = useRef<{
    draftId: string
    duplicatas: NfePrepareResponse['duplicatas']
    pagamento: NfePrepareResponse['pagamento']
  } | null>(null)
  const gravandoCobranca = useRef(false)
  // A linha deixou de ser rascunho (emissão tentada): não adianta gravar.
  const rascunhoFechado = useRef(false)
  const isConsolidated = Boolean(orderIds?.length)

  // Fetch data on mount - create or get draft
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createItemNew(
        isConsolidated
          ? {
              route: '/fiscal/nfe/draft/consolidated',
              data: { orderIds },
            }
          : {
              route: `/fiscal/nfe/draft/${id}`,
              data: {},
            },
      )

      if (!result.success) {
        throw new Error(result.message || 'Erro ao carregar dados da NF-e')
      }

      const preparedData = {
        ...result.data,
        volumes: result.data.volumes || [],
        duplicatas: result.data.duplicatas || [],
        autXml: result.data.autXml || [],
      }

      if (preparedData.destinatario) {
        preparedData.destinatario.pais = getCountryNameByBacen(
          preparedData.destinatario.pais,
        )
      }

      setData(preparedData)
      setOriginalItems(
        preparedData.items.map((item: NfePrepareItem) => ({ ...item })),
      )
      // Rascunho recarregado: volta a gravar as edições.
      rascunhoFechado.current = false
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [id, isConsolidated, orderIds])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Recalculate totais from current items whenever data changes
  const computedTotais = data
    ? (() => {
        const productItems = data.items.filter((item) => !item.isService)
        // Itens arredondados como vão ao XML: a soma crua podia diferir um
        // centavo do vNF.
        const { valorProdutos, valorDesconto } =
          totaisDosItensNaNota(productItems)
        const valorFrete = productItems.reduce(
          (sum, item) => sum + item.freight,
          0,
        )
        const valorSeguro = productItems.reduce(
          (sum, item) => sum + item.insurance,
          0,
        )
        const valorNota =
          valorProdutos - valorDesconto + valorFrete + valorSeguro
        return {
          ...data.totais,
          valorProdutos: Number(valorProdutos.toFixed(2)),
          valorDesconto: Number(valorDesconto.toFixed(2)),
          valorFrete: Number(valorFrete.toFixed(2)),
          valorSeguro: Number(valorSeguro.toFixed(2)),
          valorNota: Number(valorNota.toFixed(2)),
        }
      })()
    : null

  // Check if any item value was manually edited vs original. Edição gravada
  // no rascunho volta marcada pelo backend (`itensEditados`): sem isso o aviso
  // sumia ao reabrir a nota, com os valores ainda diferentes dos da O.S.
  const valuesModified =
    data?.itensEditados === true ||
    (originalItems != null &&
      data != null &&
      data.items.some((item) => {
        const orig = originalItems.find((o) => o.itemNumber === item.itemNumber)
        if (!orig) return false
        return (
          item.unitValue !== orig.unitValue ||
          item.quantity !== orig.quantity ||
          item.discount !== orig.discount ||
          item.freight !== orig.freight ||
          item.insurance !== orig.insurance
        )
      }))

  /**
   * Pré-checagens que valem tanto para emitir quanto para pré-visualizar.
   * Devolve a chave referenciada já limpa, ou null quando algo impede seguir.
   */
  const validarAntesDeEnviar = (): { referencedKey: string } | null => {
    if (!data) return null

    const referencedKey = (data.emissao.nfeReferenciada || '').replace(
      /\D/g,
      '',
    )
    if (referencedKey.length > 0 && referencedKey.length !== 44) {
      toast.error('A NF-e referenciada deve conter uma chave com 44 digitos.')
      return null
    }

    const invalidItems = data.items.filter((item) => item.needsConfiguration)
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map((i) => i.description).join(', ')
      toast.error(
        `Existem produtos que precisam de configuração fiscal: ${itemNames}`,
      )
      return null
    }

    return { referencedKey }
  }

  /**
   * Corpo da emissão. A pré-visualização manda EXATAMENTE este objeto, para
   * o que o usuário confere ser o que será transmitido.
   */
  const montarPayload = (referencedKey: string) => {
    if (!data) return null
    return {
      orderId: data.orderId,
      orderIds: data.orderIds,
      quotationId: data.quotationId,
      operationNature: data.emissao.operationNature,
      tipo: data.emissao.tipo,
      finalidade: data.emissao.finalidade,
      consumidorFinal: data.emissao.consumidorFinal,
      presencaConsumidor: data.emissao.presencaConsumidor,
      dataSaida: data.emissao.dataSaida,
      nfeReferenciada: referencedKey || null,
      additionalInfo: data.informacoesComplementares,
      destCnpjCpf: data.destinatario.cnpjCpf || null,
      destNome: data.destinatario.razaoSocial,
      destIe: data.destinatario.ie,
      destEmail: data.destinatario.email,
      destEndereco: data.destinatario.endereco,
      destNumero: data.destinatario.numero,
      destComplemento: data.destinatario.complemento,
      destBairro: data.destinatario.bairro,
      destCep: data.destinatario.cep,
      destMunicipio: data.destinatario.cidade,
      destUf: data.destinatario.estado,
      destPais: getBacenCodeByName(data.destinatario.pais),
      destIndIEDest: data.destinatario.indIEDest ?? 9,
      destIdEstrangeiro: data.destinatario.idEstrangeiro || null,
      ...(data.entrega
        ? {
            entregaCnpjCpf: data.entrega.cnpjCpf || null,
            entregaEndereco: data.entrega.endereco,
            entregaNumero: data.entrega.numero,
            entregaComplemento: data.entrega.complemento || null,
            entregaBairro: data.entrega.bairro,
            entregaCep: data.entrega.cep,
            entregaMunicipio: data.entrega.cidade,
            entregaUf: data.entrega.estado,
          }
        : {}),
      items: data.items.map((item) => ({
        productId: item.productId,
        // Codigo cadastrado do produto: e ele que vira o cProd do XML e
        // aparece como "COD. PROD." no DANFE. Sem enviar, saia o UUID.
        productCode: item.productCode,
        quantity: item.quantity,
        unitValue: item.unitValue,
        discount: item.discount,
        description: item.description,
        ncm: item.ncm,
        cfop: item.cfop ? Number(item.cfop) : undefined,
        uCom: item.uCom,
        ean: item.ean,
        ceantrib: item.ceantrib,
        cstIcms: item.cstIcms,
        cstPis: item.cstPis,
        cstCofins: item.cstCofins,
        cstIpi: item.cstIpi,
        freight: item.freight,
        insurance: item.insurance,
      })),
      transportadora: data.transportadora,
      volumes: data.volumes,
      pagamento: {
        forma: data.pagamento?.forma,
        valor: data.pagamento?.valor,
      },
      duplicatas: data.duplicatas,
      autXml: data.autXml,
      modalidadeFrete: data.emissao.modalidadeFrete,
    }
  }

  const handlePreview = async () => {
    const validacao = validarAntesDeEnviar()
    if (!validacao) return

    const payload = montarPayload(validacao.referencedKey)
    if (!payload) return

    setIsPreviewing(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/nfe/preview',
        data: payload,
      })

      if (!result.success) {
        throw new Error(
          result.message || 'Não foi possível gerar a pré-visualização',
        )
      }

      setPrevia(result.data as NfePreview)
      setPreviewOpen(true)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível gerar a pré-visualização',
      )
    } finally {
      setIsPreviewing(false)
    }
  }

  // Handle emit
  const handleEmit = async () => {
    if (!data) return

    const validacao = validarAntesDeEnviar()
    if (!validacao) return

    const isNfeAuthorized =
      data.hasExistingNfe && data.existingNfe?.status === 'AUTHORIZED'
    if (isNfeAuthorized) {
      toast.info('Esta ordem já possui uma NF-e autorizada.')
      if (data.existingNfe?.danfeUrl) {
        window.open(data.existingNfe.danfeUrl, '_blank')
      }
      return
    }

    const payload = montarPayload(validacao.referencedKey)
    if (!payload) return

    setIsEmitting(true)

    try {
      const result = await createItemNew({
        route: isConsolidated
          ? '/fiscal/nfe/emit-consolidated'
          : '/fiscal/nfe/emit-full',
        data: payload,
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NF-e')
      }

      setPreviewOpen(false)
      toast.success('NF-e emitida com sucesso!')
      router.push('/nota-fiscal/emitir?tab=gestao')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir NF-e'
      alertDialog.open({
        title: 'Erro na emissão da NF-e',
        description: message,
        Icon: IconBan,
        iconVariant: 'error',
        confirmLabel: 'Entendi',
        cancelLabel: '',
        onConfirm: () => {},
      })
    } finally {
      setIsEmitting(false)
    }
  }

  const handleEmissionUpdate = async (
    updatedData: NfePrepareResponse,
    options?: { persist?: boolean },
  ) => {
    setData(updatedData)

    if (!updatedData.draftId || options?.persist === false) return

    try {
      const result = await updateItemNew({
        route: `/fiscal/nfe/draft/${updatedData.draftId}`,
        data: { emissao: updatedData.emissao },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao salvar configuracao')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar configuracao'
      toast.error(message)
    }
  }

  // Handle recipient update
  // - updateClient: false → apenas atualiza estado local, SEM chamada de API
  // - updateClient: true  → persiste no draft + atualiza cadastro do cliente
  const handleRecipientSave = async (
    updatedDestinatario: NfePrepareDestinatario,
    options: { updateClient: boolean },
  ) => {
    if (!data) return

    if (!options.updateClient) {
      // ── "Alterar somente para NF" — apenas estado local ──────────────────
      setData({ ...data, destinatario: updatedDestinatario })
      toast.success('Destinatário alterado para esta NF')
      return
    }

    // ── "Salvar no Cliente" — persiste no draft + atualiza cadastro ────────
    try {
      // 1. Persiste no draft (se existir)
      if (data.draftId) {
        const result = await updateItemNew({
          route: `/fiscal/nfe/draft/${data.draftId}`,
          data: { destinatario: updatedDestinatario },
        })
        if (!result.success) {
          throw new Error(
            result.message || 'Erro ao salvar destinatário no draft',
          )
        }
      }

      // 2. Atualiza cadastro do cliente
      if (data.clientId) {
        await updateItemNew({
          route: `/client/${data.clientId}`,
          data: {
            general: {
              name: updatedDestinatario.razaoSocial,
              email: updatedDestinatario.email,
              phone: updatedDestinatario.telefone,
              stateRegistration: updatedDestinatario.ie,
            },
          },
        })
        toast.success('Destinatário e cadastro do cliente atualizados')
      } else {
        // Sem clientId vinculado — avisa mas mantém o dado na NF
        toast.warning(
          'Dados salvos na NF, mas não foi possível identificar o cliente para atualizar o cadastro.',
        )
      }

      setData({ ...data, destinatario: updatedDestinatario })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar destinatário'
      toast.error(message)
    }
  }

  // Handle client change from ClientSelect dialog
  const handleClientChange = (client: ClientData | null) => {
    if (!client || !data) return

    const recipient = clientToNfeRecipient(client)
    const countryFriendlyName = client.country || 'Brasil'
    const updatedDestinatario: NfePrepareDestinatario = {
      razaoSocial: recipient.destNome,
      cnpjCpf: recipient.destCnpjCpf,
      ie: recipient.destIe,
      email: recipient.destEmail,
      telefone: '',
      cep: recipient.destCep,
      estado: recipient.destUf,
      cidade: recipient.destMunicipio,
      bairro: recipient.destBairro,
      endereco: recipient.destEndereco,
      numero: recipient.destNumero,
      complemento: recipient.destComplemento,
      pais: countryFriendlyName,
      idEstrangeiro: recipient.destIdEstrangeiro,
    }

    setData({
      ...data,
      destinatario: updatedDestinatario,
      clientId: client.id,
      emissao: {
        ...data.emissao,
        consumidorFinal: getConsumidorFinalFromClient(client),
      },
    })

    setIsClientChangeOpen(false)
    toast.success(`Cliente alterado para "${client.name}"`)
  }

  // Handlers for Delivery Address (Local de Entrega)
  const handleEntregaToggle = (enabled: boolean) => {
    if (!data) return
    if (enabled) {
      const defaultEntrega = data.clientAddresses?.[0]
        ? {
            cnpjCpf: data.destinatario.cnpjCpf,
            endereco: data.clientAddresses[0].street || '',
            numero: data.clientAddresses[0].number || 'S/N',
            complemento: data.clientAddresses[0].complement || '',
            bairro: data.clientAddresses[0].neighborhood || '',
            cidade: data.clientAddresses[0].city || '',
            estado: data.clientAddresses[0].state || '',
            cep: data.clientAddresses[0].zipcode || '',
          }
        : {
            cnpjCpf: data.destinatario.cnpjCpf,
            endereco: '',
            numero: 'S/N',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
          }
      setData({
        ...data,
        entrega: defaultEntrega,
        selectedAddressId: data.clientAddresses?.[0]?.id || null,
      })
      toast.success('Local de entrega habilitado')
    } else {
      setData({
        ...data,
        entrega: null,
        selectedAddressId: null,
      })
      toast.info('Local de entrega desabilitado')
    }
  }

  const handleEntregaAddressSelect = (address: ClientAddressItem | null) => {
    if (!data) return
    if (!address) {
      setData({
        ...data,
        selectedAddressId: null,
        entrega: {
          cnpjCpf: data.destinatario.cnpjCpf,
          endereco: '',
          numero: 'S/N',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      })
      return
    }
    setData({
      ...data,
      selectedAddressId: address.id,
      entrega: {
        cnpjCpf: data.destinatario.cnpjCpf,
        endereco: address.street || '',
        numero: address.number || 'S/N',
        complemento: address.complement || '',
        bairro: address.neighborhood || '',
        cidade: address.city || '',
        estado: address.state || '',
        cep: address.zipcode || '',
      },
    })
    toast.success(
      `Local de entrega alterado para "${address.label || 'Principal'}"`,
    )
  }

  const handleEntregaChange = (updatedEntrega: NfePrepareEntrega) => {
    if (!data) return
    setData({
      ...data,
      entrega: updatedEntrega,
    })
  }

  /**
   * Grava no rascunho a lista de itens que estiver esperando, uma gravação
   * por vez. Edições seguidas viram uma gravação só (cada uma leva a lista
   * inteira), e uma falha não impede as próximas.
   */
  const gravarItensPendentes = async () => {
    if (gravandoItens.current) return
    gravandoItens.current = true
    try {
      while (itensPendentes.current) {
        const { draftId, origemItens, items } = itensPendentes.current
        itensPendentes.current = null
        try {
          const result = await updateItemNew({
            route: `/fiscal/nfe/draft/${draftId}`,
            data: {
              items: items.map(itemParaRascunho),
              ...(origemItens ? { origemItens } : {}),
            },
          })
          if (result.success) continue
          if (result.code === 404) {
            // A linha deixou de ser rascunho: uma emissão foi tentada e
            // falhou. A edição vale para a próxima tentativa nesta tela.
            rascunhoFechado.current = true
            itensPendentes.current = null
            toast.info(
              'Esta nota já passou por uma tentativa de emissão: as alterações valem para emitir daqui, mas não ficam guardadas se você sair da tela.',
            )
            return
          }
          toast.error(
            result.message ||
              'Não foi possível guardar os itens no rascunho da nota.',
          )
        } catch {
          toast.error('Não foi possível guardar os itens no rascunho da nota.')
        }
      }
    } finally {
      gravandoItens.current = false
    }
  }

  /**
   * Grava os itens no rascunho. As edições ficavam só na tela: reabrir a nota
   * trazia de volta os valores de antes ("altera e volta para o valor
   * errado"). O backend guarda os itens até a O.S. mudar; aí vale a O.S. A
   * impressão da O.S. que veio com os itens volta junto: com ela, uma aba
   * aberta antes de a O.S. ser corrigida não faz a edição velha valer.
   */
  const salvarItensNoRascunho = (items: NfePrepareItem[]) => {
    const draftId = data?.draftId
    if (!draftId || rascunhoFechado.current) return

    const invalido = items.find(
      (item) =>
        !(item.quantity >= 0.001) ||
        !(item.unitValue >= 0) ||
        !((item.discount ?? 0) >= 0),
    )
    if (invalido) {
      toast.error(
        `O item "${invalido.description}" tem quantidade ou valor inválido; corrija para a edição ficar guardada na nota.`,
      )
      return
    }

    itensPendentes.current = {
      draftId,
      origemItens: data?.origemItens,
      items,
    }
    // Não rejeita: as falhas viram toast lá dentro.
    gravarItensPendentes()
  }

  /**
   * Grava no rascunho a cobrança que estiver esperando, uma gravação por vez.
   *
   * As duplicatas viviam só no estado da tela: nenhum rascunho da base jamais
   * guardou uma, e bastava recarregar a página para o que o usuário digitou
   * sumir — a nota saía sem cobrança e a DANFE sem duplicata.
   */
  const gravarCobrancaPendente = async () => {
    if (gravandoCobranca.current) return
    gravandoCobranca.current = true
    try {
      while (cobrancaPendente.current) {
        const { draftId, duplicatas, pagamento } = cobrancaPendente.current
        cobrancaPendente.current = null
        try {
          const result = await updateItemNew({
            route: `/fiscal/nfe/draft/${draftId}`,
            data: { duplicatas, ...(pagamento ? { pagamento } : {}) },
          })
          if (result.success) continue
          if (result.code === 404) {
            // A linha deixou de ser rascunho: uma emissão já foi tentada.
            rascunhoFechado.current = true
            cobrancaPendente.current = null
            return
          }
          toast.error(
            result.message ||
              'Não foi possível guardar as duplicatas no rascunho da nota.',
          )
        } catch {
          toast.error(
            'Não foi possível guardar as duplicatas no rascunho da nota.',
          )
        }
      }
    } finally {
      gravandoCobranca.current = false
    }
  }

  // Duplicatas e forma de pagamento editadas na tela
  const handlePaymentUpdate = (updatedData: NfePrepareResponse) => {
    setData(updatedData)

    const draftId = updatedData.draftId
    if (!draftId || rascunhoFechado.current) return

    cobrancaPendente.current = {
      draftId,
      duplicatas: updatedData.duplicatas || [],
      pagamento: updatedData.pagamento,
    }
    // Não rejeita: as falhas viram toast lá dentro.
    gravarCobrancaPendente()
  }

  // Item editado na tabela
  const handleItemsChange = (updatedData: NfePrepareResponse) => {
    setData(updatedData)
    salvarItensNoRascunho(updatedData.items)
  }

  // Handle add product
  const handleAddProduct = (item: NfePrepareItem) => {
    if (!data) return
    const newItems = [...data.items, item]
    setData({
      ...data,
      items: newItems,
    })
    salvarItensNoRascunho(newItems)
    toast.success(`Produto "${item.description}" adicionado`)
  }

  // Handle remove item
  const handleRemoveItem = (itemNumber: number) => {
    if (!data) return
    const newItems = data.items
      .filter((item) => item.itemNumber !== itemNumber)
      .map((item, idx) => ({
        ...item,
        itemNumber: idx + 1,
      }))
    setData({ ...data, items: newItems })
    salvarItensNoRascunho(newItems)
  }

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar
            title={
              isConsolidated ? 'Emissão consolidada de NF-e' : 'Emissão de NF-e'
            }
            previousPage="/nota-fiscal/emitir"
          />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar
            title={
              isConsolidated ? 'Emissão consolidada de NF-e' : 'Emissão de NF-e'
            }
            previousPage="/nota-fiscal/emitir"
          />
          <Card className="border-error-200 bg-error-50">
            <CardContent className="flex items-center gap-4 py-6">
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <p className="font-semibold text-error-700">
                  Erro ao carregar dados
                </p>
                <p className="text-sm text-error-600">
                  {error || 'Dados não encontrados'}
                </p>
              </div>
              <Button
                variant="neutralOutline"
                onClick={fetchData}
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

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-10">
        <InvoiceFormHeader
          data={data}
          isEmitting={isEmitting}
          onEmit={handleEmit}
          onPreview={handlePreview}
          isPreviewing={isPreviewing}
          onCorrectionLetter={() => setCorrectionDialogOpen(true)}
        />

        <NfePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          previa={previa}
          isEmitting={isEmitting}
          onEmit={handleEmit}
        />

        {/* Correction History */}
        {data.existingNfe && (
          <CorrectionHistorySection
            nfeId={data.existingNfe.id}
            status={data.existingNfe.status}
          />
        )}

        {/* Alert Area */}
        {data.emissao.ambiente === 'HOMOLOGACAO' && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-warning-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          <InvoiceEmissionConfigSection
            data={data}
            onUpdate={handleEmissionUpdate}
          />

          <InvoiceRecipientSection
            destinatario={data.destinatario}
            onEditClick={() => setIsRecipientEditOpen(true)}
            onChangeClientClick={() => setIsClientChangeOpen(true)}
          />

          <InvoiceDeliveryAddressSection
            entrega={data.entrega || null}
            clientId={data.clientId}
            selectedAddressId={data.selectedAddressId}
            pais={data.destinatario.pais}
            destinatarioAddress={data.destinatario}
            onEntregaToggle={handleEntregaToggle}
            onAddressSelect={handleEntregaAddressSelect}
            onEntregaChange={handleEntregaChange}
          />

          <InvoiceItems
            data={data}
            onUpdate={handleItemsChange}
            onAddProduct={handleAddProduct}
            onRemoveItem={handleRemoveItem}
          />

          <InvoiceTransport data={data} onUpdate={setData} />

          <InvoicePayment
            data={data}
            onUpdate={handlePaymentUpdate}
            computedValorNota={
              computedTotais?.valorNota ?? data?.totais?.valorNota ?? 0
            }
          />

          <InvoiceDownloadAuth data={data} onUpdate={setData} />

          {/* Info Complementar */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="info" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={IconMessage} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Informações complementares
                    </CardTitle>
                  </div>
                  <AccordionTrigger
                    className={cn(
                      buttonVariants({
                        variant: 'neutralLight',
                        size: 'icon',
                      }),
                      'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                    )}
                  />
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-6">
                    <Textarea
                      value={data.informacoesComplementares}
                      onChange={(e) =>
                        setData({
                          ...data,
                          informacoesComplementares: e.target.value,
                        })
                      }
                      placeholder="Texto que aparecerá no campo de informações adicionais da NF-e (ex.: dados fiscais, condições especiais, etc.)"
                      rows={4}
                      className="resize-none text-sm text-gray-700"
                    />
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          <InvoiceTotalsSection
            totais={computedTotais ?? data.totais}
            valuesModified={valuesModified}
          />
        </div>
      </div>

      {/* Recipient Edit Dialog */}
      <InvoiceRecipientEditDialog
        open={isRecipientEditOpen}
        onOpenChange={setIsRecipientEditOpen}
        destinatario={data.destinatario}
        clientId={data.clientId}
        onSave={handleRecipientSave}
      />

      {/* Change Client Dialog */}
      <Dialog open={isClientChangeOpen} onOpenChange={setIsClientChangeOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconUserSearch} />
                <span>Trocar cliente / destinatário</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ClientSelect
              onSelect={handleClientChange}
              label="Buscar cliente"
              placeholder="Buscar por nome ou CNPJ/CPF..."
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Correction Letter Dialog.
          authorizedAt usa dataEmissao como proxy do prazo de 720h: este payload
          nao traz dataAutorizacao e a emissao fica a minutos da autorizacao. O
          backend segue sendo a fonte da verdade e recusa envio fora do prazo. */}
      <CorrectionLetterDialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
        nfeId={data?.existingNfe?.id || null}
        authorizedAt={data?.existingNfe?.dataEmissao || null}
        onSuccess={fetchData}
      />
    </TooltipProvider>
  )
}
