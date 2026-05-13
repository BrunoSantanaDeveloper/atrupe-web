'use client'

// React
import { useEffect, useState } from 'react'

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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { RecipientFiscalFields } from '@/components/common/fiscal/RecipientFiscalFields'

// Form
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Icons
import { IconPencil, IconCircleCheck, IconUserCheck } from '@tabler/icons-react'

// Types
import type { NfePrepareDestinatario } from '@/types/fiscal/nfe-prepare'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  destinatario: NfePrepareDestinatario
  /** clientId do cliente vinculado à NF (necessário para "Atualizar cadastro") */
  clientId?: string
  onSave: (
    updatedDestinatario: NfePrepareDestinatario,
    options: { updateClient: boolean },
  ) => void
}

// Schema de validação
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

export function InvoiceRecipientEditDialog({
  open,
  onOpenChange,
  destinatario,
  clientId,
  onSave,
}: Props) {
  const [updateClient, setUpdateClient] = useState(false)

  // Form setup
  const form = useForm<RecipientFormType>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      razaoSocial: destinatario.razaoSocial || '',
      cnpjCpf: destinatario.cnpjCpf || '',
      inscricaoMunicipal: '',
      stateRegistration: destinatario.ie || 'ISENTO',
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
        stateRegistration: destinatario.ie || 'ISENTO',
        indicadorIE:
          destinatario.ie && destinatario.ie !== 'ISENTO' ? '1' : '9',
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
      setUpdateClient(false)
    }
  }, [open, destinatario, reset])

  // Handle form submission
  const onSubmit = (data: RecipientFormType) => {
    const updatedDestinatario: NfePrepareDestinatario = {
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
    }

    onSave(updatedDestinatario, { updateClient: updateClient && !!clientId })
    onOpenChange(false)
  }

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

              {/* Inscrição Estadual + Indicador IE — componente reutilizável */}
              <RecipientFiscalFields
                namePrefix=""
                fieldWidth="flex-[1_0_300px]"
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
          <div className="flex items-center justify-between w-full gap-4">
            {/* Toggle: atualizar cadastro do cliente */}
            {clientId && (
              <div className="flex items-center gap-2">
                <Switch
                  id="update-client-switch"
                  checked={updateClient}
                  onCheckedChange={setUpdateClient}
                />
                <Label
                  htmlFor="update-client-switch"
                  className="text-sm text-gray-600 cursor-pointer flex items-center gap-1.5"
                >
                  <IconUserCheck
                    size={15}
                    className="text-brand-600 shrink-0"
                  />
                  Atualizar cadastro do cliente
                </Label>
              </div>
            )}
            <div className="flex gap-3 ml-auto">
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
