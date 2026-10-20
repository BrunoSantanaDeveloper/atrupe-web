'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// TanStack Query
import { useQueryClient } from '@tanstack/react-query'
import { useClientAddresses } from '@/hooks/queries/useClientAddresses'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'

// UI
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormInputZipCode } from '@/components/common/form/FormInputZipCode'
import { RecipientFiscalFields } from '@/components/common/fiscal/RecipientFiscalFields'
import { COUNTRIES, getCountryNameByBacen } from '@/consts/country-codes'

// Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Icons
import { IconUserCheck, IconFileText, IconPlus } from '@tabler/icons-react'

// Masks / utils
import {
  maskCnpj,
  maskCpf,
  maskZipCode,
  MaskPhoneNumber,
  isValidCpfCnpj,
} from '@/lib/utils'

// Hooks
import { useDocumentSearch } from '@/hooks/useDocumentSearch'

// Types
import type { NfePrepareDestinatario } from '@/types/fiscal/nfe-prepare'

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({
  value: c.namePt,
  label: c.namePt,
}))

// ─── Brazil states ──────────────────────────────────────────────────────────
const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
].map((uf) => ({ value: uf, label: uf }))

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  destinatario: NfePrepareDestinatario
  /** clientId do cliente vinculado à NF — necessário para "Salvar no Cliente" */
  clientId?: string
  onSave: (
    updatedDestinatario: NfePrepareDestinatario,
    options: { updateClient: boolean },
  ) => void
}

// ─── Schema ──────────────────────────────────────────────────────────────────
// Limites conforme o layout da NF-e (leiaute 4.00, grupo E - Destinatário)
const recipientSchema = z
  .object({
    razaoSocial: z
      .string()
      .min(2, 'Razão social é obrigatória')
      .max(60, 'Máximo de 60 caracteres'),
    cnpjCpf: z.string().optional(),
    idEstrangeiro: z.string().optional(),
    stateRegistration: z.string().max(14, 'Máximo de 14 caracteres').optional(),
    indicadorIE: z.string().optional(),
    telefone: z.string().optional(),
    email: z
      .string()
      .max(60, 'Máximo de 60 caracteres')
      .optional()
      .refine(
        (value) => !value?.trim() || /^\S+@\S+\.\S+$/.test(value.trim()),
        'E-mail inválido',
      ),
    cep: z.string().optional(),
    estado: z.string().optional(),
    cidade: z.string().max(60, 'Máximo de 60 caracteres').optional(),
    bairro: z.string().max(60, 'Máximo de 60 caracteres').optional(),
    numero: z.string().max(60, 'Máximo de 60 caracteres').optional(),
    endereco: z.string().max(60, 'Máximo de 60 caracteres').optional(),
    complemento: z.string().max(60, 'Máximo de 60 caracteres').optional(),
    pais: z.string().min(1, 'País é obrigatório'),
    type: z.string().max(60, 'Máximo de 60 caracteres').optional(),
  })
  .superRefine((data, ctx) => {
    const addIssue = (path: keyof typeof data, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })

    const isForeign = !!data.pais && data.pais !== 'Brasil'

    if (!isForeign) {
      const documentDigits = (data.cnpjCpf || '').replace(/\D/g, '')
      if (!documentDigits) {
        addIssue('cnpjCpf', 'CNPJ/CPF é obrigatório')
      } else if (documentDigits.length !== 11 && documentDigits.length !== 14) {
        addIssue('cnpjCpf', 'Informe 11 dígitos (CPF) ou 14 (CNPJ)')
      } else if (!isValidCpfCnpj(documentDigits)) {
        addIssue(
          'cnpjCpf',
          documentDigits.length === 11 ? 'CPF inválido' : 'CNPJ inválido',
        )
      }

      const cepDigits = (data.cep || '').replace(/\D/g, '')
      if (!cepDigits) {
        addIssue('cep', 'CEP é obrigatório')
      } else if (cepDigits.length !== 8) {
        addIssue('cep', 'CEP deve ter 8 dígitos')
      }

      if (!data.estado?.trim()) addIssue('estado', 'UF é obrigatória')
      if (!data.bairro?.trim()) addIssue('bairro', 'Bairro é obrigatório')
    } else {
      const idEstrangeiro = (data.idEstrangeiro || '').trim()
      if (idEstrangeiro.length < 5 || idEstrangeiro.length > 20) {
        addIssue(
          'idEstrangeiro',
          'Identificação estrangeiro é obrigatória (5 a 20 caracteres)',
        )
      }
    }

    if (!data.cidade?.trim()) addIssue('cidade', 'Cidade é obrigatória')
    if (!data.endereco?.trim()) addIssue('endereco', 'Rua é obrigatória')
    if (!data.numero?.trim()) addIssue('numero', 'Número é obrigatório')

    const phoneDigits = (data.telefone || '').replace(/\D/g, '')
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      addIssue('telefone', 'Telefone deve ter DDD + 8 ou 9 dígitos')
    }
  })

type RecipientFormType = z.infer<typeof recipientSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Detecta se é CNPJ (14 dígitos) ou CPF (11 dígitos) e aplica máscara */
function maskDocument(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length > 11) return maskCnpj(digits)
  return maskCpf(digits)
}

// ─── Component ───────────────────────────────────────────────────────────────
export function InvoiceRecipientEditDialog({
  open,
  onOpenChange,
  destinatario,
  clientId: _clientId,
  onSave,
}: Props) {
  const { searchByDocument } = useDocumentSearch()
  const [isSearchingDocument, setIsSearchingDocument] = useState(false)

  const getDefaultValues = useCallback((): RecipientFormType => {
    // O país pode chegar como código BACEN ("1058") ou como nome ("BRASIL", vindo do XML
    // de uma NF-e já emitida — caso das devoluções). Normaliza para o nome exibido no select.
    const pais = getCountryNameByBacen(destinatario.pais)
    const ie = destinatario.ie || ''

    return {
      razaoSocial: destinatario.razaoSocial || '',
      // Valores vindos da API/XML chegam sem máscara — aplica na abertura do modal
      cnpjCpf: maskDocument(destinatario.cnpjCpf || ''),
      idEstrangeiro: destinatario.idEstrangeiro || '',
      stateRegistration: ie || 'ISENTO',
      indicadorIE: String(
        destinatario.indIEDest ?? (ie && ie !== 'ISENTO' ? 1 : 9),
      ),
      telefone: MaskPhoneNumber(destinatario.telefone),
      email: destinatario.email || '',
      cep: maskZipCode(destinatario.cep),
      estado: destinatario.estado || '',
      cidade: destinatario.cidade || '',
      bairro: destinatario.bairro || '',
      numero: destinatario.numero || '',
      endereco: destinatario.endereco || '',
      complemento: destinatario.complemento || '',
      pais,
      type: '',
    }
  }, [destinatario])

  const form = useForm<RecipientFormType>({
    resolver: zodResolver(recipientSchema),
    defaultValues: getDefaultValues(),
  })

  const { handleSubmit, reset, setValue, watch } = form

  const queryClient = useQueryClient()
  const { data: addresses } = useClientAddresses({ clientId: _clientId || '' })
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  )
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false)
  const [isSavingWithClient, setIsSavingWithClient] = useState(false)

  useEffect(() => {
    if (open && addresses && destinatario) {
      // CEP pode estar com ou sem máscara em cada origem — compara só os dígitos
      const destCepDigits = (destinatario.cep || '').replace(/\D/g, '')
      const matchingAddr = addresses.find(
        (a) =>
          (a.zipcode || '').replace(/\D/g, '') === destCepDigits &&
          a.street === destinatario.endereco &&
          a.number === destinatario.numero,
      )
      if (matchingAddr) {
        setSelectedAddressId(matchingAddr.id)
        setValue('type', matchingAddr.type || '')
      } else {
        setSelectedAddressId(null)
        setValue('type', '')
      }
    }
  }, [open, addresses, destinatario, setValue])

  const paisValue = watch('pais')
  const isForeign = paisValue && paisValue !== 'Brasil'

  // Documento carregado ao abrir o modal — a busca automática só vale para o que o
  // usuário digitar depois, senão o cadastro da Receita sobrescreveria o endereço já escolhido.
  const initialDocumentRef = useRef<string>('')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const defaults = getDefaultValues()
      initialDocumentRef.current = (defaults.cnpjCpf || '').replace(/\D/g, '')
      reset(defaults)
    }
  }, [open, getDefaultValues, reset])

  // ── CNPJ/CPF auto-fill ──────────────────────────────────────────────────
  const cnpjCpfValue = watch('cnpjCpf')

  const handleDocumentChange = useCallback(
    async (value: string) => {
      const digits = value.replace(/\D/g, '')
      const isComplete = digits.length === 14 || digits.length === 11

      if (!isComplete) return

      setIsSearchingDocument(true)
      try {
        const data = await searchByDocument(digits)
        if (!data) return

        setValue('razaoSocial', data.name || '')
        if (data.phone) setValue('telefone', MaskPhoneNumber(data.phone))
        if (data.address) {
          setValue('cep', maskZipCode(data.address.zipcode))
          setValue('estado', data.address.state || '')
          setValue('cidade', data.address.city || '')
          setValue('bairro', data.address.neighborhood || '')
          setValue('endereco', data.address.street || '')
          setValue('numero', data.address.number || '')
          setValue('complemento', data.address.complement || '')
        }
      } finally {
        setIsSearchingDocument(false)
      }
    },
    [searchByDocument, setValue],
  )

  // Watch para disparar busca automática quando CNPJ/CPF ficar completo
  useEffect(() => {
    if (!open || !cnpjCpfValue) return
    const digits = cnpjCpfValue.replace(/\D/g, '')
    if (digits === initialDocumentRef.current) return
    if (digits.length === 14 || digits.length === 11) {
      handleDocumentChange(cnpjCpfValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpjCpfValue, open])

  // ── Salvar ───────────────────────────────────────────────────────────────
  const buildDestinatario = (
    data: RecipientFormType,
  ): NfePrepareDestinatario => {
    const isForeignRecipient = !!data.pais && data.pais !== 'Brasil'

    return {
      razaoSocial: data.razaoSocial.trim(),
      cnpjCpf: isForeignRecipient ? '' : data.cnpjCpf || '',
      idEstrangeiro: isForeignRecipient ? data.idEstrangeiro?.trim() || '' : '',
      ie: data.stateRegistration || '',
      // Indicador de IE do destinatário (1 = contribuinte, 2 = isento, 9 = não contribuinte)
      indIEDest: Number(data.indicadorIE) || 9,
      email: data.email?.trim() || '',
      telefone: data.telefone || '',
      cep: data.cep || '',
      estado: data.estado || '',
      cidade: data.cidade || '',
      bairro: data.bairro || '',
      endereco: data.endereco || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      pais: data.pais || 'Brasil',
    }
  }

  /** O modal tem rolagem — avisa quando o bloqueio veio de um campo fora da área visível */
  const notifyInvalid = () =>
    toast.error('Verifique os campos destacados antes de salvar.')

  /** Salva apenas para a NF atual — não chama API */
  const handleSaveNfeOnly = handleSubmit((data) => {
    onSave(buildDestinatario(data), { updateClient: false })
    onOpenChange(false)
  }, notifyInvalid)

  /** Salva e também atualiza o cadastro do cliente (ou cria novo) */
  const handleSaveWithClient = handleSubmit(async (data) => {
    setIsSavingWithClient(true)
    try {
      if (_clientId) {
        if (selectedAddressId) {
          // 1. Atualizar o endereço selecionado do cliente
          const resAddress = await updateItemNew({
            route: `/address/${selectedAddressId}`,
            data: {
              type: data.type || 'Principal',
              zipcode: data.cep,
              state: data.estado,
              city: data.cidade,
              neighborhood: data.bairro,
              street: data.endereco,
              number: data.numero,
              complement: data.complemento,
            },
          })
          if (!resAddress.success) {
            throw new Error(resAddress.message || 'Erro ao atualizar endereço')
          }
        } else {
          // Criar novo endereço já que nenhum estava selecionado
          const resAddress = await createItemNew({
            route: `/address/client/${_clientId}`,
            data: {
              type: data.type || 'Principal',
              zipcode: data.cep,
              state: data.estado,
              city: data.cidade,
              neighborhood: data.bairro,
              street: data.endereco,
              number: data.numero,
              complement: data.complemento,
            },
          })
          if (!resAddress.success) {
            throw new Error(resAddress.message || 'Erro ao criar endereço')
          }
        }

        // 2. Atualizar o cadastro principal do cliente (Razão social, e-mail, etc.)
        const resClient = await updateItemNew({
          route: `/client/${_clientId}`,
          data: {
            general: {
              name: data.razaoSocial,
              email: data.email,
              phone: data.telefone,
              stateRegistration: data.stateRegistration,
              indicadorIE: Number(data.indicadorIE) || 9,
            },
          },
        })
        if (!resClient.success) {
          throw new Error(
            resClient.message || 'Erro ao atualizar dados gerais do cliente',
          )
        }

        await queryClient.invalidateQueries({
          queryKey: ['client-addresses', _clientId],
        })
        toast.success('Cadastro do cliente atualizado')
      }

      onSave(buildDestinatario(data), { updateClient: false })
      onOpenChange(false)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao atualizar cadastro'
      toast.error(errorMsg)
    } finally {
      setIsSavingWithClient(false)
    }
  }, notifyInvalid)

  /** Salva e cria um novo endereço no cadastro do cliente */
  const handleCreateNewAddress = handleSubmit(async (data) => {
    if (!_clientId) {
      toast.error('Nenhum cliente selecionado')
      return
    }

    setIsSavingNewAddress(true)
    try {
      const resAddress = await createItemNew({
        route: `/address/client/${_clientId}`,
        data: {
          type: data.type || 'Novo Endereço',
          zipcode: data.cep,
          state: data.estado,
          city: data.cidade,
          neighborhood: data.bairro,
          street: data.endereco,
          number: data.numero,
          complement: data.complemento,
        },
      })
      if (!resAddress.success) {
        throw new Error(resAddress.message || 'Erro ao cadastrar novo endereço')
      }

      // Atualizar o cadastro principal do cliente também (Razão social, e-mail, etc.)
      const resClient = await updateItemNew({
        route: `/client/${_clientId}`,
        data: {
          general: {
            name: data.razaoSocial,
            email: data.email,
            phone: data.telefone,
            stateRegistration: data.stateRegistration,
            indicadorIE: Number(data.indicadorIE) || 9,
          },
        },
      })
      if (!resClient.success) {
        throw new Error(
          resClient.message || 'Erro ao atualizar dados gerais do cliente',
        )
      }

      await queryClient.invalidateQueries({
        queryKey: ['client-addresses', _clientId],
      })
      toast.success('Novo endereço cadastrado no cliente')

      onSave(buildDestinatario(data), { updateClient: false })
      onOpenChange(false)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao cadastrar novo endereço'
      toast.error(errorMsg)
    } finally {
      setIsSavingNewAddress(false)
    }
  }, notifyInvalid)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>Editar destinatário</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form
              id="edit-recipient"
              className="flex flex-wrap gap-4"
              noValidate
            >
              {/* Seletor de endereço cadastrado */}
              {_clientId && addresses && addresses.length > 0 && (
                <div className="flex-[1_0_100%] flex flex-col gap-1.5 mb-2">
                  <label
                    htmlFor="recipient-saved-address"
                    className="text-sm font-medium text-gray-700"
                  >
                    Selecionar endereço cadastrado
                  </label>
                  <select
                    id="recipient-saved-address"
                    value={selectedAddressId || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => {
                      const selectedId = e.target.value
                      if (!selectedId) {
                        setSelectedAddressId(null)
                        setValue('type', '')
                        return
                      }

                      const addr = addresses.find((a) => a.id === selectedId)
                      if (addr) {
                        setValue('cep', maskZipCode(addr.zipcode))
                        setValue('estado', addr.state || '')
                        setValue('cidade', addr.city || '')
                        setValue('bairro', addr.neighborhood || '')
                        setValue('endereco', addr.street || '')
                        setValue('numero', addr.number || '')
                        setValue('complemento', addr.complement || '')
                        setValue('type', addr.type || '')
                        setSelectedAddressId(addr.id)
                      }
                    }}
                  >
                    <option value="">
                      -- Usar endereço personalizado / Digitar endereço --
                    </option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.type || 'Principal'} — {addr.street},{' '}
                        {addr.number} - {addr.city}/{addr.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Título do endereço */}
              {_clientId && (
                <FormInput
                  name="type"
                  label="Título do endereço"
                  placeholder="Ex: Sede, Fábrica, Filial SP"
                  width="flex-[1_0_100%]"
                  maxLength={60}
                />
              )}

              {/* País */}
              <FormSelect
                name="pais"
                label="País"
                options={COUNTRY_OPTIONS}
                width="flex-[1_0_100%]"
                additionalOnChange={(val) => {
                  if (val && val !== 'Brasil') {
                    setValue('cep', '')
                    setValue('estado', 'EX')
                    setValue('cidade', 'EXTERIOR')
                    setValue('bairro', '')
                    setValue('indicadorIE', '9')
                    setValue('stateRegistration', 'ISENTO')
                    setValue('cnpjCpf', '')
                  } else {
                    setValue('estado', '')
                    setValue('cidade', '')
                    setValue('cep', '')
                    setValue('idEstrangeiro', '')
                  }
                }}
              />

              {/* CNPJ/CPF com máscara + auto-preenchimento ou Identificação Estrangeiro */}
              {!isForeign ? (
                <FormInput
                  name="cnpjCpf"
                  label="CNPJ / CPF"
                  placeholder="00.000.000/0000-00"
                  width="flex-[1_0_280px]"
                  disabled={isSearchingDocument}
                  inputMode="numeric"
                  formatValue={(v) => {
                    if (!v) return ''
                    return maskDocument(String(v))
                  }}
                  additionalOnChange={(v) => {
                    if (!v) return
                    const masked = maskDocument(String(v))
                    setValue('cnpjCpf', masked)
                  }}
                  maxLength={18}
                />
              ) : (
                <FormInput
                  name="idEstrangeiro"
                  label="Identificação Estrangeiro"
                  placeholder="Passaporte ou ID (5 a 20 caracteres)"
                  width="flex-[1_0_280px]"
                  maxLength={20}
                />
              )}

              {/* Razão Social — linha quase inteira */}
              <FormInput
                name="razaoSocial"
                label="Razão social / Nome"
                width="flex-[2_0_360px]"
                disabled={isSearchingDocument}
                maxLength={60}
              />

              {/* Inscrição Estadual + Indicador IE — componente reutilizável */}
              {!isForeign && (
                <RecipientFiscalFields
                  namePrefix=""
                  fieldWidth="flex-[1_0_300px]"
                />
              )}

              {/* Telefone com máscara */}
              <FormInput
                name="telefone"
                label="Telefone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                width="flex-[1_0_200px]"
                additionalOnChange={(v) => {
                  if (v === null) return
                  setValue('telefone', MaskPhoneNumber(String(v)))
                }}
                maxLength={15}
              />

              {/* E-mail */}
              <FormInput
                name="email"
                label="E-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="contato@empresa.com.br"
                width="flex-[2_0_280px]"
                maxLength={60}
              />

              {/* CEP com auto-preenchimento */}
              {!isForeign && (
                <FormInputZipCode
                  name="cep"
                  label="CEP"
                  width="flex-[1_0_180px]"
                  addressFields={{
                    street: 'endereco',
                    neighborhood: 'bairro',
                    city: 'cidade',
                    state: 'estado',
                  }}
                />
              )}

              {/* Estado — Select com UFs brasileiras */}
              {!isForeign ? (
                <FormSelect
                  name="estado"
                  label="Estado (UF)"
                  options={BRAZIL_STATES}
                  width="flex-[1_0_140px]"
                />
              ) : (
                <FormInput
                  name="estado"
                  label="Estado (UF)"
                  width="flex-[1_0_140px]"
                  disabled
                />
              )}

              {/* Cidade */}
              <FormInput
                name="cidade"
                label="Cidade"
                width="flex-[2_0_220px]"
                disabled={!!isForeign}
                maxLength={60}
              />

              {/* Bairro */}
              {!isForeign && (
                <FormInput
                  name="bairro"
                  label="Bairro"
                  width="flex-[2_0_220px]"
                  maxLength={60}
                />
              )}

              {/* Rua */}
              <FormInput
                name="endereco"
                label="Rua"
                width="flex-[3_0_320px]"
                maxLength={60}
              />

              {/* Número */}
              <FormInput
                name="numero"
                label="Número"
                placeholder="S/N"
                width="flex-[1_0_100px]"
                maxLength={60}
              />

              {/* Complemento — linha completa */}
              <FormInput
                name="complemento"
                label="Complemento"
                width="flex-[1_0_100%]"
                maxLength={60}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <div className="flex items-center justify-end w-full gap-3 flex-wrap">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            {/* Alterar somente para NF — sem chamada de API no cliente */}
            <Button
              type="button"
              variant="neutralLight"
              RightIcon={IconFileText}
              onClick={handleSaveNfeOnly}
              disabled={form.formState.isSubmitting || isSearchingDocument}
            >
              Alterar somente para NF
            </Button>

            {/* Salvar como novo endereço no cliente */}
            {_clientId && (
              <Button
                type="button"
                variant="neutralOutline"
                RightIcon={IconPlus}
                onClick={handleCreateNewAddress}
                disabled={
                  isSavingNewAddress ||
                  isSavingWithClient ||
                  isSearchingDocument
                }
                isLoading={isSavingNewAddress}
              >
                Salvar como novo endereço
              </Button>
            )}

            {/* Salvar no Cliente — persiste no cadastro do cliente */}
            <Button
              type="button"
              RightIcon={IconUserCheck}
              onClick={handleSaveWithClient}
              disabled={
                isSavingWithClient || isSavingNewAddress || isSearchingDocument
              }
              isLoading={isSavingWithClient}
            >
              Salvar no Cliente
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
