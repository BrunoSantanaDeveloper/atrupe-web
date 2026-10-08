'use client'

import React from 'react'
import {
  MemberSelect,
  MemberSearchInput,
  MemberOption,
  MemberSelectIconVariant,
} from '@/components/common/member-select'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
   Shared data
───────────────────────────────────────────────────────────── */

const MEMBERS: MemberOption[] = [
  {
    id: '1',
    name: 'Phoenix Baker',
    username: 'phoenix',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phoenix',
    presenceColor: '#12B76A',
  },
  {
    id: '2',
    name: 'Olivia Rhye',
    username: 'olivia',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
    presenceColor: '#12B76A',
  },
  {
    id: '3',
    name: 'Lana Steiner',
    username: 'lana',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lana',
    presenceColor: '#12B76A',
  },
  {
    id: '4',
    name: 'Demi Wilkinson',
    username: 'demi',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demi',
    presenceColor: '#12B76A',
  },
  {
    id: '5',
    name: 'Candice Wu',
    username: 'candice',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=candice',
    presenceColor: '#12B76A',
  },
  {
    id: '6',
    name: 'Natali Craig',
    username: 'natali',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=natali',
    presenceColor: '#12B76A',
  },
  {
    id: '7',
    name: 'Drew Cano',
    username: 'drew',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=drew',
    presenceColor: '#12B76A',
  },
  {
    id: '8',
    name: 'Orlando Diggs',
    username: 'orlando',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=orlando',
    presenceColor: '#667085',
  },
  {
    id: '9',
    name: 'Andi Lane',
    username: 'andi',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andi',
    presenceColor: '#667085',
  },
  {
    id: '10',
    name: 'Kate Morrison',
    username: 'kate',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kate',
    presenceColor: '#667085',
  },
  {
    id: '11',
    name: 'Koray Okumus',
    username: 'koray',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=koray',
    presenceColor: '#667085',
  },
  {
    id: '12',
    name: 'Ava Wright',
    username: 'ava',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ava',
    presenceColor: '#667085',
  },
  {
    id: '13',
    name: 'Eve Leroy',
    username: 'eve',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
    presenceColor: '#667085',
  },
  {
    id: '14',
    name: 'Zahir Mays',
    username: 'zahir',
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zahir',
    presenceColor: '#667085',
  },
]

const OLIVIA = MEMBERS[1] // pre-selected member

/* ─────────────────────────────────────────────────────────────
   Icon variant column config
───────────────────────────────────────────────────────────── */

type ColumnConfig = {
  variant: MemberSelectIconVariant
  label: string // trigger label for labeled rows
  searchLabel: string // label used in search column
}

const COLUMNS: ColumnConfig[] = [
  { variant: 'none', label: 'Membro do time', searchLabel: 'Buscar' },
  { variant: 'user', label: 'Membro do time', searchLabel: 'Buscar' },
  { variant: 'avatar', label: 'Membro do time', searchLabel: 'Buscar' },
  { variant: 'dot', label: 'Membro do time', searchLabel: 'Buscar' },
  { variant: 'search', label: 'Buscar', searchLabel: 'Buscar' },
]

/* ─────────────────────────────────────────────────────────────
   Controlled demo row — stateful, interactive
───────────────────────────────────────────────────────────── */

function InteractiveRow({
  showUsername,
  label,
  id,
}: {
  showUsername: boolean
  label?: boolean
  id: string
}) {
  const [values, setValues] = React.useState<(MemberOption | null)[]>(
    COLUMNS.map((_, i) => (i < COLUMNS.length ? OLIVIA : null)),
  )

  return (
    <div className="grid grid-cols-5 gap-4">
      {COLUMNS.map((col, i) => {
        if (col.variant === 'search') {
          return (
            <MemberSearchInput
              key={col.variant}
              value={values[i]}
              showUsername={showUsername}
              label={label ? col.searchLabel : undefined}
            />
          )
        }
        return (
          <MemberSelect
            key={col.variant}
            id={`${id}-${col.variant}`}
            options={MEMBERS}
            value={values[i]}
            onChange={(m) => {
              const next = [...values]
              next[i] = m
              setValues(next)
            }}
            iconVariant={col.variant}
            showUsername={showUsername}
            label={label ? col.label : undefined}
            placeholder="Selecione um membro"
          />
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Static display row — shows a single frozen trigger state
   (for showing placeholder / selected / open states as in Figma)
───────────────────────────────────────────────────────────── */

type TriggerState = 'placeholder' | 'selected' | 'open'

function StaticRow({
  state,
  showUsername,
  label,
  id,
}: {
  state: TriggerState
  showUsername: boolean
  label?: boolean
  id: string
}) {
  const selectedValue = state !== 'placeholder' ? OLIVIA : null
  const isOpen = state === 'open'

  return (
    <div className="grid grid-cols-5 gap-4">
      {COLUMNS.map((col) => {
        // search variant: always MemberSearchInput
        if (col.variant === 'search') {
          return (
            <MemberSearchInput
              key={col.variant}
              value={selectedValue}
              showUsername={showUsername}
              label={label ? col.searchLabel : undefined}
              focused={isOpen}
            />
          )
        }

        return (
          <StaticSelect
            key={col.variant}
            variant={col.variant}
            value={selectedValue}
            showUsername={showUsername}
            label={label ? col.label : undefined}
            isOpen={isOpen}
            id={`${id}-${col.variant}`}
          />
        )
      })}
    </div>
  )
}

/* StaticSelect: renders a frozen (non-interactive) trigger OR
   a trigger + open panel (when isOpen=true) */
function StaticSelect({
  variant,
  value,
  showUsername,
  label,
  isOpen,
  id,
}: {
  variant: MemberSelectIconVariant
  value: MemberOption | null
  showUsername: boolean
  label?: string
  isOpen: boolean
  id: string
}) {
  const [open, setOpen] = React.useState(isOpen)
  const [sel, setSel] = React.useState<MemberOption | null>(value)

  // Sync prop → state on initial render
  React.useEffect(() => {
    setOpen(isOpen)
    setSel(value)
  }, []) // intentionally run only once

  return (
    <MemberSelect
      id={id}
      options={MEMBERS}
      value={sel}
      onChange={setSel}
      iconVariant={variant}
      showUsername={showUsername}
      label={label}
      placeholder="Selecione um membro"
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Column header row
───────────────────────────────────────────────────────────── */

function ColHeaders() {
  const labels = ['none', 'user icon', 'avatar', 'dot', 'search']
  return (
    <div className="grid grid-cols-5 gap-4">
      {labels.map((l) => (
        <p
          key={l}
          className="text-[11px] font-semibold text-gray-400 uppercase text-center tracking-wider"
        >
          {l}
        </p>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

export default function MemberSelectSandboxPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-14">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            MemberSelect — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mapeamento completo de todas as variantes e estados do Figma. As
            linhas <strong>"Interactive"</strong> são totalmente funcionais —
            clique para abrir e selecionar.
          </p>
        </div>

        <ColHeaders />

        {/* ── Block A: Sem label, nome apenas ────────────────────────────── */}
        <Section title="A — Sem label · Nome apenas">
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Placeholder
            </p>
            <StaticRow
              state="placeholder"
              showUsername={false}
              label={false}
              id="a-ph"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Selecionado (fechado)
            </p>
            <StaticRow
              state="selected"
              showUsername={false}
              label={false}
              id="a-sel"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Interativo (clique para abrir)
            </p>
            <InteractiveRow showUsername={false} label={false} id="a-live" />
          </div>
        </Section>

        {/* ── Block B: Sem label, nome + @username ───────────────────────── */}
        <Section title="B — Sem label · Nome + @username">
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Placeholder
            </p>
            <StaticRow
              state="placeholder"
              showUsername={true}
              label={false}
              id="b-ph"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Selecionado (fechado)
            </p>
            <StaticRow
              state="selected"
              showUsername={true}
              label={false}
              id="b-sel"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Interativo
            </p>
            <InteractiveRow showUsername={true} label={false} id="b-live" />
          </div>
        </Section>

        {/* ── Block C: Com label, nome apenas ────────────────────────────── */}
        <Section title="C — Com label · Nome apenas">
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Placeholder
            </p>
            <StaticRow
              state="placeholder"
              showUsername={false}
              label={true}
              id="c-ph"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Selecionado (fechado)
            </p>
            <StaticRow
              state="selected"
              showUsername={false}
              label={true}
              id="c-sel"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Interativo
            </p>
            <InteractiveRow showUsername={false} label={true} id="c-live" />
          </div>
        </Section>

        {/* ── Block D: Com label, nome + @username ───────────────────────── */}
        <Section title="D — Com label · Nome + @username">
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Placeholder
            </p>
            <StaticRow
              state="placeholder"
              showUsername={true}
              label={true}
              id="d-ph"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Selecionado (fechado)
            </p>
            <StaticRow
              state="selected"
              showUsername={true}
              label={true}
              id="d-sel"
            />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase font-semibold">
              Interativo
            </p>
            <InteractiveRow showUsername={true} label={true} id="d-live" />
          </div>
        </Section>

        {/* ── Block E: Live integrated form example ──────────────────────── */}
        <Section title="E — Exemplo de formulário integrado">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">
              Atribuição de tarefa
            </p>
            <div className="grid grid-cols-2 gap-6">
              <LiveFormField
                label="Responsável"
                variant="user"
                showUsername={false}
                id="form-user"
              />
              <LiveFormField
                label="Revisor"
                variant="avatar"
                showUsername={true}
                id="form-avatar"
              />
              <LiveFormField
                label="Online agora"
                variant="dot"
                showUsername={false}
                id="form-dot"
              />
              <MemberSearchInputField label="Buscar membro" id="form-search" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Helpers for integrated form example
───────────────────────────────────────────────────────────── */

function LiveFormField({
  label,
  variant,
  showUsername,
  id,
}: {
  label: string
  variant: MemberSelectIconVariant
  showUsername: boolean
  id: string
}) {
  const [value, setValue] = React.useState<MemberOption | null>(null)
  return (
    <MemberSelect
      id={id}
      label={label}
      options={MEMBERS}
      value={value}
      onChange={setValue}
      iconVariant={variant}
      showUsername={showUsername}
      placeholder="Selecione um membro"
    />
  )
}

function MemberSearchInputField({ label, id }: { label: string; id: string }) {
  const [value, setValue] = React.useState<MemberOption | null>(null)
  return (
    <MemberSelect
      id={id}
      label={label}
      options={MEMBERS}
      value={value}
      onChange={setValue}
      iconVariant="search"
      showUsername={false}
      placeholder="Buscar"
    />
  )
}
