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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

// Icons
import {
  IconPackage,
  IconUpload,
  IconTrash,
  IconCircleCheck,
  IconPhoto,
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

interface Props {
  open: boolean
  setOpen: (value: string) => void
  quotationData: QuotationType
  rowData?: QuotationItemType
}

export function ItemImageDialog({ open, setOpen, rowData }: Props) {
  const [imageSize, setImageSize] = useState<ImageSize>('small')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      setOpen('')
    },
  })

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Comprimir imagem baseado no tamanho selecionado
      const compressedFile = await compressImage(file, imageSize)
      setSelectedFile(compressedFile)

      // Criar preview
      const url = URL.createObjectURL(compressedFile)
      setPreviewUrl(url)
    } catch {
      // Erro já tratado pelo hook
    }

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSizeChange = async (newSize: ImageSize) => {
    setImageSize(newSize)

    // Se já tem um arquivo selecionado, recomprimir com o novo tamanho
    if (selectedFile) {
      try {
        const recompressedFile = await compressImage(selectedFile, newSize)
        setSelectedFile(recompressedFile)
        const url = URL.createObjectURL(recompressedFile)
        setPreviewUrl(url)
      } catch {
        // Manter arquivo anterior em caso de erro
      }
    }
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
        imageUrl = result?.url
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
    } catch {
      // Erro tratado pela mutation
    }
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'image' : '')
    if (!openDialog) {
      setSelectedFile(null)
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
            <DialogTitle>{rowData?.description}</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Preview da imagem */}
          <div className="relative flex justify-center">
            <div className="relative">
              <Image
                src={previewUrl ?? noImage}
                width={300}
                height={300}
                alt="Imagem do item"
                className="min-h-[200px] max-h-[300px] w-auto object-contain rounded-xl border"
              />
              {previewUrl && (
                <Button
                  type="button"
                  variant="neutralLight"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  RightIcon={IconTrash}
                />
              )}
            </div>
          </div>

          {/* Upload de imagem */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              LeftIcon={isCompressing ? undefined : IconUpload}
              isLoading={isCompressing}
            >
              {isCompressing ? 'Comprimindo...' : 'Escolher imagem'}
            </Button>
            <p className="text-xs text-muted-foreground">Máximo 10MB.</p>
            {compressionError && (
              <p className="text-xs text-destructive">{compressionError}</p>
            )}
          </div>

          {/* Seleção de tamanho */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tamanho no PDF</Label>
            <RadioGroup
              value={imageSize}
              onValueChange={(value) => handleSizeChange(value as ImageSize)}
              className="flex gap-6"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="size-small" />
                <Label
                  htmlFor="size-small"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <IconPhoto className="h-4 w-4" />
                  Pequena
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="size-large" />
                <Label
                  htmlFor="size-large"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <IconPhoto className="h-5 w-5" />
                  Grande
                </Label>
              </div>
            </RadioGroup>
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
