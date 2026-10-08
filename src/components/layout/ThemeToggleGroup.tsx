'use client'

// React
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

// UI
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Components
import { THEME_OPTIONS } from './theme-options'
import { ICON_SIZE } from '@/components/ui/icon'

// Seletor de tema em linha (Claro / Escuro / Sistema), usado no menu do celular
export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme()

  // O tema só é conhecido no cliente: marcar a opção antes de montar
  // geraria diferença de hidratação
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      aria-label="Tema"
      value={mounted ? theme : undefined}
      onValueChange={(value) => value && setTheme(value)}
    >
      {THEME_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className="gap-1.5"
        >
          <option.icon size={ICON_SIZE.sm} />
          <span className="text-xs">{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
