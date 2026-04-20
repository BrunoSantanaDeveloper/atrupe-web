'use client'

import React, { useState } from 'react'
import { FormInput } from '@/components/common/form-input'
import { OtpInput, type OtpSize } from '@/components/common/otp-input'
import {
  FloatingToolbar,
  InlineToolbar,
  type ToolbarAction,
} from '@/components/common/rich-text-toolbar'

export const dynamic = 'force-dynamic'
import type { InputState } from '@/components/common/form-input'

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-[#344054] uppercase tracking-wide border-b border-[#F2F4F7] pb-2 mb-6">
      {children}
    </h2>
  )
}

function StateLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider mb-3">
      {label}
    </p>
  )
}

/* ─────────────────────────────────────────────────────────────
   Textarea states matrix
───────────────────────────────────────────────────────────── */

const TEXTAREA_STATES: {
  state: InputState
  label: string
  value?: string
  hint?: string
}[] = [
  { state: 'default', label: 'Placeholder', value: '' },
  {
    state: 'filled',
    label: 'Filled',
    value: 'Um pouco sobre a empresa e a equipe com a qual você trabalhará.',
  },
  {
    state: 'focused',
    label: 'Focused',
    value: 'Um pouco sobre a empresa e a equipe com a qual você trabalhará.',
  },
  { state: 'disabled', label: 'Disabled', value: '' },
  {
    state: 'error',
    label: 'Error',
    value: '',
    hint: 'Esta é uma mensagem de erro.',
  },
  {
    state: 'error-focused',
    label: 'Error + Focused',
    value: 'Um pouco sobre a empresa e a equipe com a qual você trabalhará.',
    hint: 'Esta é uma mensagem de erro.',
  },
]

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

export default function InputsExtendedSandboxPage() {
  /* OTP state */
  const [otp4, setOtp4] = useState('')
  const [otp6, setOtp6] = useState('')

  /* Toolbar state */
  const [active, setActive] = useState<ToolbarAction[]>([])
  const toggleAction = (a: ToolbarAction) =>
    setActive((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    )

  /* Interactive textarea */
  const [textAreaVal, setTextAreaVal] = useState('')

  const OTP_SIZES: OtpSize[] = ['sm', 'md', 'lg']
  const OTP_FORMATS: ('simple' | 'split')[] = ['simple', 'split']

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">
            FormInput Extended — Sandbox
          </h1>
          <p className="text-sm text-[#667085] mt-1">
            Novos componentes: <code>OtpInput</code> ·{' '}
            <code>FormInput variant=textarea</code> ·{' '}
            <code>RichTextToolbar</code>
          </p>
        </div>

        {/* ══════════════════════════════════════════════════
            1. TEXTAREA STATES
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>1 — Textarea · Todos os estados</SectionTitle>

          <div className="grid grid-cols-4 gap-8">
            {/* 1.1 sem label, sem hint */}
            <div className="col-span-4">
              <StateLabel label="Configuração: sem label · sem hint" />
              <div className="grid grid-cols-6 gap-4">
                {TEXTAREA_STATES.map((s) => (
                  <div key={s.state}>
                    <p className="text-[10px] font-semibold text-[#98A2B3] uppercase mb-2">
                      {s.label}
                    </p>
                    <FormInput
                      variant="textarea"
                      state={s.state}
                      value={
                        s.state === 'error' || s.state === 'error-focused'
                          ? s.value
                          : s.value
                      }
                      hint={s.hint}
                      placeholder="Coloque uma descrição..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 1.2 com label, sem hint */}
            <div className="col-span-4">
              <StateLabel label="Configuração: com label · sem hint" />
              <div className="grid grid-cols-6 gap-4">
                {TEXTAREA_STATES.map((s) => (
                  <div key={s.state}>
                    <p className="text-[10px] font-semibold text-[#98A2B3] uppercase mb-2">
                      {s.label}
                    </p>
                    <FormInput
                      variant="textarea"
                      label="Descrição"
                      state={s.state}
                      value={s.value}
                      hint={s.hint}
                      placeholder="Coloque uma descrição..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 1.3 com label, com hint */}
            <div className="col-span-4">
              <StateLabel label="Configuração: com label · com hint" />
              <div className="grid grid-cols-6 gap-4">
                {TEXTAREA_STATES.map((s) => {
                  const hint =
                    s.state === 'error' || s.state === 'error-focused'
                      ? s.hint
                      : 'Texto de dica para ajudar o usuário.'
                  return (
                    <div key={s.state}>
                      <p className="text-[10px] font-semibold text-[#98A2B3] uppercase mb-2">
                        {s.label}
                      </p>
                      <FormInput
                        variant="textarea"
                        label="Descrição"
                        state={s.state}
                        value={s.value}
                        hint={hint}
                        placeholder="Coloque uma descrição..."
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Interactive */}
            <div className="col-span-2">
              <StateLabel label="Interativo (live)" />
              <FormInput
                id="textarea-live"
                variant="textarea"
                label="Descrição"
                hint="Texto de dica para ajudar o usuário."
                placeholder="Coloque uma descrição..."
                value={textAreaVal}
                onChange={setTextAreaVal}
                rows={5}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            2. OTP INPUT
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>
            2 — OtpInput · Matriz de estados × Tamanhos
          </SectionTitle>

          {/* 2.1 State matrix — all global states across 3 sizes, simple format */}
          <div className="mb-12">
            <StateLabel label="2.1 — Estados globais: default · filled · focused · disabled · error" />

            <div className="space-y-8">
              {(['sm', 'md', 'lg'] as OtpSize[]).map((size) => (
                <div key={size}>
                  <p className="text-[11px] text-[#667085] font-semibold uppercase tracking-wide mb-4">
                    Tamanho: {size}
                  </p>
                  <div className="flex flex-wrap gap-10">
                    {/* default (empty) */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        Default (empty)
                      </p>
                      <OtpInput
                        key={`${size}-default`}
                        size={size}
                        length={4}
                        state="default"
                        value=""
                      />
                    </div>
                    {/* filled */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        Filled
                      </p>
                      <OtpInput
                        key={`${size}-filled`}
                        size={size}
                        length={4}
                        state="filled"
                        value="1234"
                      />
                    </div>
                    {/* focused — show via state prop */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        Focused (via state)
                      </p>
                      <OtpInput
                        key={`${size}-focused`}
                        size={size}
                        length={4}
                        state="focused"
                        value="12"
                      />
                    </div>
                    {/* disabled */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        Disabled
                      </p>
                      <OtpInput
                        key={`${size}-disabled`}
                        size={size}
                        length={4}
                        state="disabled"
                        value=""
                      />
                    </div>
                    {/* error */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        Error
                      </p>
                      <OtpInput
                        key={`${size}-error`}
                        size={size}
                        length={4}
                        state="error"
                        value=""
                        hint="Código incorreto."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2.2 Formats + label/hint config */}
          <StateLabel label="2.2 — Formatos × Configurações de label/hint" />

          {OTP_SIZES.map((size) => (
            <div key={size} className="mb-10">
              <StateLabel label={`Tamanho: ${size}`} />
              <div className="grid grid-cols-2 gap-10">
                {OTP_FORMATS.map((format) => (
                  <div key={format} className="space-y-6">
                    <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wide">
                      Formato: {format}
                    </p>

                    {/* sem label, sem hint */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-2">
                        Sem label · sem hint
                      </p>
                      <OtpInput
                        size={size}
                        format={format}
                        length={format === 'split' ? 6 : 4}
                      />
                    </div>

                    {/* com label, sem hint */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-2">
                        Com label · sem hint
                      </p>
                      <OtpInput
                        size={size}
                        format={format}
                        length={format === 'split' ? 6 : 4}
                        label="Código de segurança"
                      />
                    </div>

                    {/* com label, com hint */}
                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-2">
                        Com label · com hint
                      </p>
                      <OtpInput
                        size={size}
                        format={format}
                        length={format === 'split' ? 6 : 4}
                        label="Código de segurança"
                        hint="Texto de dica para ajudar o usuário."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Interactive 4-digit OTP */}
          <div className="grid grid-cols-2 gap-10 mt-6">
            <div>
              <StateLabel label="Interativo — 4 dígitos (simple)" />
              <OtpInput
                id="otp-live-4"
                size="md"
                format="simple"
                length={4}
                label="Código de segurança"
                hint="Digite o código recebido por SMS."
                value={otp4}
                onChange={setOtp4}
              />
              <p className="text-xs text-[#667085] mt-2">
                Valor atual:{' '}
                <code className="bg-gray-100 px-1 rounded">{otp4 || '—'}</code>
              </p>
            </div>
            <div>
              <StateLabel label="Interativo — 6 dígitos (split 3-3)" />
              <OtpInput
                id="otp-live-6"
                size="md"
                format="split"
                length={6}
                label="Código de segurança"
                hint="Digite o código recebido por SMS."
                value={otp6}
                onChange={setOtp6}
              />
              <p className="text-xs text-[#667085] mt-2">
                Valor atual:{' '}
                <code className="bg-gray-100 px-1 rounded">{otp6 || '—'}</code>
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            3. RICH TEXT TOOLBAR
        ══════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>
            3 — RichTextToolbar · Floating (dark) + Inline (light)
          </SectionTitle>

          {/* 3.1 Floating — dark */}
          <div className="space-y-8 mb-12">
            <StateLabel label="3.1 — Floating dark · 2 tamanhos × 3 posições de caret" />

            <div className="grid grid-cols-3 gap-12">
              {(['bottom-center', 'bottom-left', 'top-center'] as const).map(
                (pos) => (
                  <div key={pos} className="space-y-8">
                    <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wide">
                      Caret: {pos}
                    </p>

                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        lg — 32px icons
                      </p>
                      <FloatingToolbar
                        size="lg"
                        caretPosition={pos}
                        activeActions={active}
                        onAction={toggleAction}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] text-[#98A2B3] uppercase mb-3">
                        sm — 28px icons
                      </p>
                      <FloatingToolbar
                        size="sm"
                        caretPosition={pos}
                        activeActions={active}
                        onAction={toggleAction}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            <p className="text-xs text-[#667085]">
              Ativos:{' '}
              <code className="bg-gray-100 px-1 rounded">
                {active.join(', ') || '—'}
              </code>{' '}
              (clique nos ícones para ativar/desativar)
            </p>
          </div>

          {/* 3.2 Inline — light */}
          <div className="space-y-6">
            <StateLabel label="3.2 — Inline light toolbar · inside editor" />

            <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="border-b border-[#F2F4F7] p-3">
                <InlineToolbar
                  size="lg"
                  textStyleLabel="Normal text"
                  activeActions={active}
                  onAction={toggleAction}
                />
              </div>
              {/* Mock editor body */}
              <div className="p-4 min-h-[120px]">
                <textarea
                  className="w-full h-28 bg-transparent outline-none resize-none text-base text-[#101828] placeholder:text-[#667085]"
                  placeholder="Comece a digitar aqui..."
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden mt-4">
              {/* sm variant */}
              <div className="border-b border-[#F2F4F7] p-2.5">
                <InlineToolbar
                  size="sm"
                  textStyleLabel="Normal text"
                  activeActions={active}
                  onAction={toggleAction}
                />
              </div>
              <div className="p-4 min-h-[100px]">
                <textarea
                  className="w-full h-20 bg-transparent outline-none resize-none text-sm text-[#101828] placeholder:text-[#667085]"
                  placeholder="Versão sm da toolbar..."
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
