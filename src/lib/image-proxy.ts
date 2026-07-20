/**
 * Gera URL do proxy para imagens do S3, resolvendo problemas de CORS
 * @param s3Url - URL original da imagem no S3
 * @returns URL do proxy local
 */
export function getProxiedImageUrl(s3Url: string | null | undefined): string {
  // Se não há URL, retornar placeholder
  if (!s3Url) {
    return '/img/product-placeholder.png'
  }

  // Se é uma URL local ou não é do S3, retornar como está
  if (
    s3Url.startsWith('/') ||
    !s3Url.includes('files-atrupe.s3.us-east-1.amazonaws.com')
  ) {
    return s3Url
  }

  // Gerar URL do proxy
  const encodedUrl = encodeURIComponent(s3Url)
  return `/api/proxy-image?url=${encodedUrl}`
}

// Formatos que o @react-pdf/renderer consegue embutir diretamente
const PDF_SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

/**
 * Fonte de imagem para PDFs (@react-pdf/renderer), que só suporta PNG e JPG.
 * Baixa a imagem (via proxy quando for S3) e converte formatos não suportados
 * (ex: WebP) para PNG usando canvas antes de entregar ao renderizador —
 * sem isso a imagem falha silenciosamente e o PDF mostra um espaço em branco.
 * @param s3Url - URL original da imagem
 * @returns factory assíncrona aceita pelo prop `src` do Image do react-pdf
 */
export function getPdfImageSrc(s3Url: string | null | undefined) {
  const url = getProxiedImageUrl(s3Url)

  return async (): Promise<string> => {
    try {
      const response = await fetch(url)
      if (!response.ok) return url

      const blob = await response.blob()
      if (PDF_SUPPORTED_IMAGE_TYPES.includes(blob.type)) {
        return url
      }

      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
      bitmap.close()

      return canvas.toDataURL('image/png')
    } catch {
      // Deixar o react-pdf tentar carregar a URL diretamente
      return url
    }
  }
}
