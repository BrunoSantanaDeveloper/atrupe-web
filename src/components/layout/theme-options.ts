// Icons
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  type TablerIcon,
} from '@tabler/icons-react'

export type ThemeValue = 'light' | 'dark' | 'system'

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
