'use client'

// UI
import { CardContent } from '@/components/ui/card'

interface Props {
  message?: string
}

// A leitura falhou (sem permissão, recurso fora do plano, API fora do ar):
// mostra o motivo que veio do servidor. O estado vazio diria "nada
// cadastrado", que não é o caso
export function LoadError({ message }: Props) {
  return (
    <CardContent className="px-6 py-10 text-center text-sm text-gray">
      {message || 'Não foi possível carregar os dados.'}
    </CardContent>
  )
}
