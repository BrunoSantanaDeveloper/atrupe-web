'use client'

import type { ReactNode } from 'react'
import Image, { StaticImageData } from 'next/image'
import { IconCircleCheck, IconMinus, IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import {
  getEmbedUrl,
  getVideoType,
  HlsPlayer,
} from '@/app/(app-sidebar)/academy/_components/VideoDialog'

import pro from '@/assets/images/pro-logo.png'
import lite from '@/assets/images/lite-logo.png'
import full from '@/assets/images/full-logo.png'
import elite from '@/assets/images/elite-logo.png'
import start from '@/assets/images/start-logo.png'
import atrupe from '@/assets/images/atrupe-logo.png'

import type { Cycle } from './CycleToggle'

const LOGOS: Record<string, StaticImageData> = {
  START: start,
  LITE: lite,
  PRO: pro,
  ELITE: elite,
  FULL: full,
}

export function PlanLogo({
  planType,
  name,
  className,
}: {
  planType: string
  name: string
  className?: string
}) {
  return (
    <Image
      src={LOGOS[planType] ?? atrupe}
      alt={name}
      height={28}
      className={cn('h-7 w-auto', className)}
    />
  )
}

/**
 * Mensal ou anual, no cabeçalho da trilha: controle segmentado com o
 * benefício do anual na linha de baixo, fora do controle — dentro dele
 * quebraria a simetria dos dois segmentos.
 */
export function CycleSwitch({
  value,
  onChange,
  only,
}: {
  value: Cycle
  onChange: (cycle: Cycle) => void
  /** Quando só um ciclo vale — do anual, só se evolui para o anual. */
  only?: Cycle
}) {
  const option = (cycle: Cycle, label: string) => {
    const disabled = !!only && only !== cycle
    return (
      <label
        className={cn(
          'relative z-[1] flex min-w-[104px] items-center justify-center rounded-lg px-4 py-[7px] text-[13px] transition-colors',
          value === cycle
            ? 'font-semibold text-gray-900'
            : 'font-medium text-gray-600',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <input
          type="radio"
          name="planosCiclo"
          value={cycle}
          checked={value === cycle}
          disabled={disabled}
          onChange={() => onChange(cycle)}
          className="pointer-events-none absolute size-px opacity-0"
        />
        <span>{label}</span>
      </label>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative inline-flex rounded-[10px] bg-gray-100 p-0.5"
        role="radiogroup"
        aria-label="Ciclo de cobrança"
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-0.5 top-0.5 z-0 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-lg bg-white shadow-[0_3px_8px_rgba(16,24,40,.12),0_1px_2px_rgba(16,24,40,.06)] transition-transform duration-300 motion-reduce:transition-none',
            value === 'YEARLY' && 'translate-x-full',
          )}
        />
        {option('MONTHLY', 'Mensal')}
        {option('YEARLY', 'Anual')}
      </div>
      <p className="text-[13px] font-medium text-brand-600">
        1 mês grátis no plano anual
      </p>
    </div>
  )
}

/**
 * O vídeo da etapa, aberto dentro do card. Sem autoplay: começar a tocar
 * sozinho, com som, seria intrusivo — fica no cartaz, com os controles à mão.
 */
export function PlanVideo({
  name,
  url,
  poster,
}: {
  name: string
  url: string
  poster?: string
}) {
  const type = getVideoType(url)
  return (
    <aside aria-label={`Vídeo de apresentação do ${name}`}>
      <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-sm">
        {type === 'youtube' || type === 'vimeo' ? (
          <iframe
            src={getEmbedUrl(url).replace('autoplay=1', 'autoplay=0')}
            title={`Vídeo de apresentação do ${name}`}
            className="block h-full w-full"
            allow="fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : type === 'hls' ? (
          <HlsPlayer src={url} autoPlay={false} />
        ) : (
          <video
            src={url}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            className="block h-full w-full bg-gray-900 object-contain"
          />
        )}
      </div>
    </aside>
  )
}

/**
 * Card de uma etapa contratável, no desenho do protótipo: a logo e o "para
 * quem é" abrem o card; o vídeo fica ao lado do preço, da ação e do que a
 * etapa entrega. O preço em destaque é sempre por mês, nos dois ciclos.
 */
export function PlanOfferCard({
  planType,
  name,
  pitch,
  actions,
  previousName,
  video,
  monthlyCents,
  priceNote,
  priceExtra,
  ctaLabel,
  onCta,
  ctaDisabled,
}: {
  planType: string
  name: string
  pitch: string
  actions: string[]
  previousName?: string | null
  video?: { url: string; poster?: string } | null
  monthlyCents: number | null | undefined
  priceNote: ReactNode
  priceExtra?: ReactNode
  ctaLabel: string
  onCta: () => void
  ctaDisabled?: boolean
}) {
  const body = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        {monthlyCents != null ? (
          <p className="text-2xl font-semibold tracking-[-.02em] text-gray-900">
            {formatCurrencyToBrl(monthlyCents)}
            <small className="ml-0.5 text-[13px] font-normal text-gray-500">
              /mês
            </small>
          </p>
        ) : (
          <Skeleton className="h-8 w-40" />
        )}
        <p className="text-xs leading-[1.4] text-gray-500">{priceNote}</p>
        {priceExtra}
      </div>
      <Button
        type="button"
        className="w-full"
        onClick={onCta}
        disabled={ctaDisabled}
      >
        {ctaLabel}
      </Button>
      {previousName && (
        <p className="-mb-1 mt-1 text-[13px] font-semibold text-gray-700">
          Tudo do {previousName}, mais:
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {actions.map((action) => (
          <li
            key={action}
            className="flex items-start gap-2 text-[13px] leading-[1.45] text-gray-600"
          >
            <IconCircleCheck className="mt-px size-4 flex-none text-brand-600" />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="relative flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-[2px_24px_40px_-16px_rgba(16,24,40,.22),1px_8px_14px_-10px_rgba(16,24,40,.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex flex-wrap items-center gap-2">
        <PlanLogo planType={planType} name={name} />
      </div>
      <p className="text-[13px] leading-[1.5] text-gray-500">{pitch}</p>
      {video ? (
        <div className="mt-1 grid grid-cols-1 items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <PlanVideo name={name} url={video.url} poster={video.poster} />
          {body}
        </div>
      ) : (
        body
      )}
    </div>
  )
}

/** Um complemento: o módulo, com o preço à direita. */
export function AddonCard({
  checked,
  disabled,
  onCheckedChange,
  name,
  description,
  priceCents,
  badge,
}: {
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
  name: string
  description?: string | null
  priceCents: number
  badge?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
      <label
        className={cn(
          'flex items-center gap-2.5',
          disabled ? 'cursor-default' : 'cursor-pointer',
        )}
      >
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="flex-none"
        />
        <span className="flex min-w-0 flex-1 items-center gap-4">
          <span className="min-w-0 flex-1 text-base font-semibold text-gray-900">
            {name}
            {description && (
              <small className="text-sm font-normal text-gray-500">
                : {description}
              </small>
            )}
          </span>
          {badge}
          <span className="flex-none whitespace-nowrap text-base font-semibold text-gray-700">
            {formatCurrencyToBrl(priceCents)}{' '}
            <small className="text-xs font-normal text-gray-500">/mês</small>
          </span>
        </span>
      </label>
    </div>
  )
}

/** Usuários adicionais, com o seletor de quantidade. */
export function UsersAddonCard({
  value,
  min = 0,
  max,
  disabled,
  onChange,
  priceCents,
  hint,
}: {
  value: number
  min?: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
  priceCents: number | null | undefined
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
        <span className="min-w-0 flex-1 text-base font-semibold text-gray-900">
          Usuários adicionais
          {hint && (
            <small className="block text-sm font-normal text-gray-500">
              {hint}
            </small>
          )}
        </span>
        {priceCents != null && (
          <span className="flex-none whitespace-nowrap text-base font-semibold text-gray-700">
            {formatCurrencyToBrl(priceCents)}{' '}
            <small className="text-xs font-normal text-gray-500">
              /mês por usuário
            </small>
          </span>
        )}
        <div className="flex flex-none items-center gap-1.5">
          <Button
            type="button"
            size="icon"
            className="size-9 rounded-md"
            aria-label="Diminuir usuários adicionais"
            disabled={disabled || value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
          >
            <IconMinus className="size-[18px]" />
          </Button>
          <input
            type="number"
            readOnly
            value={value}
            aria-label="Quantidade de usuários adicionais"
            className="h-9 w-[52px] rounded-md border border-gray-300 bg-white p-0 text-center text-sm text-gray-900"
          />
          <Button
            type="button"
            size="icon"
            className="size-9 rounded-md"
            aria-label="Aumentar usuários adicionais"
            disabled={disabled || value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
          >
            <IconPlus className="size-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Seção de complementos: o título sobre os cartões. */
export function AddonsSection({
  children,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section
      className="flex flex-col gap-3 pt-2"
      aria-labelledby="planos-complementos-title"
    >
      <h2
        id="planos-complementos-title"
        className="text-base font-semibold text-gray-900"
      >
        Complementos
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
      {footer}
    </section>
  )
}
