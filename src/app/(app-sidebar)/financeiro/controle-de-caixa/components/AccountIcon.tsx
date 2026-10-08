// O ícone da conta no padrão do sistema: o logo do banco, e o do Atrupe
// quando não há logo (como na listagem de caixas original)

// UI
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Consts
import { bankIcons } from '@/consts/cashControl'
import { LogoAtrupe } from '@/assets/logos'

export function AccountIcon({ icon }: { icon?: string }) {
  return (
    <FeaturedIcon
      Icon={(icon && bankIcons[icon]) || LogoAtrupe}
      tone="neutral"
    />
  )
}
