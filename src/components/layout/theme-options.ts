// Icons
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'

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
  icon: LucideIcon
}[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]
