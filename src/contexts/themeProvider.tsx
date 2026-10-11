'use client'

// Lib Imports
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Type Imports
import type { PropsWithChildren } from 'react'

// Chave do localStorage onde fica a escolha do usuário (Claro / Escuro / Sistema)
export const THEME_STORAGE_KEY = 'atrupe-tema'

// O tema escuro ainda tem as tarefas de verificação abertas da mudança
// tema-claro-escuro (design/openspec). Até ela ser arquivada, o padrão é o
// claro, o sistema operacional não decide e os seletores ficam escondidos
// (THEME_SWITCHER em src/components/layout/theme-options.ts)
export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemesProvider>
  )
}
