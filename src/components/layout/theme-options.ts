// Icons
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  type TablerIcon,
} from '@tabler/icons-react'

export type ThemeValue = 'light' | 'dark' | 'system'

// Seletores de tema (menu do usuário no computador e menu lateral no celular)
// ligados em 29/10/2026. O padrão continua o claro: só fica escuro quem
// escolher. Pendente na mudança tema-claro-escuro (design/openspec): a
// legibilidade das séries dos gráficos e dos controles nativos no escuro
export const THEME_SWITCHER = true as boolean

// Opções do seletor de tema, na ordem em que aparecem
// (menu do usuário no computador e menu lateral no celular)
export const THEME_OPTIONS: {
  value: ThemeValue
  label: string
  icon: TablerIcon
}[] = [
  { value: 'light', label: 'Claro', icon: IconSun },
  { value: 'dark', label: 'Escuro', icon: IconMoon },
  { value: 'system', label: 'Sistema', icon: IconDeviceDesktop },
]
