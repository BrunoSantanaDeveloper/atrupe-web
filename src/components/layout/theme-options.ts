// Icons
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'

export type ThemeValue = 'light' | 'dark' | 'system'

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
