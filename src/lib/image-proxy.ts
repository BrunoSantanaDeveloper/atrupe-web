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
