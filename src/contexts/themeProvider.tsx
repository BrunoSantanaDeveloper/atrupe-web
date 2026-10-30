'use client'

// Lib Imports
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Type Imports
import type { PropsWithChildren } from 'react'

// Chave do localStorage onde fica a escolha do usuário (Claro / Escuro / Sistema)
export const THEME_STORAGE_KEY = 'atrupe-tema'

// O padrão é o claro; a pessoa escolhe Claro, Escuro ou Sistema no menu do
// usuário (THEME_SWITCHER em src/components/layout/theme-options.ts). Com
// "Sistema", vale o tema do sistema operacional
export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemesProvider>
  )
}
