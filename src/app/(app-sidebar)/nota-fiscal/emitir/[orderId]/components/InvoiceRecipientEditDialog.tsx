'use client'

// React
import { useEffect } from 'react'

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

// Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Icons
import { IconPencil, IconCircleCheck } from '@tabler/icons-react'

// Types
import type { NfePrepareDestinatario } from '@/types/fiscal/nfe-prepare'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  destinatario: NfePrepareDestinatario
  onSave: (updatedDestinatario: NfePrepareDestinatario) => void
}

// Schema de validação
const recipientSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  cnpjCpf: z.string().min(1, 'CNPJ/CPF é obrigatório'),
  inscricaoMunicipal: z.string().optional(),
  ie: z.string().optional(),
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

// Indicador IE options
const indicadorIEOptions = [
  { value: '1', label: '1 - Contribuinte ICMS' },
  { value: '2', label: '2 - Contribuinte isento' },
  { value: '9', label: '9 - Não Contribuinte' },
]

export function InvoiceRecipientEditDialog({
  open,
  onOpenChange,
  destinatario,
  onSave,
}: Props) {
  // Form setup
  const form = useForm<RecipientFormType>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      razaoSocial: destinatario.razaoSocial || '',
      cnpjCpf: destinatario.cnpjCpf || '',
      inscricaoMunicipal: '',
      ie: destinatario.ie || '',
      indicadorIE: '9',
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
    },
  })

  const { handleSubmit, reset } = form

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        razaoSocial: destinatario.razaoSocial || '',
        cnpjCpf: destinatario.cnpjCpf || '',
        inscricaoMunicipal: '',
        ie: destinatario.ie || '',
        indicadorIE: '9',
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
      })
    }
  }, [open, destinatario, reset])

  // Handle form submission
  const onSubmit = (data: RecipientFormType) => {
    const updatedDestinatario: NfePrepareDestinatario = {
      razaoSocial: data.razaoSocial,
      cnpjCpf: data.cnpjCpf,
      ie: data.ie || '',
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
    }

    onSave(updatedDestinatario)
    onOpenChange(false)
  }

  // Handle modal close
  const handleToggleModal = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleModal}>
      <DialogContent className="sm:max-w-[720px]">
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
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-4"
              noValidate
            >
              {/* Razão Social - linha completa */}
              <FormInput
                name="razaoSocial"
                label="Razão social"
                width="flex-[1_0_100%]"
              />

              {/* CNPJ e Inscrição Municipal */}
              <FormInput name="cnpjCpf" label="CNPJ" width="flex-[1_0_300px]" />
              <FormInput
                name="inscricaoMunicipal"
                label="Inscrição Municipal"
                width="flex-[1_0_300px]"
              />

              {/* Inscrição Estadual e Indicador IE */}
              <FormInput
                name="ie"
                label="Inscrição Estadual"
                width="flex-[1_0_300px]"
              />
              <FormSelect
                name="indicadorIE"
                label="Indicador IE"
                options={indicadorIEOptions}
                width="flex-[1_0_300px]"
              />

              {/* Telefone e E-mail */}
              <FormInput
                name="telefone"
                label="Telefone"
                width="flex-[1_0_300px]"
              />
              <FormInput name="email" label="E-mail" width="flex-[1_0_300px]" />

              {/* CEP e Estado */}
              <FormInput name="cep" label="CEP" width="flex-[1_0_300px]" />
              <FormInput
                name="estado"
                label="Estado"
                width="flex-[1_0_300px]"
              />

              {/* Cidade e Bairro */}
              <FormInput
                name="cidade"
                label="Cidade"
                width="flex-[1_0_300px]"
              />
              <FormInput
                name="bairro"
                label="Bairro"
                width="flex-[1_0_300px]"
              />

              {/* Rua e Número */}
              <FormInput name="endereco" label="Rua" width="flex-[1_0_480px]" />
              <FormInput
                name="numero"
                label="Número"
                width="flex-[1_0_120px]"
              />

              {/* Complemento - linha completa */}
              <FormInput
                name="complemento"
                label="Complemento"
                width="flex-[1_0_100%]"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={handleToggleModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-recipient"
              RightIcon={IconCircleCheck}
              disabled={form.formState?.isSubmitting}
              isLoading={form.formState?.isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
