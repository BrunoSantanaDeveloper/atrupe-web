'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconRobot as Bot, IconDeviceFloppy as Save } from '@tabler/icons-react'
import { toast } from 'sonner'

import { updateAiAccessSettings } from '@/actions/systemSettings'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

export function AiAccessForm({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    const toastId = toast.loading('Salvando configuracao...')

    try {
      const response = await updateAiAccessSettings({ enabled })
      if (!response.success) {
        toast.error(response.message, { id: toastId })
        return
      }

      toast.success('Acesso ao Assistente IA atualizado.', { id: toastId })
      router.refresh()
    } catch {
      toast.error('Nao foi possivel atualizar o acesso ao Assistente IA.', {
        id: toastId,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-brand-600" />
          <CardTitle>Assistente IA</CardTitle>
        </div>
        <CardDescription>
          Controle a disponibilidade geral do assistente para os usuarios do
          Atrupe.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Acesso ao assistente
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {enabled
                ? 'O chat esta disponivel para usuarios autenticados.'
                : 'O chat esta oculto e as consultas estao bloqueadas.'}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Ativar acesso ao Assistente IA"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            LeftIcon={Save}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Salvar configuracao
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
