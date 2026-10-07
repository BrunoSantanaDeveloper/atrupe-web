'use client'

import React from 'react'
import {
  FormInput,
  InputState,
  InputVariant,
} from '@/components/common/form-input'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────────── */

const VARIANTS: {
  variant: InputVariant
  label: string
  placeholder: string
}[] = [
  { variant: 'text', label: 'Email', placeholder: 'maicol@atrupe.com.br' },
  { variant: 'email', label: 'Email', placeholder: 'maicol@atrupe.com.br' },
  {
    variant: 'phone',
    label: 'Número de telefone',
    placeholder: '+1 (555) 000-0000',
  },
  { variant: 'currency', label: 'Valor de venda', placeholder: '1,000.00' },
  {
    variant: 'currency-suffix',
    label: 'Valor de venda',
    placeholder: '1,000.00',
  },
  { variant: 'website', label: 'Website', placeholder: 'www.atrupe.com.br' },
  {
    variant: 'card',
    label: 'Número do cartão',
    placeholder: 'Número do cartão',
  },
]

const STATES: { state: InputState; label: string; value?: string }[] = [
  { state: 'default', label: 'Placeholder', value: '' },
  { state: 'filled', label: 'Filled', value: 'maicol@atrupe.com.br' },
  { state: 'focused', label: 'Focused', value: 'maicol@atrupe.com.br' },
  { state: 'disabled', label: 'Disabled', value: '' },
  { state: 'error', label: 'Error', value: '' },
  {
    state: 'error-focused',
    label: 'Error + Focused',
    value: 'maicol@atrupe.com.br',
  },
]

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 col-span-full">
      {title}
    </h2>
  )
}

function StateLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {label}
    </p>
  )
}

function ColHeaders({ variants }: { variants: typeof VARIANTS }) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${variants.length}, minmax(0, 1fr))`,
      }}
    >
      {variants.map((v) => (
        <p
          key={v.variant}
          className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center"
        >
          {v.variant}
        </p>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Interactive row — fully controlled
───────────────────────────────────────────────────────────── */

function InteractiveRow({
  variants,
  showLabel,
  showHint,
}: {
  variants: typeof VARIANTS
  showLabel: boolean
  showHint: boolean
}) {
  const [values, setValues] = React.useState<string[]>(variants.map(() => ''))

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${variants.length}, minmax(0, 1fr))`,
      }}
    >
      {variants.map((v, i) => (
        <FormInput
          key={v.variant}
          id={`interactive-${v.variant}`}
          variant={v.variant}
          label={showLabel ? v.label : undefined}
          hint={showHint ? 'Texto de dica para ajudar o usuário.' : undefined}
          placeholder={v.placeholder}
          value={values[i]}
          onChange={(val) => {
            const next = [...values]
            next[i] = val
            setValues(next)
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Static state row — frozen state per Figma
───────────────────────────────────────────────────────────── */

function StateRow({
  stateConfig,
  variants,
  showLabel,
  showHint,
}: {
  stateConfig: (typeof STATES)[number]
  variants: typeof VARIANTS
  showLabel: boolean
  showHint: boolean
}) {
  const isError =
    stateConfig.state === 'error' || stateConfig.state === 'error-focused'
  const hint = isError
    ? 'Esta é uma mensagem de erro.'
    : showHint
      ? 'Texto de dica para ajudar o usuário.'
      : undefined

  return (
    <div>
      <StateLabel label={stateConfig.label} />
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${variants.length}, minmax(0, 1fr))`,
        }}
      >
        {variants.map((v) => (
          <FormInput
            key={v.variant}
            variant={v.variant}
            label={showLabel ? v.label : undefined}
            hint={hint}
            placeholder={v.placeholder}
            value={stateConfig.value}
            state={stateConfig.state}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Section: all states for one label/hint config
───────────────────────────────────────────────────────────── */

function InputSection({
  title,
  showLabel,
  showHint,
  variants,
}: {
  title: string
  showLabel: boolean
  showHint: boolean
  variants: typeof VARIANTS
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
        {title}
      </h2>
      <ColHeaders variants={variants} />

      {STATES.map((s) => (
        <StateRow
          key={s.state}
          stateConfig={s}
          variants={variants}
          showLabel={showLabel}
          showHint={showHint}
        />
      ))}

      <div>
        <StateLabel label="Interativo (live)" />
        <InteractiveRow
          variants={variants}
          showLabel={showLabel}
          showHint={showHint}
        />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

// Split into two groups to keep columns manageable
const GROUP_A = VARIANTS.slice(0, 4) // text, email, phone, currency
const GROUP_B = VARIANTS.slice(4) // currency-suffix, website, card

export default function InputsSandboxPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            FormInput — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mapeamento de todas as variantes e estados do Figma. Colunas:{' '}
            <code>
              text · email · phone · currency · currency-suffix · website · card
            </code>
            . Linhas:{' '}
            <code>
              placeholder · filled · focused · disabled · error · error-focused
              · interativo
            </code>
            .
          </p>
        </div>

        {/* ── Bloco 1: Sem label, sem hint ─── */}
        <InputSection
          title="1 — Sem label · Sem hint"
          showLabel={false}
          showHint={false}
          variants={GROUP_A}
        />
        <InputSection
          title="1b — Sem label · Sem hint (currency-suffix · website · card)"
          showLabel={false}
          showHint={false}
          variants={GROUP_B}
        />

        {/* ── Bloco 2: Sem label, com hint ─── */}
        <InputSection
          title="2 — Sem label · Com hint"
          showLabel={false}
          showHint={true}
          variants={GROUP_A}
        />
        <InputSection
          title="2b — Sem label · Com hint (currency-suffix · website · card)"
          showLabel={false}
          showHint={true}
          variants={GROUP_B}
        />

        {/* ── Bloco 3: Com label, com hint ─── */}
        <InputSection
          title="3 — Com label · Com hint"
          showLabel={true}
          showHint={true}
          variants={GROUP_A}
        />
        <InputSection
          title="3b — Com label · Com hint (currency-suffix · website · card)"
          showLabel={true}
          showHint={true}
          variants={GROUP_B}
        />

        {/* ── Bloco 4: Formulário integrado ─── */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
            4 — Formulário integrado (exemplo real)
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <p className="text-base font-semibold text-gray-900 mb-6">
              Dados de pagamento
            </p>
            <div className="grid grid-cols-2 gap-6 max-w-2xl">
              <FormInput
                id="form-email"
                variant="email"
                label="Email"
                hint="Texto de dica para ajudar o usuário."
                placeholder="maicol@atrupe.com.br"
              />
              <FormInput
                id="form-phone"
                variant="phone"
                label="Número de telefone"
                hint="Texto de dica para ajudar o usuário."
                placeholder="+55 (11) 99999-9999"
                countryCode="BR"
              />
              <FormInput
                id="form-card"
                variant="card"
                label="Número do cartão"
                hint="Texto de dica para ajudar o usuário."
                placeholder="Número do cartão"
              />
              <FormInput
                id="form-currency"
                variant="currency"
                label="Valor de venda"
                hint="Texto de dica para ajudar o usuário."
                placeholder="1,000.00"
                currencySymbol="R$"
              />
              <FormInput
                id="form-website"
                variant="website"
                label="Website"
                hint="Texto de dica para ajudar o usuário."
                placeholder="www.atrupe.com.br"
                urlPrefix="http://"
              />
              <FormInput
                id="form-error-example"
                variant="email"
                label="Email (exemplo de erro)"
                state="error"
                hint="Endereço de e-mail inválido."
                placeholder="maicol@atrupe.com.br"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
