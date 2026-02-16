'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Badge } from '@/components/ui/badge'

// Icons
import {
  IconTrash,
  IconPackage,
  IconCircleCheck,
  IconCloudUpload,
} from '@tabler/icons-react'

// Actions
import { updateItem } from '@/actions/_cruds'
import { uploadFiles } from '@/actions/uploadFiles'

// Hooks
import {
  useImageCompression,
  type ImageSize,
} from '@/hooks/use-image-compression'

// Types
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'

import noImage from '@/assets/images/image-placeholder.svg'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  quotationData: QuotationType
  rowData?: QuotationItemType
}

export function ItemImageDialog({
  open,
  setOpen,
  quotationData,
  rowData,
}: Props) {
  const [imageSize, setImageSize] = useState<ImageSize>('small')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pendingSize, setPendingSize] = useState<ImageSize | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const {
    compressImage,
    isCompressing,
    error: compressionError,
  } = useImageCompression()

  // Sincronizar estado com dados do item
  useEffect(() => {
    if (rowData && open) {
      // Determinar tamanho baseado no campo size ou fallback para original
      const currentSize =
        rowData.image?.size ??
        (rowData.image?.original !== false ? 'small' : 'large')
      setImageSize(currentSize as ImageSize)
      setPreviewUrl(rowData.image?.url || null)
      setSelectedFile(null)
    }
  }, [rowData, open])

  // Mutation para atualizar o item
  const updateMutation = useMutation({
    mutationFn: (data: { imageUrl?: string; imageSize?: string }) =>
      updateItem('quotationRoute', `update-product/${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUOTATION_DATA_QUERY_KEY, quotationData.id],
      })
      setOpen('')
    },
  })

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const sizeToUse = pendingSize || imageSize

      // Comprimir imagem baseado no tamanho selecionado
      const compressedFile = await compressImage(file, sizeToUse)
      setSelectedFile(compressedFile)
      setImageSize(sizeToUse)

      // Criar preview
      const url = URL.createObjectURL(compressedFile)
      setPreviewUrl(url)
    } catch {
      // Erro já tratado pelo hook
    } finally {
      setPendingSize(null)
    }

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = (size: ImageSize) => {
    setPendingSize(size)
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  const handleSave = async () => {
    try {
      let imageUrl = rowData?.image?.url

      // Se tem arquivo selecionado, fazer upload
      if (selectedFile) {
        const result = await uploadFiles({
          files: [selectedFile],
          setProgresses: setUploadProgress,
        })
        // result pode ser string direta, array ou objeto
        if (typeof result === 'string') {
          imageUrl = result
        } else {
          imageUrl = result?.[0]?.url || result?.url
        }
      }

      // Se removeu a imagem (previewUrl é null e não tem arquivo)
      if (!previewUrl && !selectedFile) {
        imageUrl = ''
      }

      // Atualizar o item com a URL e tamanho
      await updateMutation.mutateAsync({
        imageUrl,
        imageSize,
      })
    } catch (error) {
      console.error('Erro ao salvar imagem:', error)
    }
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'image' : '')
    if (!openDialog) {
      setSelectedFile(null)
      setPendingSize(null)
      setUploadProgress({})
    }
  }

  const isLoading =
    isCompressing ||
    updateMutation.isPending ||
    Object.values(uploadProgress).some((p) => p > 0 && p < 100)

  const hasChanges =
    selectedFile !== null ||
    previewUrl !== rowData?.image?.url ||
    imageSize !== (rowData?.image?.size ?? 'small')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
            <DialogTitle>{rowData?.description}</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Preview da imagem */}
          <div className="relative flex justify-center rounded-xl bg-white border overflow-hidden">
            <div className="relative w-full aspect-[4/3] flex items-center justify-center">
              <Image
                src={previewUrl ?? noImage}
                width={300}
                height={300}
                alt="Imagem do item"
                className={cn(
                  'w-full h-full',
                  previewUrl ? 'object-contain' : 'object-cover',
                )}
              />
              {previewUrl && (
                <>
                  <Badge
                    variant="neutralLight"
                    className="absolute top-2 left-4 mix-blend-normal bg-white/60 backdrop-blur-sm border shadow-sm"
                  >
                    {imageSize === 'small' ? 'Imagem pequena' : 'Imagem grande'}
                  </Badge>
                  <Button
                    type="button"
                    variant="neutralLight"
                    size="icon"
                    className="absolute top-2 right-2 shadow-md"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    RightIcon={IconTrash}
                  />
                </>
              )}
            </div>
          </div>

          {/* Upload de imagem */}
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  onClick={() => handleUploadClick('small')}
                  disabled={isLoading}
                  LeftIcon={
                    isCompressing && pendingSize === 'small'
                      ? undefined
                      : IconCloudUpload
                  }
                  isLoading={isCompressing && pendingSize === 'small'}
                >
                  Imagem pequena
                </Button>
                <p className="text-xs text-gray">80×60px</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  onClick={() => handleUploadClick('large')}
                  disabled={isLoading}
                  LeftIcon={
                    isCompressing && pendingSize === 'large'
                      ? undefined
                      : IconCloudUpload
                  }
                  isLoading={isCompressing && pendingSize === 'large'}
                >
                  Imagem grande
                </Button>
                <p className="text-xs text-gray">540×405px</p>
              </div>
            </div>
            <p className="text-xs text-gray">
              PNG ou JPG até 10MB - (proporção 4:3)
            </p>
            {compressionError && (
              <p className="text-xs text-error">{compressionError}</p>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div />
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              RightIcon={IconCircleCheck}
              isLoading={isLoading}
              disabled={!hasChanges && !selectedFile}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
