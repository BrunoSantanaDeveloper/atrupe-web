'use client'

import { useEffect, useState, useCallback } from 'react'

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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormInputZipCode } from '@/components/common/form/FormInputZipCode'
import { RecipientFiscalFields } from '@/components/common/fiscal/RecipientFiscalFields'
import { COUNTRIES } from '@/consts/country-codes'

// Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Icons
import {
  IconPencil,
  IconUserCheck,
  IconFileText,
  IconPlus,
} from '@tabler/icons-react'

// Masks / utils
import { maskCnpj, maskCpf, MaskPhoneNumber } from '@/lib/utils'

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
const recipientSchema = z
  .object({
    razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
    cnpjCpf: z.string().optional(),
    idEstrangeiro: z.string().optional(),
    inscricaoMunicipal: z.string().optional(),
    stateRegistration: z.string().optional(),
    indicadorIE: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().optional(),
    cep: z.string().optional(),
    estado: z.string().optional(),
    cidade: z.string().optional(),
    bairro: z.string().optional(),
    numero: z.string().optional(),
    endereco: z.string().optional(),
    complemento: z.string().optional(),
    pais: z.string().optional(),
    type: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isForeign = data.pais && data.pais !== 'Brasil'
    if (!isForeign) {
      if (!data.cnpjCpf || data.cnpjCpf.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cnpjCpf'],
          message: 'CNPJ/CPF é obrigatório',
        })
      }
    } else {
      if (
        !data.idEstrangeiro ||
        data.idEstrangeiro.trim().length < 5 ||
        data.idEstrangeiro.trim().length > 20
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['idEstrangeiro'],
          message:
            'Identificação estrangeiro é obrigatória (5 a 20 caracteres)',
        })
      }
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

  const getDefaultValues = useCallback(
    (): RecipientFormType => ({
      razaoSocial: destinatario.razaoSocial || '',
      cnpjCpf: destinatario.cnpjCpf || '',
      idEstrangeiro: destinatario.idEstrangeiro || '',
      inscricaoMunicipal: '',
      stateRegistration: destinatario.ie || 'ISENTO',
      indicadorIE: destinatario.ie && destinatario.ie !== 'ISENTO' ? '1' : '9',
      telefone: destinatario.telefone || '',
      email: destinatario.email || '',
      cep: destinatario.cep || '',
      estado: destinatario.estado || '',
      cidade: destinatario.cidade || '',
      bairro: destinatario.bairro || '',
      numero: destinatario.numero || '',
      endereco: destinatario.endereco || '',
      complemento: destinatario.complemento || '',
      pais: destinatario.pais || 'Brasil',
      type: '',
    }),
    [destinatario],
  )

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
      const matchingAddr = addresses.find(
        (a) =>
          a.zipcode === destinatario.cep &&
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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset(getDefaultValues())
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
          setValue('cep', data.address.zipcode || '')
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
    if (!cnpjCpfValue) return
    const digits = cnpjCpfValue.replace(/\D/g, '')
    if (digits.length === 14 || digits.length === 11) {
      handleDocumentChange(cnpjCpfValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpjCpfValue])

  // ── Salvar ───────────────────────────────────────────────────────────────
  const buildDestinatario = (
    data: RecipientFormType,
  ): NfePrepareDestinatario => ({
    razaoSocial: data.razaoSocial,
    cnpjCpf: data.cnpjCpf || '',
    idEstrangeiro: data.idEstrangeiro || '',
    ie: data.stateRegistration || '',
    email: data.email || '',
    telefone: data.telefone || '',
    cep: data.cep || '',
    estado: data.estado || '',
    cidade: data.cidade || '',
    bairro: data.bairro || '',
    endereco: data.endereco || '',
    numero: data.numero || '',
    complemento: data.complemento || '',
    pais: data.pais || 'Brasil',
  })

  /** Salva apenas para a NF atual — não chama API */
  const handleSaveNfeOnly = handleSubmit((data) => {
    onSave(buildDestinatario(data), { updateClient: false })
    onOpenChange(false)
  })

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
        toast.success('Cadastro do cliente atualizado com sucesso!')
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
  })

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
      toast.success('Novo endereço cadastrado no cliente!')

      onSave(buildDestinatario(data), { updateClient: false })
      onOpenChange(false)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao cadastrar novo endereço'
      toast.error(errorMsg)
    } finally {
      setIsSavingNewAddress(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
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
                  <label className="text-sm font-medium text-gray-700">
                    Selecionar endereço cadastrado
                  </label>
                  <select
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
                        setValue('cep', addr.zipcode || '')
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
              />

              {/* Inscrição Municipal */}
              {!isForeign && (
                <FormInput
                  name="inscricaoMunicipal"
                  label="Inscrição Municipal"
                  width="flex-[1_0_240px]"
                />
              )}

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
                placeholder="(00) 00000-0000"
                width="flex-[1_0_200px]"
                additionalOnChange={(v) => {
                  if (v === null) return
                  setValue('telefone', MaskPhoneNumber(String(v)))
                }}
                maxLength={15}
              />

              {/* E-mail */}
              <FormInput name="email" label="E-mail" width="flex-[2_0_280px]" />

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
              {!isForeign ? (
                <FormInput
                  name="cidade"
                  label="Cidade"
                  width="flex-[2_0_220px]"
                />
              ) : (
                <FormInput
                  name="cidade"
                  label="Cidade"
                  width="flex-[2_0_220px]"
                  disabled
                />
              )}

              {/* Bairro */}
              {!isForeign && (
                <FormInput
                  name="bairro"
                  label="Bairro"
                  width="flex-[2_0_220px]"
                />
              )}

              {/* Rua */}
              <FormInput name="endereco" label="Rua" width="flex-[3_0_320px]" />

              {/* Número */}
              <FormInput
                name="numero"
                label="Número"
                width="flex-[1_0_100px]"
              />

              {/* Complemento — linha completa */}
              <FormInput
                name="complemento"
                label="Complemento"
                width="flex-[1_0_100%]"
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
