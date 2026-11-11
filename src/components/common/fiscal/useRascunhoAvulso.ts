'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { createItem, deleteItemNew, getItem } from '@/actions/_cruds'

type DocTypeAvulso = 'NFE' | 'NFSE' | 'NFCE'

interface Params<P> {
  docType: DocTypeAvulso
  /**
   * Retrato do ESTADO DA TELA, não do corpo da emissão. O payload de emissão
   * é derivado e perde o que a tela precisa para voltar ao ponto — a lista de
   * itens, por exemplo, sai dele num formato diferente do que o formulário
   * usa. Retomar tem de recompor a tela exatamente como estava.
   */
  montarEstado: () => P
  /** Resumo para a listagem — normalmente o nome do destinatário. */
  descricao?: string
  /** Total em reais, só para exibição na listagem. */
  total?: number
  /**
   * Só grava depois que a tela terminou de carregar e tem algo digitado.
   * Sem isso o primeiro render salvaria um rascunho vazio.
   */
  temConteudo: boolean
}

/**
 * Rascunho de nota avulsa: salva sozinho e retoma de onde parou.
 *
 * As três telas avulsas não gravavam nada — sair da página perdia tudo, e a
 * NFC-e nem tinha o status de digitação. Gravar é automático de propósito:
 * um botão "salvar rascunho" só funciona para quem lembra de clicar, e quem
 * perde o trabalho é justamente quem não lembrou.
 *
 * O rascunho não é documento fiscal e vive em tabela própria; a emissão é que
 * cria a nota, e aí o rascunho é descartado.
 */
export function useRascunhoAvulso<P>({
  docType,
  montarEstado,
  descricao,
  total,
  temConteudo,
}: Params<P>) {
  const searchParams = useSearchParams()
  const idDaUrl = searchParams.get('draftId')

  const [draftId, setDraftId] = useState<string | null>(idDaUrl)
  const [estadoRetomado, setEstadoRetomado] = useState<P | null>(null)
  const [carregandoRascunho, setCarregandoRascunho] = useState(!!idDaUrl)
  const [salvoEm, setSalvoEm] = useState<Date | null>(null)

  // A última versão já gravada, para não reescrever o que não mudou.
  const ultimoSalvo = useRef<string | null>(null)
  const salvando = useRef(false)

  useEffect(() => {
    if (!idDaUrl) return
    let ativo = true
    ;(async () => {
      const resultado = await getItem({ route: `/fiscal/drafts/${idDaUrl}` })
      if (!ativo) return
      if (resultado.success && resultado.data) {
        const rascunho = resultado.data as { payload?: P }
        if (rascunho.payload) {
          setEstadoRetomado(rascunho.payload)
          ultimoSalvo.current = JSON.stringify(rascunho.payload)
        }
      }
      setCarregandoRascunho(false)
    })()
    return () => {
      ativo = false
    }
  }, [idDaUrl])

  const salvar = useCallback(async () => {
    if (salvando.current) return
    const estado = montarEstado()
    const assinatura = JSON.stringify(estado)
    if (assinatura === ultimoSalvo.current) return

    salvando.current = true
    try {
      const resultado = await createItem({
        customPath: '/fiscal/drafts',
        data: {
          ...(draftId ? { id: draftId } : {}),
          docType,
          description: descricao?.slice(0, 200) || undefined,
          totalValue: total ?? 0,
          payload: estado,
        },
      })
      const salvo = resultado as { id?: string }
      if (salvo?.id) setDraftId(salvo.id)
      ultimoSalvo.current = assinatura
      setSalvoEm(new Date())
    } catch {
      // Falha ao gravar rascunho não pode atrapalhar quem está digitando:
      // a próxima alteração tenta de novo.
    } finally {
      salvando.current = false
    }
  }, [docType, descricao, draftId, montarEstado, total])

  // Grava dois segundos depois da última tecla.
  const assinaturaAtual = temConteudo ? JSON.stringify(montarEstado()) : null
  useEffect(() => {
    if (!temConteudo || carregandoRascunho) return
    const timer = setTimeout(salvar, 2000)
    return () => clearTimeout(timer)
  }, [assinaturaAtual, temConteudo, carregandoRascunho, salvar])

  /** Chamar depois de emitir: o que virou nota não é mais rascunho. */
  const descartar = useCallback(async () => {
    if (!draftId) return
    await deleteItemNew({ route: `/fiscal/drafts/${draftId}` })
    setDraftId(null)
    ultimoSalvo.current = null
  }, [draftId])

  return { draftId, estadoRetomado, carregandoRascunho, salvoEm, descartar }
}
