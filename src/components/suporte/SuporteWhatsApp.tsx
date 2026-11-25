'use client'

// O contato do suporte pelo WhatsApp nas telas do sistema: o número vem do
// layout (buscarNumeroDoSuporte, no servidor) e é o que o superadmin escolhe
// em Super Admin › Atendimento › WhatsApp.

import { createContext, useContext, type PropsWithChildren } from 'react'
import { useSession } from 'next-auth/react'
import { IconBrandWhatsapp } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { linkDoSuporte } from '@/lib/suporte-whatsapp'

const NumeroDoSuporte = createContext<string | null>(null)

export function SuporteWhatsAppProvider({
  numero,
  children,
}: PropsWithChildren<{ numero: string | null }>) {
  return (
    <NumeroDoSuporte.Provider value={numero}>
      {children}
    </NumeroDoSuporte.Provider>
  )
}

/**
 * O link da conversa com o suporte, com a mensagem pronta dizendo de que
 * empresa a pessoa é. Null quando o atendimento não tem número.
 */
export function useSuporteWhatsApp() {
  const numero = useContext(NumeroDoSuporte)
  const { data: session } = useSession()
  if (!numero) return null
  const empresa = session?.company?.name?.trim()
  return linkDoSuporte(
    numero,
    empresa
      ? `Olá! Sou da ${empresa} e preciso de ajuda com o Atrupe.`
      : 'Olá! Preciso de ajuda com o Atrupe.',
  )
}

/** O botão flutuante do WhatsApp, no canto da tela, acima do assistente de IA. */
export function SuporteWhatsAppBotao() {
  const link = useSuporteWhatsApp()
  if (!link) return null
  return (
    <Button
      asChild
      variant="success"
      size="iconLg"
      rounded="full"
      className="shadow-xl"
    >
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com o suporte no WhatsApp"
        title="Falar com o suporte no WhatsApp"
      >
        <IconBrandWhatsapp className="size-7" />
      </a>
    </Button>
  )
}
