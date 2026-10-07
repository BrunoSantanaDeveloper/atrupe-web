'use client'

// Lib Imports
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Type Imports
import type { PropsWithChildren } from 'react'

// Chave do localStorage onde fica a escolha do usuário (Claro / Escuro / Sistema)
export const THEME_STORAGE_KEY = 'atrupe-tema'

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemesProvider>
  )
}
