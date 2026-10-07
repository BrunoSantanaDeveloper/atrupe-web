'use client'

import React, { useState } from 'react'
import {
  NavMenu,
  NavItem,
  NavGroup,
  NavItemDef,
  NavGroupDef,
  NavEntry,
} from '@/components/common/nav-menu'

export const dynamic = 'force-dynamic'

/* ─────────────────────────────────────────────────────────────
   Mini icon helpers (using currentColor param pattern)
───────────────────────────────────────────────────────────── */

const ChartIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 19H20M4 15L8 9L12 11L16 6L20 10V15H4Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const DollarIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M14.8 9C14.6188 8.68577 14.3557 8.42671 14.0386 8.25056C13.7215 8.07441 13.3625 7.9878 13 8H11C10.4696 8 9.96086 8.21072 9.58579 8.58579C9.21071 8.96086 9 9.46957 9 10C9 10.5304 9.21071 11.0391 9.58579 11.4142C9.96086 11.7893 10.4696 12 11 12H13C13.5304 12 14.0391 12.2107 14.4142 12.5858C14.7893 12.9609 15 13.4696 15 14C15 14.5304 14.7893 15.0391 14.4142 15.4142C14.0391 15.7893 13.5304 16 13 16H11C10.6375 16.0122 10.2785 15.9256 9.96142 15.7495C9.64435 15.5733 9.38115 15.3142 9.2 15M12 7V17M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3C10.8181 3 9.64778 3.23279 8.55585 3.68508C7.46392 4.13738 6.47177 4.80031 5.63604 5.63604C4.80031 6.47177 4.13738 7.46392 3.68508 8.55585C3.23279 9.64778 3 10.8181 3 12Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const UsersIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 21V19C3 17.9391 3.42143 16.9217 4.17157 16.1716C4.92172 15.4214 5.93913 15 7 15H11C12.0609 15 13.0783 15.4214 13.8284 16.1716C14.5786 16.9217 15 17.9391 15 19V21M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799M21 20.9999V18.9999C20.9949 18.1171 20.6979 17.2607 20.1553 16.5643C19.6126 15.8679 18.8548 15.3706 18 15.1499M5 7C5 8.06087 5.42143 9.07828 6.17157 9.82843C6.92172 10.5786 7.93913 11 9 11C10.0609 11 11.0783 10.5786 11.8284 9.82843C12.5786 9.07828 13 8.06087 13 7C13 5.93913 12.5786 4.92172 11.8284 4.17157C11.0783 3.42143 10.0609 3 9 3C7.93913 3 6.92172 3.42143 6.17157 4.17157C5.42143 4.92172 5 5.93913 5 7Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SettingsIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const FileIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19M14 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V8M14 3L19 8M9 15L11 17L15 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BuildingIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 21H21M9 8H10M9 12H10M9 16H10M14 8H15M14 12H15M14 16H15M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ReportIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 19V13C9 12.7348 8.89464 12.4804 8.70711 12.2929C8.51957 12.1054 8.26522 12 8 12H4C3.73478 12 3.48043 12.1054 3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V19C3 19.2652 3.10536 19.5196 3.29289 19.7071C3.48043 19.8946 3.73478 20 4 20M9 19C9 19.2652 8.89464 19.5196 8.70711 19.7071C8.51957 19.8946 8.26522 20 8 20H4M9 19C9 19.2652 9.10536 19.5196 9.29289 19.7071C9.48043 19.8946 9.73478 20 10 20H14C14.2652 20 14.5196 19.8946 14.7071 19.7071C14.8946 19.5196 15 19.2652 15 19M9 19V9C9 8.73478 9.10536 8.48043 9.29289 8.29289C9.48043 8.10536 9.73478 8 10 8H14C14.2652 8 14.5196 8.10536 14.7071 8.29289C14.8946 8.48043 15 8.73478 15 9V19M4 20H18M15 19C15 19.2652 15.1054 19.5196 15.2929 19.7071C15.4804 19.8946 15.7348 20 16 20H20C20.2652 20 20.5196 19.8946 20.7071 19.7071C20.8946 19.5196 21 19.2652 21 19V5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4H16C15.7348 4 15.4804 4.10536 15.2929 4.29289C15.1054 4.48043 15 4.73478 15 5V19Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ReceivableIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 17L9 11L13 15L21 7M21 7H14M21 7V14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PayableIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 7L9 13L13 9L21 17M21 17V10M21 17H14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const QuotationIcon = (color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M14 11H11.5C11.1022 11 10.7206 11.158 10.4393 11.4393C10.158 11.7206 10 12.1022 10 12.5C10 12.8978 10.158 13.2794 10.4393 13.5607C10.7206 13.842 11.1022 14 11.5 14H12.5C12.8978 14 13.2794 14.158 13.5607 14.4393C13.842 14.7206 14 15.1022 14 15.5C14 15.8978 13.842 16.2794 13.5607 16.5607C13.2794 16.842 12.8978 17 12.5 17H10M12 17V18M12 10V11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// CTA "+" icon (green filled)
const CtaPlusIcon = (_color: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L12.324 2.001L12.642 2.005L13.258 2.022L13.557 2.035L14.136 2.069L14.689 2.115C19.474 2.579 21.421 4.526 21.885 9.311L21.931 9.864L21.965 10.443C21.97 10.541 21.975 10.641 21.978 10.742L21.995 11.358L22 12L21.995 12.642L21.978 13.258L21.965 13.557L21.931 14.136L21.885 14.689C21.421 19.474 19.474 21.421 14.689 21.885L14.136 21.931L13.557 21.965C13.459 21.97 13.359 21.975 13.258 21.978L12.642 21.995L12 22L11.358 21.995L10.742 21.978L10.443 21.965L9.864 21.931L9.311 21.885C4.526 21.421 2.579 19.474 2.115 14.689L2.069 14.136L2.035 13.557C2.03014 13.4574 2.0258 13.3577 2.022 13.258L2.005 12.642C2.002 12.432 2 12.218 2 12L2.001 11.676L2.005 11.358L2.022 10.742L2.035 10.443L2.069 9.864L2.115 9.311C2.579 4.526 4.526 2.579 9.311 2.115L9.864 2.069L10.443 2.035C10.541 2.03 10.641 2.025 10.742 2.022L11.358 2.005C11.568 2.002 11.782 2 12 2ZM12 8C11.7348 8 11.4804 8.10536 11.2929 8.29289C11.1054 8.48043 11 8.73478 11 9V11H9L8.883 11.007C8.6299 11.0371 8.39785 11.1627 8.23426 11.3582C8.07067 11.5536 7.98789 11.8042 8.00283 12.0586C8.01776 12.313 8.1293 12.5522 8.31463 12.7272C8.49997 12.9021 8.74512 12.9997 9 13H11V15L11.007 15.117C11.0371 15.3701 11.1627 15.6021 11.3582 15.7657C11.5536 15.9293 11.8042 16.0121 12.0586 15.9972C12.313 15.9822 12.5522 15.8707 12.7272 15.6854C12.9021 15.5 12.9997 15.2549 13 15V13H15L15.117 12.993C15.3701 12.9629 15.6021 12.8373 15.7657 12.6418C15.9293 12.4464 16.0121 12.1958 15.9972 11.9414C15.9822 11.687 15.8707 11.4478 15.6854 11.2728C15.5 11.0979 15.2549 11.0003 15 11H13V9L12.993 8.883C12.9643 8.63975 12.8474 8.41547 12.6644 8.25272C12.4813 8.08996 12.2449 8.00003 12 8Z"
      fill="#099260"
    />
  </svg>
)

/* ─────────────────────────────────────────────────────────────
   Section label helper
───────────────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
      {children}
    </h2>
  )
}

function StateLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
      {label}
    </p>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <StateLabel label={title} />
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 inline-flex">
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Datasets
───────────────────────────────────────────────────────────── */

const standaloneItems: NavItemDef[] = [
  {
    id: 's1',
    label: 'Default item',
    icon: ChartIcon,
    badge: { type: 'counter', label: '+9' },
  },
  {
    id: 's2',
    label: 'Active item',
    icon: ChartIcon,
    badge: { type: 'counter', label: '+9' },
    active: true,
  },
  { id: 's3', label: 'CTA action', icon: CtaPlusIcon, variant: 'cta' },
  { id: 's4', label: 'Item sem badge', icon: DollarIcon },
  {
    id: 's5',
    label: 'Alert badge item',
    icon: UsersIcon,
    badge: { type: 'alert' },
  },
  {
    id: 's6',
    label: 'Alert badge ativo',
    icon: UsersIcon,
    badge: { type: 'alert' },
    active: true,
  },
  {
    id: 's7',
    label: 'Counter + default',
    icon: FileIcon,
    badge: { type: 'counter', label: '3' },
  },
  { id: 's8', label: 'Sem badge', icon: BuildingIcon },
]

const salesGroup: NavGroupDef = {
  id: 'vendas',
  label: 'Vendas',
  icon: DollarIcon,
  defaultOpen: true,
  items: [
    {
      id: 'orcamentos',
      label: 'Orçamentos',
      icon: QuotationIcon,
      badge: { type: 'counter', label: '+9' },
    },
    {
      id: 'os',
      label: 'Ordens de Serviço',
      icon: FileIcon,
      badge: { type: 'counter', label: '+9' },
    },
    {
      id: 'nova-venda',
      label: 'Nova venda rápida',
      icon: CtaPlusIcon,
      variant: 'cta',
    },
  ],
}

const financialGroup: NavGroupDef = {
  id: 'financeiro',
  label: 'Financeiro',
  icon: ReportIcon,
  defaultOpen: false,
  items: [
    {
      id: 'a-receber',
      label: 'A Receber',
      icon: ReceivableIcon,
      badge: { type: 'counter', label: '+9' },
    },
    {
      id: 'a-pagar',
      label: 'A Pagar',
      icon: PayableIcon,
      badge: { type: 'counter', label: '+9' },
    },
    { id: 'fluxo', label: 'Fluxo Financeiro', icon: ChartIcon },
    { id: 'caixa', label: 'Controle de Caixa', icon: DollarIcon },
  ],
}

const registroGroup: NavGroupDef = {
  id: 'cadastros',
  label: 'Cadastros',
  icon: UsersIcon,
  defaultOpen: true,
  items: [
    { id: 'clientes', label: 'Clientes', icon: UsersIcon },
    { id: 'fornecedores', label: 'Fornecedores', icon: BuildingIcon },
    {
      id: 'novo-cliente',
      label: 'Novo cliente',
      icon: CtaPlusIcon,
      variant: 'cta',
      active: true,
    },
  ],
}

const settingsGroup: NavGroupDef = {
  id: 'configuracoes',
  label: 'Configurações',
  icon: SettingsIcon,
  defaultOpen: false,
  items: [
    { id: 'empresa', label: 'Empresa e sistema', icon: BuildingIcon },
    { id: 'produtos', label: 'Produtos', icon: FileIcon },
    { id: 'fiscal-cfg', label: 'Nota Fiscal', icon: FileIcon },
  ],
}

/* Full sidebar entries (real app nav) */
const fullNavEntries: NavEntry[] = [
  salesGroup,
  financialGroup,
  registroGroup,
  settingsGroup,
]

/* ─────────────────────────────────────────────────────────────
   Interactive demo state
───────────────────────────────────────────────────────────── */

export default function NavMenuSandboxPage() {
  const [activeId, setActiveId] = useState<string>('a-receber')
  const [lastClicked, setLastClicked] = useState<string>('')

  // Build interactive full nav with dynamic active state
  const interactiveEntries: NavEntry[] = [
    {
      ...salesGroup,
      items: salesGroup.items.map((i) => ({ ...i, active: i.id === activeId })),
    },
    {
      ...financialGroup,
      defaultOpen: true,
      items: financialGroup.items.map((i) => ({
        ...i,
        active: i.id === activeId,
      })),
    },
    {
      ...registroGroup,
      items: registroGroup.items.map((i) => ({
        ...i,
        active: i.variant === 'cta' ? false : i.id === activeId,
      })),
    },
    {
      ...settingsGroup,
      items: settingsGroup.items.map((i) => ({
        ...i,
        active: i.id === activeId,
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            NavMenu — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Componentes: <code>NavItem</code> · <code>NavGroup</code> ·{' '}
            <code>NavMenu</code>
          </p>
        </div>

        {/* ══════════════════════════════════════
            1. NavItem — all variants × states
        ══════════════════════════════════════ */}
        <section>
          <SectionTitle>1 — NavItem · Variantes e estados</SectionTitle>

          <div className="grid grid-cols-3 gap-10">
            {/* 1.1 Default */}
            <Card title="Default (no badge)">
              <div className="flex flex-col gap-1 w-[232px]">
                <NavItem
                  item={{ id: 'i1', label: 'Default', icon: ChartIcon }}
                />
                <NavItem
                  item={{
                    id: 'i2',
                    label: 'Active',
                    icon: ChartIcon,
                    active: true,
                  }}
                />
                <NavItem
                  item={{
                    id: 'i3',
                    label: 'CTA action',
                    icon: CtaPlusIcon,
                    variant: 'cta',
                  }}
                />
              </div>
            </Card>

            {/* 1.2 Counter badge */}
            <Card title="Counter badge (+9)">
              <div className="flex flex-col gap-1 w-[232px]">
                <NavItem
                  item={{
                    id: 'i4',
                    label: 'Default + badge',
                    icon: ChartIcon,
                    badge: { type: 'counter', label: '+9' },
                  }}
                />
                <NavItem
                  item={{
                    id: 'i5',
                    label: 'Active + badge',
                    icon: ChartIcon,
                    badge: { type: 'counter', label: '+9' },
                    active: true,
                  }}
                />
                <NavItem
                  item={{
                    id: 'i6',
                    label: 'Long label that wraps ok',
                    icon: DollarIcon,
                    badge: { type: 'counter', label: '3' },
                  }}
                />
              </div>
            </Card>

            {/* 1.3 Alert badge */}
            <Card title="Alert badge (orange)">
              <div className="flex flex-col gap-1 w-[232px]">
                <NavItem
                  item={{
                    id: 'i7',
                    label: 'Pending review',
                    icon: UsersIcon,
                    badge: { type: 'alert' },
                  }}
                />
                <NavItem
                  item={{
                    id: 'i8',
                    label: 'Active + alert',
                    icon: UsersIcon,
                    badge: { type: 'alert' },
                    active: true,
                  }}
                />
                <NavItem
                  item={{
                    id: 'i9',
                    label: 'Default no alert',
                    icon: BuildingIcon,
                  }}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* ══════════════════════════════════════
            2. NavGroup — collapsed + expanded
        ══════════════════════════════════════ */}
        <section>
          <SectionTitle>2 — NavGroup · Collapsed e Expanded</SectionTitle>

          <div className="grid grid-cols-3 gap-10">
            <Card title="Collapsed (defaultOpen=false)">
              <div className="w-[232px]">
                <NavGroup group={{ ...salesGroup, defaultOpen: false }} />
              </div>
            </Card>

            <Card title="Expanded (defaultOpen=true)">
              <div className="w-[232px]">
                <NavGroup group={{ ...salesGroup, defaultOpen: true }} />
              </div>
            </Card>

            <Card title="Expanded with active sub-item">
              <div className="w-[232px]">
                <NavGroup
                  group={{
                    ...registroGroup,
                    defaultOpen: true,
                    items: registroGroup.items.map((i) =>
                      i.id === 'clientes' ? { ...i, active: true } : i,
                    ),
                  }}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* ══════════════════════════════════════
            3. Standalone items list
        ══════════════════════════════════════ */}
        <section>
          <SectionTitle>
            3 — NavMenu com items standalone (sem grupo)
          </SectionTitle>

          <Card title="Lista plana de 8 items">
            <NavMenu
              entries={standaloneItems}
              onItemClick={(id) => setLastClicked(id)}
            />
          </Card>
        </section>

        {/* ══════════════════════════════════════
            4. NavMenu — multiple groups
        ══════════════════════════════════════ */}
        <section>
          <SectionTitle>4 — NavMenu com múltiplos grupos</SectionTitle>

          <Card title="4 grupos colapsáveis">
            <div className="w-[232px]">
              <NavMenu entries={fullNavEntries} />
            </div>
          </Card>
        </section>

        {/* ══════════════════════════════════════
            5. Interactive — click to activate
        ══════════════════════════════════════ */}
        <section>
          <SectionTitle>5 — Interativo · Clique para ativar item</SectionTitle>

          <div className="flex gap-8 items-start">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-[240px]">
              {/* Mock sidebar header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">Atrupe</p>
                <p className="text-xs text-gray-500">Menu de navegação</p>
              </div>
              <div className="p-3">
                <NavMenu
                  entries={interactiveEntries}
                  onItemClick={(id) => {
                    setActiveId(id)
                    setLastClicked(id)
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Item ativo
                </p>
                <code className="text-sm font-medium text-gray-900">
                  {activeId}
                </code>
              </div>
              {lastClicked && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Último clique
                  </p>
                  <code className="text-sm font-medium text-gray-900">
                    {lastClicked}
                  </code>
                </div>
              )}
              <p className="text-xs text-gray-400 max-w-[200px]">
                Clique nos itens do menu lateral para alterar o estado ativo.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
