// Icons
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  type TablerIcon,
} from '@tabler/icons-react'

export type ThemeValue = 'light' | 'dark' | 'system'

// Os seletores de tema (menu do usuário no computador e menu lateral no
// celular) ficam escondidos até a mudança tema-claro-escuro (design/openspec)
// ser arquivada: o tema escuro ainda tem tarefas de verificação abertas. Até
// lá vale o claro (src/contexts/themeProvider.tsx)
export const THEME_SWITCHER = false as boolean

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
