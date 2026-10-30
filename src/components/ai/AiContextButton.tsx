'use client'

// O botão de contexto do assistente (seção 9): abre o chat já com o pedido
// da tela e o que ela tem aberto. Só aparece com o assistente no plano.

import { Button, type ButtonProps } from '@/components/ui/button'
import { useAiAccess } from '@/hooks/useAiAccess'
import { useAiChat, type AiChatContext } from '@/store/useAiChat'
import { IconSparkles } from '@tabler/icons-react'

export function AiContextButton({
  label,
  message,
  context,
  size = 'sm',
  variant = 'neutralOutline',
  className,
}: {
  label: string
  message: string
  context?: AiChatContext
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  className?: string
}) {
  const { visible, exceeded } = useAiAccess()
  const ask = useAiChat((state) => state.ask)
  if (!visible) return null
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      LeftIcon={IconSparkles}
      disabled={exceeded}
      title={exceeded ? 'A cota do assistente deste mês acabou' : undefined}
      onClick={() => ask({ message, context })}
    >
      {label}
    </Button>
  )
}
