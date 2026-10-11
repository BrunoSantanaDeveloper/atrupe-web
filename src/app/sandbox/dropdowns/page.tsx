'use client'

import React from 'react'
import {
  AccountDropdownMenu,
  AccountMenuGroup,
  AccountMenuVariant,
} from '@/components/common/account-dropdown-menu'
import { ChevronDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
   Shared menu data (matching Figma exactly)
───────────────────────────────────────────────────────────── */
const GROUPS_SIMPLE: AccountMenuGroup[] = [
  {
    items: [
      { label: 'View profile' },
      { label: 'Settings' },
      { label: 'Keyboard shortcuts' },
    ],
  },
  {
    items: [
      { label: 'Company profile' },
      { label: 'Team' },
      { label: 'Invite colleagues' },
    ],
  },
  {
    items: [
      { label: 'Changelog' },
      { label: 'Slack Community' },
      { label: 'Support' },
      { label: 'API' },
    ],
  },
  {
    items: [{ label: 'Log out' }],
  },
]

const GROUPS_SHORTCUTS: AccountMenuGroup[] = [
  {
    items: [
      { label: 'View profile', shortcut: '⌘K→P' },
      { label: 'Settings', shortcut: '⌘S' },
      { label: 'Keyboard shortcuts', shortcut: '?' },
    ],
  },
  {
    items: [
      { label: 'Company profile', shortcut: '⌘K→C' },
      { label: 'Team', shortcut: '⌘K→T' },
      { label: 'Invite colleagues', shortcut: '⌘I' },
    ],
  },
  {
    items: [
      { label: 'Changelog', shortcut: '⌘K→C' },
      { label: 'Slack Community', shortcut: '⌘K→S' },
      { label: 'Support', shortcut: '⌘/' },
      { label: 'API', shortcut: '⌘A' },
    ],
  },
  {
    items: [{ label: 'Log out', shortcut: '⌥⇧Q' }],
  },
]

const GROUPS_CHECKBOXES: AccountMenuGroup[] = [
  {
    items: [
      { label: 'List item', shortcut: '1' },
      { label: 'List item', shortcut: '2' },
      { label: 'List item', shortcut: '3' },
    ],
  },
  {
    items: [
      { label: 'List item', shortcut: '1' },
      { label: 'List item', shortcut: '2' },
      { label: 'List item', shortcut: '3' },
    ],
  },
  {
    items: [
      { label: 'List item', shortcut: '1' },
      { label: 'List item', shortcut: '2' },
      { label: 'List item', shortcut: '3' },
      { label: 'List item', shortcut: '4' },
    ],
  },
  {
    items: [{ label: 'List item', shortcut: '1' }],
  },
]

const AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia'

/* ─────────────────────────────────────────────────────────────
   Trigger button helper
───────────────────────────────────────────────────────────── */
function Trigger({ label }: { label: string }) {
  return (
    <button
      id={`trigger-${label.replace(/\s+/g, '-').toLowerCase()}`}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white shadow-[0px_1px_2px_0_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors"
    >
      {label}
      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   Variant card
───────────────────────────────────────────────────────────── */
function VariantCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-900">{title}</p>
        {description && (
          <p className="text-[11px] text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-start gap-4 flex-wrap">{children}</div>
    </div>
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
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function DropdownSandboxPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dropdown Menu — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            6 variantes do <code>AccountDropdownMenu</code> mapeadas diretamente
            do Figma.
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Clique nos triggers para abrir os menus interativos.
          </p>
        </div>

        {/* ── Row 1: Simple (no header, no shortcuts) ─────────────────── */}
        <Section title="Variant 1 — Simple (itens sem atalhos, sem header)">
          <VariantCard
            title="simple"
            description="Conforme painel superior do Figma"
          >
            <AccountDropdownMenu
              variant="simple"
              groups={GROUPS_SIMPLE}
              trigger={<Trigger label="Simple menu" />}
              align="start"
            />
          </VariantCard>
        </Section>

        {/* ── Row 2: Shortcuts (no header) ────────────────────────────── */}
        <Section title="Variant 2 — Shortcuts (atalhos, sem header)">
          <VariantCard title="shortcuts">
            <AccountDropdownMenu
              variant="shortcuts"
              groups={GROUPS_SHORTCUTS}
              trigger={<Trigger label="Com atalhos" />}
              align="start"
            />
          </VariantCard>
        </Section>

        {/* ── Row 3: Label header + shortcuts ─────────────────────────── */}
        <Section title='Variant 3 — "Menu da conta" label + shortcuts'>
          <VariantCard title="label-shortcuts">
            <AccountDropdownMenu
              variant="label-shortcuts"
              menuLabel="Menu da conta"
              groups={GROUPS_SHORTCUTS}
              trigger={<Trigger label="Label + atalhos" />}
              align="start"
            />
          </VariantCard>
        </Section>

        {/* ── Row 4: Avatar header + shortcuts ────────────────────────── */}
        <Section title="Variant 4 — Avatar header + shortcuts">
          <VariantCard title="avatar-shortcuts">
            <AccountDropdownMenu
              variant="avatar-shortcuts"
              avatarSrc={AVATAR}
              userName="Olivia Rhye"
              userEmail="olivia@untitledui.com"
              presenceColor="#12B76A"
              groups={GROUPS_SHORTCUTS}
              trigger={<Trigger label="Avatar + atalhos" />}
              align="start"
            />
          </VariantCard>
        </Section>

        {/* ── Row 5: Label header + checkboxes ────────────────────────── */}
        <Section title='Variant 5 — "Menu da conta" label + checkboxes'>
          <VariantCard title="label-checkboxes">
            <AccountDropdownMenu
              variant="label-checkboxes"
              menuLabel="Menu da conta"
              groups={GROUPS_CHECKBOXES}
              trigger={<Trigger label="Label + checkboxes" />}
              align="start"
            />
          </VariantCard>
        </Section>

        {/* ── Row 6: Avatar header + checkboxes ───────────────────────── */}
        <Section title="Variant 6 — Avatar header + checkboxes">
          <VariantCard title="avatar-checkboxes">
            <AccountDropdownMenu
              variant="avatar-checkboxes"
              avatarSrc={AVATAR}
              userName="Olivia Rhye"
              userEmail="olivia@untitledui.com"
              presenceColor="#12B76A"
              groups={GROUPS_CHECKBOXES}
              trigger={<Trigger label="Avatar + checkboxes" />}
              align="start"
            />
          </VariantCard>
        </Section>

        {/* ── All 6 side-by-side grid ──────────────────────────────────── */}
        <Section title="Grid — Todas as variantes lado a lado">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {(
              [
                {
                  variant: 'simple',
                  label: '1. Simple',
                  groups: GROUPS_SIMPLE,
                },
                {
                  variant: 'shortcuts',
                  label: '2. Shortcuts',
                  groups: GROUPS_SHORTCUTS,
                },
                {
                  variant: 'label-shortcuts',
                  label: '3. Label + Shortcuts',
                  groups: GROUPS_SHORTCUTS,
                },
                {
                  variant: 'avatar-shortcuts',
                  label: '4. Avatar + Shortcuts',
                  groups: GROUPS_SHORTCUTS,
                },
                {
                  variant: 'label-checkboxes',
                  label: '5. Label + Checkboxes',
                  groups: GROUPS_CHECKBOXES,
                },
                {
                  variant: 'avatar-checkboxes',
                  label: '6. Avatar + Checkboxes',
                  groups: GROUPS_CHECKBOXES,
                },
              ] as const
            ).map(({ variant, label, groups }) => (
              <AccountDropdownMenu
                key={variant}
                variant={variant as AccountMenuVariant}
                avatarSrc={AVATAR}
                userName="Olivia Rhye"
                userEmail="olivia@untitledui.com"
                presenceColor="#12B76A"
                menuLabel="Menu da conta"
                groups={groups}
                trigger={<Trigger label={label} />}
                align="start"
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
