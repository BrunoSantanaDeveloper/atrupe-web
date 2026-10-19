'use client'

// React
import { useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Third-party
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

// Actions
import { fetchResetPreview, resetCompanyData } from '@/actions/accountReset'

// Libs
import { formatCurrencyToBrl, maskCpfCnpj } from '@/lib/utils'
import { formatToLocaleDate } from '@/lib/formatDate'
import { cycleLabel } from '../billing'

// Types
import type { AccountItem } from '../Table/Data'
import type { ResetOptions, ResetPreview } from '@/types/accountReset'

// Icons
import { IconEraser } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: Pick<AccountItem, 'id' | 'companyName'> | null
}

const formSchema = z.object({
  confirmation: z.string().min(1, 'Digite o nome da empresa'),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

const DEFAULT_OPTIONS: ResetOptions = {
  includeFiscalDocuments: false,
  restoreDefaults: false,
}

// A mesma comparação do backend: sem diferença de maiúsculas e espaços.
const normalize = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLowerCase()

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : pluralForm}`

/**
 * "Zerar dados da conta": apaga documentos, cadastros e lançamentos e mantém
 * a conta — usuários e permissões, assinatura e cobrança, certificado e
 * configuração fiscal. Para o cliente que quer recomeçar sem contratar de novo.
 */
export function ResetDataDialog({ open, setOpen, rowData }: Props) {
  const [options, setOptions] = useState<ResetOptions>(DEFAULT_OPTIONS)
  const queryClient = useQueryClient()
  const companyId = rowData?.id

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['account-reset', 'preview', companyId, options],
    queryFn: () => fetchResetPreview(companyId!, options),
    enabled: open && !!companyId,
    placeholderData: keepPreviousData,
  })
  const preview = data?.success ? data.data : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { confirmation: '', password: '' },
  })
  const { handleSubmit, reset, watch } = form

  const companyName = preview?.company.name ?? rowData?.companyName ?? ''
  const nameMatches =
    !!companyName && normalize(watch('confirmation')) === normalize(companyName)

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
      setOptions(DEFAULT_OPTIONS)
    }
    setOpen(value)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!companyId) {
      toast.error('ID da empresa não encontrado')
      return
    }

    const res = await resetCompanyData(companyId, { ...values, ...options })
    if (!res.success || !res.data) {
      toast.error(res.message)
      return
    }

    const result = res.data
    queryClient.invalidateQueries({ queryKey: ['active-clients-list'] })
    queryClient.invalidateQueries({ queryKey: ['account-reset'] })
    toast.success(
      `Dados de ${result.companyName} zerados: ${plural(result.total, 'registro apagado', 'registros apagados')}.`,
      {
        description: [
          result.defaultsRestored
            ? 'Configurações de conta nova restauradas.'
            : null,
          `A cópia do que saiu fica disponível até ${formatToLocaleDate(result.backupExpiresAt)}, em "Dados zerados" no detalhe da conta.`,
        ]
          .filter(Boolean)
          .join(' '),
      },
    )
    if (result.warning) toast.warning(result.warning)
    handleOpenChange(false)
  }

  const fiscal = preview?.groups.find((g) => g.group === 'fiscal')
  const settings = preview?.groups.find((g) => g.group === 'settings')
  // Enquanto a prévia das opções novas não chega, a da anterior fica à vista:
  // não confirmar sobre ela.
  const canSubmit =
    !!preview && preview.totalToDelete > 0 && nameMatches && !isPlaceholderData

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] border-4 border-error">
        <DialogHeader>
          <DialogTitle className="pr-0">
            <div className="flex flex-col items-center gap-4 text-center">
              <FeaturedIcon
                variant="errorBorderedLight"
                Icon={IconEraser}
                size="lg"
                rounded
              />
              <span>Zerar dados da conta</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            <strong>{companyName}</strong>
            {preview?.company.cnpj
              ? ` · ${maskCpfCnpj(preview.company.cnpj)}`
              : null}
            <br />A conta continua, com os mesmos acessos e a mesma assinatura.
            Os dados apagados não voltam pelo sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!preview ? (
            isLoading || !data ? (
              <div className="space-y-2">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <p className="text-sm text-error text-center">{data.message}</p>
            )
          ) : (
            <>
              <DeletedSummary preview={preview} />

              <div className="space-y-3">
                {fiscal && fiscal.total > 0 ? (
                  <Option
                    id="reset-fiscal"
                    checked={options.includeFiscalDocuments}
                    onChange={(checked) =>
                      setOptions((o) => ({
                        ...o,
                        includeFiscalDocuments: checked,
                      }))
                    }
                    title={`Apagar também as notas fiscais (${fiscal.total.toLocaleString('pt-BR')})`}
                    description="Sem isso, as notas ficam no sistema, só sem o vínculo com orçamento e O.S. A numeração continua de onde parou."
                  />
                ) : null}
                <Option
                  id="reset-settings"
                  checked={options.restoreDefaults}
                  onChange={(checked) =>
                    setOptions((o) => ({ ...o, restoreDefaults: checked }))
                  }
                  title="Voltar às configurações de conta nova"
                  description={`Apaga categorias, naturezas, condições de pagamento, séries e contas bancárias${settings ? ` (${settings.total.toLocaleString('pt-BR')})` : ''} e recria o padrão do cadastro. Sem isso, elas ficam como estão.`}
                />
              </div>

              <KeptSummary preview={preview} />

              <Form {...form}>
                <form
                  id="reset-account-data"
                  className="space-y-3"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <FormInput
                    name="confirmation"
                    label={`Para confirmar, digite o nome da empresa: ${companyName}`}
                    placeholder={companyName}
                    width="w-full"
                    autoComplete="off"
                  />
                  <FormInput
                    name="password"
                    label="Senha gerencial"
                    type="password"
                    placeholder="Digite sua senha para confirmar"
                    width="w-full"
                    autoComplete="current-password"
                  />
                </form>
              </Form>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="reset-account-data"
            variant="error"
            isLoading={form.formState.isSubmitting}
            disabled={!canSubmit}
          >
            {preview && preview.totalToDelete > 0
              ? `Zerar ${plural(preview.totalToDelete, 'registro', 'registros')}`
              : 'Zerar dados'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeletedSummary({ preview }: { preview: ResetPreview }) {
  const groups = preview.groups.filter((g) => g.included && g.total > 0)

  return (
    <div className="bg-error-25 text-error border border-error-100 rounded-lg p-4">
      {groups.length ? (
        <>
          <p className="text-sm font-medium mb-2">Será apagado:</p>
          <ul className="space-y-2 text-sm">
            {groups.map((group) => (
              <li key={group.group}>
                <span className="font-medium">
                  {group.label} ({group.total.toLocaleString('pt-BR')})
                </span>
                <span className="block text-xs text-error-700">
                  {group.items
                    .filter((item) => item.count > 0)
                    .map(
                      (item) =>
                        `${item.label}: ${item.count.toLocaleString('pt-BR')}`,
                    )
                    .join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm font-medium">
          Não há documentos, cadastros nem lançamentos para apagar.
        </p>
      )}
    </div>
  )
}

function KeptSummary({ preview }: { preview: ResetPreview }) {
  const { kept, options } = preview
  const subscription = kept.subscription
  const fiscal = preview.groups.find((g) => g.group === 'fiscal')

  return (
    <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
      <p className="font-medium mb-2">Fica como está:</p>
      <ul className="space-y-1">
        <li>
          • Colaboradores, usuários e permissões (
          {plural(kept.employees, 'colaborador', 'colaboradores')},{' '}
          {kept.users.toLocaleString('pt-BR')} com acesso)
        </li>
        <li>
          • Assinatura e cobrança:{' '}
          {subscription
            ? `${subscription.plan}, ${formatCurrencyToBrl(Math.round(subscription.value * 100))} (${cycleLabel(subscription.cycle).toLowerCase()})`
            : 'nenhuma ativa'}
        </li>
        <li>
          • Fiscal: emissores e numeração das notas
          {kept.digitalCertificates > 0
            ? `, ${plural(kept.digitalCertificates, 'certificado digital', 'certificados digitais')}`
            : ''}
        </li>
        {!options.includeFiscalDocuments && fiscal && fiscal.total > 0 ? (
          <li>
            • Notas fiscais emitidas ({fiscal.total.toLocaleString('pt-BR')})
          </li>
        ) : null}
        {options.restoreDefaults ? null : (
          <li>
            • Configurações: categorias, condições de pagamento, séries e contas
            bancárias
          </li>
        )}
      </ul>
    </div>
  )
}

function Option({
  id,
  checked,
  onChange,
  title,
  description,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-sm font-medium text-gray-700">{title}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </label>
    </div>
  )
}
