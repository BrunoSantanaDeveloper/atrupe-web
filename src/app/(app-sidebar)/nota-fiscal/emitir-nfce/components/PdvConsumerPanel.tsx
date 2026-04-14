'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { IconUser } from '@tabler/icons-react'

import { formatCpf } from './pdv-types'

interface PdvConsumerPanelProps {
  cpf: string
  nome: string
  onCpfChange: (value: string) => void
  onNomeChange: (value: string) => void
}

export function PdvConsumerPanel({
  cpf,
  nome,
  onCpfChange,
  onNomeChange,
}: PdvConsumerPanelProps) {
  const handleCpfChange = (value: string) => {
    onCpfChange(formatCpf(value))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconUser className="h-5 w-5" />
          Consumidor (Opcional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">CPF</Label>
          <Input
            value={cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Nome</Label>
          <Input
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome do consumidor"
          />
        </div>
      </CardContent>
    </Card>
  )
}
