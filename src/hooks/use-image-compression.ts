import imageCompression from 'browser-image-compression'
import { useState, useCallback } from 'react'

export type ImageSize = 'small' | 'large'

const COMPRESSION_CONFIG = {
  small: {
    maxSizeMB: 0.05, // ~50KB
    maxWidthOrHeight: 400,
    useWebWorker: true,
    initialQuality: 0.6,
  },
  large: {
    maxSizeMB: 0.5, // ~500KB
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    initialQuality: 0.8,
  },
} as const

const MAX_INPUT_SIZE_MB = 10

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compressImage = useCallback(
    async (file: File, size: ImageSize): Promise<File> => {
      setError(null)

      // Validar tamanho máximo de entrada
      if (file.size > MAX_INPUT_SIZE_MB * 1024 * 1024) {
        const errorMsg = `Imagem muito grande. Máximo: ${MAX_INPUT_SIZE_MB}MB`
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        const errorMsg = 'Arquivo deve ser uma imagem'
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      setIsCompressing(true)

      try {
        // PDFs (react-pdf) só suportam PNG e JPG: converter outros formatos
        // (ex: WebP) na compressão. PNG é mantido para preservar transparência.
        const outputType =
          file.type === 'image/png' ? 'image/png' : 'image/jpeg'

        const compressedFile = await imageCompression(file, {
          ...COMPRESSION_CONFIG[size],
          fileType: outputType,
        })

        // Retornar com o nome original mas extensão correta
        const extension = compressedFile.type.split('/')[1] || 'jpg'
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        const newFileName = `${baseName}.${extension}`

        return new File([compressedFile], newFileName, {
          type: compressedFile.type,
        })
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Erro ao comprimir imagem'
        setError(errorMsg)
        throw err
      } finally {
        setIsCompressing(false)
      }
    },
    [],
  )

  const getFileSizeFormatted = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }, [])

  return {
    compressImage,
    isCompressing,
    error,
    getFileSizeFormatted,
    maxInputSizeMB: MAX_INPUT_SIZE_MB,
  }
}
