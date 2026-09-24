'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconAlertCircle,
  IconArrowRight,
  IconCircleCheck,
  IconShieldCheck,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, getInitials } from '@/lib/utils'
import logout from '@/actions/logout'

import { CheckoutHeader } from './CheckoutHeader'

/**
 * Peças da contratação, no desenho do protótipo (prototype/src/pages/planos.ts):
 * cabeçalho com voltar, título e logo; conteúdo numa coluna de até 1071px;
 * seções com o nome sobre o fundo e os campos num cartão abaixo; e, ao lado,
 * o resumo e o cartão de confirmação.
 */

export function CheckoutShell({
  title,
  backHref,
  onBack,
  children,
}: {
  title: string
  backHref: string
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <CheckoutHeader title={title} backHref={backHref} onBack={onBack} />
      <main className="mx-auto max-w-[1071px] px-6 pb-20 pt-10">
        {children}
      </main>
    </div>
  )
}

/** Conteúdo à esquerda; resumo e confirmação numa coluna de 400px à direita. */
export function CheckoutColumns({
  aside,
  children,
}: {
  aside: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-6 lg:flex-row">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
        {children}
      </div>
      <aside className="flex w-full flex-none flex-col gap-4 lg:sticky lg:top-6 lg:w-[400px]">
        {aside}
      </aside>
    </div>
  )
}

/**
 * Seção do formulário: o nome sobre o fundo da página e os campos no cartão
 * abaixo. Sem numeração e sem recolher — esconder uma seção do checkout
 * esconde o que ainda falta preencher.
 */
export function CheckoutSection({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: ReactNode
}) {
  return (
    <section id={id}>
      <h2 className="text-xl font-semibold leading-[30px] text-gray-900">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6">
        {children}
      </div>
    </section>
  )
}

/** O cartão da confirmação, abaixo do resumo: aceite e ação principal. */
export function ConfirmCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-4">
      {children}
    </div>
  )
}

/**
 * A ação que avança, em largura total: rótulo e seta juntos, centralizados,
 * como no protótipo — o `RightIcon` do Button mandaria a seta para a borda.
 */
export function ProceedButton({
  children,
  onClick,
  isLoading,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      className="w-full"
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
    >
      {children}
      {!isLoading && <IconArrowRight aria-hidden="true" className="size-4" />}
    </Button>
  )
}

/** Nota discreta do topo de uma seção (a titularidade, a cobrança). */
export function SectionNote({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-gray-400">{children}</p>
}

/** Rótulo de um grupo de opções dentro da seção. */
export function GroupTitle({
  id,
  children,
}: {
  id?: string
  children: ReactNode
}) {
  return (
    <p id={id} className="text-[13px] font-semibold text-gray-700">
      {children}
    </p>
  )
}

/**
 * Quem está conectado. "Trocar conta" sai e volta pelo login para esta mesma
 * tela — o plano escolhido fica guardado na sessão do navegador.
 */
export function AccountStatus({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const switchAccount = async () => {
    await logout()
    router.replace(`/login?to=${encodeURIComponent(pathname)}`)
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
      <span className="grid size-[34px] flex-none place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
        {getInitials(name)}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[13px] font-medium text-gray-800">
          Conectado como {name}
        </strong>
        <small className="block truncate text-xs text-gray-500">{email}</small>
      </span>
      <button
        type="button"
        onClick={switchAccount}
        className="flex-none text-xs font-semibold text-brand-700 hover:text-brand-600"
      >
        Trocar conta
      </button>
    </div>
  )
}

/**
 * Por que a pessoa está nesta tela, quando não foi ela que pediu: conta
 * suspensa por atraso (erro) ou teste gratuito terminado (atenção).
 */
export function ArrivalNotice({
  tone,
  title,
  text,
}: {
  tone: 'error' | 'warning'
  title: string
  text: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'mb-8 flex items-start gap-3 rounded-xl border p-4',
        tone === 'error'
          ? 'border-error-300 bg-error-50'
          : 'border-warning-200 bg-warning-50',
      )}
    >
      <IconAlertCircle
        className={cn(
          'size-6 flex-none',
          tone === 'error' ? 'text-error-500' : 'text-warning-500',
        )}
      />
      <div className="flex flex-col gap-0.5 text-sm leading-5">
        <strong
          className={cn(
            'font-semibold',
            tone === 'error' ? 'text-error-700' : 'text-warning-700',
          )}
        >
          {title}
        </strong>
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  )
}

/**
 * Opção em cartão, com rádio: o contratante, a forma de pagamento, o ciclo.
 * Escolhida, ganha a borda da marca e abre o que pertence a ela.
 */
export function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  icon,
  badge,
  disabled,
  className,
  children,
}: {
  name: string
  value: string
  checked: boolean
  onSelect: (value: string) => void
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-white transition-colors',
        checked ? 'border-brand-500' : 'border-gray-200',
        disabled && 'opacity-60',
        className,
      )}
    >
      <label
        className={cn(
          'flex items-center gap-3 p-4',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          checked && 'bg-brand-25',
        )}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onSelect(value)}
          className="size-[18px] flex-none accent-[var(--brand-500)]"
        />
        {icon && (
          <span className="grid size-6 flex-none place-items-center text-gray-500 [&_svg]:size-[22px]">
            {icon}
          </span>
        )}
        <span className="min-w-0">
          <strong className="block text-sm font-semibold text-gray-900">
            {title}
          </strong>
          {description && (
            <small className="block text-xs text-gray-500">{description}</small>
          )}
        </span>
        {badge && (
          <span className="ml-auto whitespace-nowrap rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
            {badge}
          </span>
        )}
      </label>
      {checked && children && (
        <div className="flex flex-col gap-5 border-t border-gray-200 p-5">
          {children}
        </div>
      )}
    </div>
  )
}

/** O aceite dos Termos, com o link que abre o contrato com as partes nomeadas. */
export function TermsCheckbox({
  checked,
  onCheckedChange,
  onOpenTerms,
  error,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onOpenTerms: () => void
  error?: string | null
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5"
        />
        <span>
          Li e estou de acordo com os{' '}
          <button
            type="button"
            className="text-sm font-semibold text-brand-700 underline underline-offset-2"
            onClick={(event) => {
              event.preventDefault()
              onOpenTerms()
            }}
          >
            Termos de Contratação
          </button>{' '}
          da Atrupe.
        </span>
      </label>
      {error && (
        <p className="text-xs text-error-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** A nota de segurança sob a ação de pagar. */
export function SecureNote() {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
      <IconShieldCheck className="size-3.5 flex-none text-brand-600" />
      <span>Pagamento processado com segurança</span>
    </p>
  )
}

/** Linha de verificação usada nos resumos e listas. */
export function CheckLine({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('flex items-center gap-2 text-sm', className)}>
      <IconCircleCheck className="size-4 flex-none text-brand-500" />
      <span>{children}</span>
    </span>
  )
}
