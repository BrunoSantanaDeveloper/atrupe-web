'use client'

import { useCallback, useState } from 'react'

// Gravação em andamento para o `isLoading` de um botão que dispara uma ação
// assíncrona sem mutation do React Query
// (design/openspec/changes/microinteracoes, Decisão 3). `pending` guarda a
// chave da ação em curso, para vários botões dividirem o mesmo estado.
export function usePending<Key extends string = string>() {
  const [pending, setPending] = useState<Key | null>(null)

  const track = useCallback(
    async <Result>(key: Key, task: () => Promise<Result> | Result) => {
      setPending(key)
      try {
        return await task()
      } finally {
        setPending(null)
      }
    },
    [],
  )

  return { pending, track }
}
