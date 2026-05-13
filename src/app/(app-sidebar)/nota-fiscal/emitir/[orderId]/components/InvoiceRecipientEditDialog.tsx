'use client'

// React
import { useEffect, useState, useCallback } from 'react'

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

// Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Icons
import { IconPencil, IconUserCheck, IconFileText } from '@tabler/icons-react'

// Masks / utils
import { maskCnpj, maskCpf, MaskPhoneNumber } from '@/lib/utils'

// Hooks
import { useDocumentSearch } from '@/hooks/useDocumentSearch'

// Types
import type { NfePrepareDestinatario } from '@/types/fiscal/nfe-prepare'

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
const recipientSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  cnpjCpf: z.string().min(1, 'CNPJ/CPF é obrigatório'),
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
  clientId,
  onSave,
}: Props) {
  const { searchByDocument } = useDocumentSearch()
  const [isSearchingDocument, setIsSearchingDocument] = useState(false)

  const getDefaultValues = useCallback(
    (): RecipientFormType => ({
      razaoSocial: destinatario.razaoSocial || '',
      cnpjCpf: destinatario.cnpjCpf || '',
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
    }),
    [destinatario],
  )

  const form = useForm<RecipientFormType>({
    resolver: zodResolver(recipientSchema),
    defaultValues: getDefaultValues(),
  })

  const { handleSubmit, reset, setValue, watch } = form

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
    cnpjCpf: data.cnpjCpf,
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

  /** Salva e também atualiza o cadastro do cliente */
  const handleSaveWithClient = handleSubmit((data) => {
    onSave(buildDestinatario(data), { updateClient: true })
    onOpenChange(false)
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
              {/* CNPJ/CPF com máscara + auto-preenchimento */}
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
                  // Apply mask while typing
                  const masked = maskDocument(String(v))
                  setValue('cnpjCpf', masked)
                }}
                maxLength={18}
              />

              {/* Razão Social — linha quase inteira */}
              <FormInput
                name="razaoSocial"
                label="Razão social / Nome"
                width="flex-[2_0_360px]"
                disabled={isSearchingDocument}
              />

              {/* Inscrição Municipal */}
              <FormInput
                name="inscricaoMunicipal"
                label="Inscrição Municipal"
                width="flex-[1_0_240px]"
              />

              {/* Inscrição Estadual + Indicador IE — componente reutilizável */}
              <RecipientFiscalFields
                namePrefix=""
                fieldWidth="flex-[1_0_300px]"
              />

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

              {/* Estado — Select com UFs brasileiras */}
              <FormSelect
                name="estado"
                label="Estado (UF)"
                options={BRAZIL_STATES}
                width="flex-[1_0_140px]"
              />

              {/* Cidade */}
              <FormInput
                name="cidade"
                label="Cidade"
                width="flex-[2_0_220px]"
              />

              {/* Bairro */}
              <FormInput
                name="bairro"
                label="Bairro"
                width="flex-[2_0_220px]"
              />

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

            {/* Salvar no Cliente — persiste no cadastro */}
            {clientId && (
              <Button
                type="button"
                RightIcon={IconUserCheck}
                onClick={handleSaveWithClient}
                disabled={form.formState.isSubmitting || isSearchingDocument}
                isLoading={form.formState.isSubmitting}
              >
                Salvar no Cliente
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
