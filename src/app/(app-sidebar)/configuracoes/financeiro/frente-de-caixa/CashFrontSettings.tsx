'use client'

// A configuração da frente de caixa em Configurações › Financeiro (14/11/2026):
// é trabalho do administrador (FC-15), não do operador. Na tela do caixa a
// engrenagem só aparece até o primeiro caixa ser aberto.

// React
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { CashFrontSettingsDialog } from '../../../financeiro/frente-de-caixa/components/CashFrontSettingsDialog'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconArrowRight } from '@tabler/icons-react'

export function CashFrontSettings() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  return (
    <>
      <Button RightIcon={IconArrowRight} onClick={() => setOpen(true)}>
        Configurar
      </Button>
      <CashFrontSettingsDialog
        open={open}
        onDone={() =>
          queryClient.invalidateQueries({ queryKey: ['cash-front'] })
        }
        onOpenChange={setOpen}
      />
    </>
  )
}
