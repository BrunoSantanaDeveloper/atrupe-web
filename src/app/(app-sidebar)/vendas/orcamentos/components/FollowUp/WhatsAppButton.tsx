'use client'

// "Chamar no WhatsApp" (CRM-3): abre o aplicativo com o telefone do cliente
// e a mensagem do modelo da empresa (CRM-5) já preenchida. Sem telefone no
// cadastro, o botão explica em vez de sumir.

import { IconBrandWhatsapp } from '@tabler/icons-react'

import { ActionButton } from '@/components/common/ActionButton'
import { Button } from '@/components/ui/button'
import { useFollowUpSettings } from '@/hooks/queries/useFollowUp'
import { fillTemplate, whatsappLink, type TemplateVars } from '@/lib/whatsapp'
import { useSession } from 'next-auth/react'

export type WhatsAppTemplate = 'proposalSent' | 'validity' | 'resume'

type Props = {
  phone?: string | null
  vars: TemplateVars
  template?: WhatsAppTemplate
  // Botão de texto (card) ou ícone (linha da lista)
  variant?: 'button' | 'icon'
}

export function WhatsAppButton({
  phone,
  vars,
  template = 'resume',
  variant = 'icon',
}: Props) {
  const { data: session } = useSession()
  const { data: settings } = useFollowUpSettings()
  const text = fillTemplate(
    settings?.[
      template === 'proposalSent'
        ? 'templateProposalSent'
        : template === 'validity'
          ? 'templateValidity'
          : 'templateResume'
    ] || 'Olá, {cliente}! Sobre a proposta {numero}: posso ajudar em algo?',
    {
      vendedor: session?.user?.name || '',
      empresa: session?.company?.name || '',
      ...vars,
    },
  )
  const link = whatsappLink(phone, text)
  const tooltip = link
    ? 'Chamar no WhatsApp'
    : 'Sem celular no cadastro do cliente'

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant="neutralOutline"
        LeftIcon={IconBrandWhatsapp}
        disabled={!link}
        title={tooltip}
        onClick={() => link && window.open(link, '_blank', 'noopener')}
      >
        Chamar no WhatsApp
      </Button>
    )
  }
  return (
    <ActionButton
      Icon={IconBrandWhatsapp}
      tooltip={tooltip}
      disabled={!link}
      onClick={() => link && window.open(link, '_blank', 'noopener')}
    />
  )
}
