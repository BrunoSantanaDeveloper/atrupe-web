import { toast } from 'sonner'

// Actions
import { getItem } from '@/actions/_cruds'

/**
 * Abre o PDF de uma NFS-e numa aba nova.
 *
 * O `pdfUrl` que o provedor devolve na emissão (DocPDFDownload) não é um PDF:
 * é uma página do portal do InvoiCy (HTML + reCAPTCHA) que monta o download
 * dentro do navegador. Aberta numa aba criada por script, ela não entregava
 * arquivo nenhum — clicar em "Ver PDF" não fazia efeito visível. A API agora
 * devolve os bytes buscados no provedor (`pdfBase64`), como já era feito com a
 * DANFE da NF-e; o link do portal fica só como último recurso.
 *
 * A aba é aberta antes do await de propósito: criada depois da resposta, ela
 * perde o gesto do usuário e cai no bloqueador de pop-ups.
 */
export async function abrirPdfNfse(
  nfseId: string,
  linkDeFallback?: string | null,
) {
  const previewWindow = window.open('', '_blank')
  if (!previewWindow) {
    toast.error('Permita a abertura de pop-ups para visualizar o PDF')
    return
  }

  try {
    const result = await getItem({ route: `/fiscal/nfse/${nfseId}/pdf` })
    if (!result.success) {
      throw new Error(result.message || 'PDF não disponível')
    }

    if (result.data?.pdfBase64) {
      const binary = window.atob(result.data.pdfBase64)
      const bytes = new Uint8Array(binary.length)
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
      }
      const blobUrl = window.URL.createObjectURL(
        new Blob([bytes], { type: 'application/pdf' }),
      )
      previewWindow.location.href = blobUrl
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000)
      return
    }

    const url = result.data?.url || linkDeFallback
    if (!url) throw new Error('PDF não disponível')
    previewWindow.location.href = url
  } catch (error) {
    previewWindow.close()
    toast.error(
      error instanceof Error ? error.message : 'Não foi possível abrir o PDF',
    )
  }
}
