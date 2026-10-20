'use client'

// React
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

// Components
import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { FormInput } from '@/components/common/form/FormInput'
import { PasswordValidation } from '@/components/common/form/PasswordValidation'
import { TermsDialog } from '@/app/(blank-layout-pages)/assinatura/contratacao/components/TermsDialog'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Actions
import {
  acceptTransferInvite,
  checkInviteRepresentative,
  lookupInviteCompany,
  openTransferInvite,
} from '@/actions/ownership'

// Lib
import { isValidCnpj, isValidCpf, maskCnpj, maskCpf } from '@/lib/utils'

// Third-party
import { signIn } from 'next-auth/react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'

// Types
import type {
  InviteCompanyView,
  TransferInvite as Invite,
} from '@/types/ownership'
import { inviteSchema, type InviteForm } from './schema'

type RegistryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; data: InviteCompanyView }
  | { status: 'manual'; message: string }
  | { status: 'in-use' }

type RepresentativeState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'verified'; name: string; qualification?: string }
  | { status: 'unverifiable' }
  | { status: 'rejected'; message: string }

const CNPJ_IN_USE_MESSAGE =
  'Este CNPJ já tem um ambiente na Atrupe. A transferência precisa ser para uma empresa que ainda não tem ambiente.'

/**
 * O convite de transferência, do lado de quem recebe.
 *
 * Uma tela só, com conta, empresa e Termos: a spec leva quem cria a conta
 * direto ao aceite, sem login separado no meio — dois passos criariam
 * justamente o intervalo em que a pessoa acha que aceitou e não aceitou. Um
 * convite que não vale mais diz por quê antes de pedir qualquer dado, e o
 * e-mail que já tem conta é recusado sem oferecer login: entrar com ela não
 * aceitaria a transferência.
 */
export function TransferInvite({ token }: { token: string }) {
  const {
    data: res,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['transfer-invite', token],
    queryFn: () => openTransferInvite(token),
    staleTime: Infinity,
    retry: false,
  })
  // Recusas vindas do aceite (convite cancelado no meio, e-mail que ganhou
  // conta) trocam a tela sem nova consulta.
  const [override, setOverride] = useState<Invite | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const invite: Invite | undefined =
    override ?? (res?.success ? res.data : undefined)

  if (!invite) {
    return (
      <Unavailable
        message={res?.message ?? 'Não foi possível abrir o convite agora.'}
      />
    )
  }
  if (invite.state !== 'PENDING') {
    return <Unavailable message={invite.message ?? ''} />
  }
  if (invite.emailHasAccount) {
    return (
      <div className="flex flex-col gap-3 text-center" data-conta-existente>
        <h1 className="text-xl font-semibold text-gray-900">
          Este e-mail já tem conta
        </h1>
        <p className="text-sm text-gray-500">
          A transferência exige uma conta nova, porque o ambiente inteiro passa
          a pertencer a ela. Peça a quem enviou um convite para outro e-mail.
        </p>
      </div>
    )
  }
  if (invite.blocked) {
    return (
      <Unavailable
        title="Transferência indisponível no momento"
        message={invite.blocked.message}
        hideLogin
      />
    )
  }

  return (
    <InviteAcceptForm
      token={token}
      invite={invite}
      onRefused={(next) => setOverride(next)}
      onTermsOutdated={() => refetch()}
    />
  )
}

function Unavailable({
  title = 'Transferência indisponível',
  message,
  hideLogin = false,
}: {
  title?: string
  message: string
  hideLogin?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 text-center" data-convite-invalido>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500">{message}</p>
      {!hideLogin && (
        <Button asChild variant="neutralOutline">
          <Link href="/login">Ir para o login</Link>
        </Button>
      )}
    </div>
  )
}

function InviteAcceptForm({
  token,
  invite,
  onRefused,
  onTermsOutdated,
}: {
  token: string
  invite: Invite
  onRefused: (invite: Invite) => void
  onTermsOutdated: () => void
}) {
  const router = useRouter()
  const [registry, setRegistry] = useState<RegistryState>({ status: 'idle' })
  const [representative, setRepresentative] = useState<RepresentativeState>({
    status: 'idle',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const lookupSeq = useRef(0)
  const representativeSeq = useRef(0)

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      cnpj: '',
      legalName: '',
      tradeName: '',
      representativeCpf: '',
      representativeIsSelf: true,
      representativeName: '',
    },
  })
  const {
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = form
  const values = useWatch({ control: form.control })

  const handleRepresentativeCpfChange = (masked: string) => {
    const cnpj = (getValues('cnpj') ?? '').replace(/\D/g, '')
    const cpf = masked.replace(/\D/g, '')
    if (cnpj.length !== 14 || !isValidCnpj(cnpj) || !isValidCpf(cpf)) {
      representativeSeq.current++
      setRepresentative({ status: 'idle' })
      return
    }
    const seq = ++representativeSeq.current
    setRepresentative({ status: 'checking' })
    checkInviteRepresentative(token, cnpj, cpf).then((result) => {
      if (seq !== representativeSeq.current) return
      if (result.success && result.data?.verified) {
        setRepresentative({
          status: 'verified',
          name: result.data.representativeName ?? '',
          qualification: result.data.qualification,
        })
      } else if (result.code === 'REPRESENTATIVE_NOT_IN_REGISTRY') {
        setRepresentative({
          status: 'rejected',
          message: result.message ?? '',
        })
      } else {
        // Sem quadro para conferir, ou consulta indisponível: segue sem
        // conferência, com o nome informado.
        setRepresentative({ status: 'unverifiable' })
      }
    })
  }

  const handleCnpjChange = (masked: string) => {
    const digits = masked.replace(/\D/g, '')
    if (digits.length !== 14 || !isValidCnpj(digits)) {
      lookupSeq.current++
      setRegistry({ status: 'idle' })
      setRepresentative({ status: 'idle' })
      return
    }
    const seq = ++lookupSeq.current
    setRegistry({ status: 'loading' })
    lookupInviteCompany(token, digits).then((result) => {
      if (seq !== lookupSeq.current) return
      if (result.success && result.data?.inUse) {
        setRegistry({ status: 'in-use' })
      } else if (result.success && result.data?.found) {
        setRegistry({ status: 'found', data: result.data })
      } else if (result.success) {
        setRegistry({
          status: 'manual',
          message:
            'Não encontramos esse CNPJ na base pública. Confira o número ou preencha a razão social.',
        })
      } else {
        setRegistry({
          status: 'manual',
          message:
            'Não foi possível consultar o CNPJ agora. Preencha a razão social.',
        })
      }
      const cpf = getValues('representativeCpf')
      if (cpf) handleRepresentativeCpfChange(cpf)
    })
  }

  const legalName =
    registry.status === 'found'
      ? (registry.data.legalName ?? '')
      : (values.legalName ?? '')
  const representativeName =
    representative.status === 'verified'
      ? representative.name
      : (values.representativeName ?? '')

  const onSubmit = async (data: InviteForm) => {
    setFormError(null)

    // As três condições são exigidas juntas: conta, empresa e Termos.
    if (registry.status === 'loading' || representative.status === 'checking') {
      setFormError('Aguarde a consulta do CNPJ terminar.')
      return
    }
    if (registry.status === 'in-use') {
      setFormError(CNPJ_IN_USE_MESSAGE)
      return
    }
    if (registry.status !== 'found' && !data.legalName?.trim()) {
      form.setError('legalName', { message: 'Informe a razão social.' })
      return
    }
    if (representative.status === 'rejected') {
      form.setError('representativeCpf', { message: representative.message })
      return
    }
    if (
      representative.status !== 'verified' &&
      (data.representativeName ?? '').trim().length < 2
    ) {
      setRepresentative({ status: 'unverifiable' })
      form.setError('representativeName', {
        message: 'Informe o nome de quem responde pela empresa.',
      })
      return
    }
    if (!termsAccepted || !invite.terms) {
      setFormError('Aceite os Termos de Contratação para concluir.')
      return
    }

    const result = await acceptTransferInvite({
      token,
      name: data.name.trim(),
      password: data.password,
      company: {
        cnpj: data.cnpj.replace(/\D/g, ''),
        ...(registry.status !== 'found'
          ? {
              legalName: data.legalName?.trim(),
              tradeName: data.tradeName?.trim() || undefined,
            }
          : {}),
      },
      representative: {
        cpf: data.representativeCpf.replace(/\D/g, ''),
        isSelf: data.representativeIsSelf,
        ...(representative.status !== 'verified'
          ? { name: data.representativeName?.trim() }
          : {}),
      },
      termsAcceptance: {
        contractId: invite.terms.contractId,
        version: invite.terms.version,
        accepted: true,
      },
    })

    if (!result.success || !result.data) {
      if (result.code === 'EMAIL_HAS_ACCOUNT') {
        onRefused({ ...invite, emailHasAccount: true })
        return
      }
      if (result.status === 410) {
        onRefused({ state: 'CANCELED', message: result.message ?? '' })
        return
      }
      if (result.code === 'TERMS_OUTDATED') {
        setTermsAccepted(false)
        onTermsOutdated()
      }
      if (result.code === 'CNPJ_IN_USE') setRegistry({ status: 'in-use' })
      setFormError(result.message ?? 'Não foi possível aceitar agora.')
      return
    }

    // A conta foi criada e a transferência, efetivada: entra na hora.
    const signed = await signIn('credentials', {
      username: result.data.email,
      password: data.password,
      redirect: false,
    })
    if (signed?.ok && !signed.error) {
      toast.success(`O ambiente ${result.data.companyName} agora é seu.`)
      router.replace('/dashboard')
      router.refresh()
      return
    }
    toast.success(
      'Transferência aceita. Entre com o e-mail do convite e a senha que você criou.',
    )
    router.replace('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Transferência de titularidade
        </h1>
        <p className="text-sm text-gray-500">
          {invite.senderName} quer transferir para você o ambiente{' '}
          <strong className="font-medium text-gray-700">
            {invite.companyName}
          </strong>
          . Crie sua conta, informe o CNPJ da sua empresa e aceite os Termos.
          {typeof invite.daysLeft === 'number' && (
            <> O convite vale por mais {invite.daysLeft} dia(s).</>
          )}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="convite-email">E-mail</Label>
            <Input
              id="convite-email"
              type="email"
              value={invite.targetEmail ?? ''}
              readOnly
              aria-readonly="true"
            />
            <p className="text-xs text-gray-500">
              O convite foi endereçado a este e-mail.
            </p>
          </div>

          <FormInput<InviteForm>
            name="name"
            label="Seu nome *"
            width="w-full"
          />

          <div className="space-y-2">
            <FormInput<InviteForm>
              name="password"
              label="Senha *"
              type="password"
              width="w-full"
            />
            <PasswordValidation password={values.password ?? ''} />
          </div>
          <FormInput<InviteForm>
            name="confirmPassword"
            label="Repita a senha *"
            type="password"
            width="w-full"
          />

          <div className="space-y-3 rounded-md border border-gray-200 p-4">
            <p className="font-medium text-gray-800">Sua empresa</p>
            <FormInput<InviteForm>
              name="cnpj"
              label="CNPJ *"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              width="w-full"
              additionalOnChange={(value) => {
                const masked = maskCnpj(String(value ?? '')) || ''
                setValue('cnpj', masked, { shouldValidate: false })
                handleCnpjChange(masked)
              }}
            />
            {registry.status === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Spinner /> Consultando os dados da empresa…
              </p>
            )}
            {registry.status === 'found' && (
              <div className="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-medium text-gray-800">
                  {registry.data.legalName}
                </p>
                <p className="text-gray-600">
                  Nome fantasia:{' '}
                  {registry.data.tradeName || registry.data.legalName}
                </p>
              </div>
            )}
            {registry.status === 'in-use' && (
              <p className="text-sm text-error-600" role="alert">
                {CNPJ_IN_USE_MESSAGE}
              </p>
            )}
            {registry.status === 'manual' && (
              <div className="space-y-3">
                <p className="text-sm text-warning-700">{registry.message}</p>
                <FormInput<InviteForm>
                  name="legalName"
                  label="Razão social *"
                  width="w-full"
                />
                <FormInput<InviteForm>
                  name="tradeName"
                  label="Nome fantasia"
                  width="w-full"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-md border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-800">Representante legal</p>
              <p className="text-sm text-gray-600">
                O CPF de quem responde legalmente pela empresa. Pode ser o seu.
              </p>
            </div>
            <FormCheckbox<InviteForm>
              name="representativeIsSelf"
              label="Sou eu quem responde pela empresa"
            />
            <FormInput<InviteForm>
              name="representativeCpf"
              label="CPF do representante legal *"
              inputMode="numeric"
              placeholder="000.000.000-00"
              maxLength={14}
              width="w-full"
              additionalOnChange={(value) => {
                const masked = maskCpf(String(value ?? '')) || ''
                setValue('representativeCpf', masked, {
                  shouldValidate: false,
                })
                handleRepresentativeCpfChange(masked)
              }}
            />
            {representative.status === 'checking' && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Spinner /> Conferindo no registro público…
              </p>
            )}
            {representative.status === 'verified' && (
              <p className="flex items-center gap-2 text-sm text-brand-700">
                <IconCircleCheck size={18} /> Conferido no registro público:{' '}
                {representative.name}
                {representative.qualification
                  ? ` (${representative.qualification})`
                  : ''}
              </p>
            )}
            {representative.status === 'rejected' && (
              <p className="text-sm text-error-600" role="alert">
                {representative.message}
              </p>
            )}
            {representative.status === 'unverifiable' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  O registro público desta empresa não permite conferir o CPF.
                  Informe o nome de quem responde por ela.
                </p>
                <FormInput<InviteForm>
                  name="representativeName"
                  label="Nome do representante legal *"
                  width="w-full"
                />
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(value) => setTermsAccepted(value === true)}
              className="mt-0.5"
            />
            <span>
              Li e aceito os{' '}
              <button
                type="button"
                className="font-medium text-brand-700 underline"
                onClick={() => setTermsOpen(true)}
              >
                Termos de Contratação
              </button>
              {invite.terms ? ` (versão ${invite.terms.version})` : ''}.
            </span>
          </label>

          <p className="text-xs text-gray-500">
            Campos com * são obrigatórios.
          </p>

          {formError && (
            <p className="text-sm text-error-600" role="alert">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            RightIcon={IconCircleCheck}
            isLoading={isSubmitting}
          >
            Aceitar transferência
          </Button>
        </form>
      </Form>

      <TermsDialog
        open={termsOpen}
        onOpenChange={setTermsOpen}
        html={invite.terms?.html}
        version={invite.terms?.version}
        name={invite.terms?.name}
        parties={{
          contractorType: 'PJ',
          contractorName: legalName,
          contractorDocument: (values.cnpj ?? '').replace(/\D/g, ''),
          representativeName,
          representativeCpf: (values.representativeCpf ?? '').replace(
            /\D/g,
            '',
          ),
        }}
        onAccept={() => setTermsAccepted(true)}
      />
    </div>
  )
}
