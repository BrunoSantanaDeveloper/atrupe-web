// O ícone da conta no padrão do sistema: o logo do banco, e o do Atrupe
// quando não há logo (como na listagem de caixas original). A gaveta (banco
// "Caixa Empresa") usa o ícone da própria empresa, o que ela cadastrou em
// Configurações › Empresa (o mesmo do cartão da empresa)
'use client'

import { useSession } from 'next-auth/react'

// UI
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Consts
import { bankIcons } from '@/consts/cashControl'
import { LogoAtrupe } from '@/assets/logos'

// A API manda "empresa"; "company" é a chave antiga do mapa de logos
const COMPANY_ICONS = ['empresa', 'company']

export function AccountIcon({ icon }: { icon?: string }) {
  const { data: session } = useSession()
  const companyIcon = session?.company?.favicon

  if (icon && COMPANY_ICONS.includes(icon) && companyIcon) {
    return (
      <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={companyIcon}
          alt=""
          aria-hidden="true"
          className="size-6 object-contain"
        />
      </span>
    )
  }

  return (
    <FeaturedIcon
      Icon={(icon && bankIcons[icon]) || LogoAtrupe}
      tone="neutral"
    />
  )
}
