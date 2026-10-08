'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

// UI
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Form
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import type { Path, Control, FieldValues } from 'react-hook-form'

// Hooks and Libs
import {
  useImageCompression,
  type ImageSize,
} from '@/hooks/use-image-compression'
import { useUploadFile } from '@/hooks/use-upload-file'
import { cn } from '@/lib/utils'

// Icons
import {
  IconCloudUpload,
  IconTrash,
  IconCircleCheckFilled,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Omitted: import noImage from '@/assets/images/image-placeholder.svg'
// since it's not strictly needed if we don't use it in this layout

interface Props<T extends FieldValues> {
  control: Control<T>
  className?: string
  imageName: Path<T>
  sizeName: Path<T>
  maxSize?: number // in bytes
}

export function FormImageUploadBigSmall<T extends FieldValues>({
  control,
  className,
  imageName,
  sizeName,
}: Props<T>) {
  const [pendingSize, setPendingSize] = useState<ImageSize | null>(null)
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(
    null,
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    compressImage,
    isCompressing,
    error: compressionError,
  } = useImageCompression()

  const {
    handleUpload,
    isUploading,
    uploadedFiles,
    setUploadedFiles,
    progresses,
  } = useUploadFile()

  const { watch, setValue } = useFormContext()

  const currentImageUrl = watch(imageName as string)
  const currentImageSize = watch(sizeName as string)

  // Sync internal upload hook tracking state with form
  useEffect(() => {
    if (currentImageUrl && typeof currentImageUrl === 'string') {
      setUploadedFiles(currentImageUrl)
    } else {
      setUploadedFiles(undefined)
    }
  }, [currentImageUrl, setUploadedFiles])

  // Current image constraints
  const currentSize = (currentImageSize as ImageSize) || 'small'
  const previewUrl = uploadedFiles || null

  const handleUploadClick = (size: ImageSize) => {
    setPendingSize(size)
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setUploadedFiles(undefined)
    setValue(imageName as string, null, { shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const sizeToUse = pendingSize || 'small'

      // Comprimir imagem baseado no tamanho selecionado
      const compressedFile = await compressImage(file, sizeToUse)
      setUploadingFileName(compressedFile.name)

      // Upload do arquivo comprimido e atualização the ambos os campos do Hook Form
      const res = await handleUpload([compressedFile])
      if (res && res.length > 0) {
        // Let's rely on how FormImageUpload uses it: return `res` which is a string URL or object
        const urlToSave =
          typeof res === 'string'
            ? res
            : (res as { url: string }[])[0]?.url || (res as unknown as string)

        setValue(imageName as string, urlToSave, {
          shouldDirty: true,
          shouldValidate: true,
        })
        setValue(sizeName as string, sizeToUse, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    } catch {
      // O hook de compressão e upload reporta seus próprios erros no toast
    } finally {
      setPendingSize(null)
      setUploadingFileName(null)
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isLoading = isCompressing || isUploading
  const uploadProgress = uploadingFileName
    ? progresses?.[uploadingFileName] || 0
    : 0

  return (
    <div className={cn('flex flex-col gap-6 w-full', className)}>
      <FormField
        control={control}
        name={imageName}
        render={() => (
          <FormItem className="w-full">
            <FormControl>
              <div className="w-full">
                {previewUrl || isLoading ? (
                  <div className="flex items-center gap-2.5 rounded-lg border bg-white w-full">
                    <div className="w-full">
                      <div className="relative h-28 p-4">
                        <div className="flex h-full flex-1 gap-4">
                          {previewUrl ? (
                            <Image
                              src={previewUrl}
                              alt="Arquivo carregado"
                              width={200}
                              height={133}
                              loading="lazy"
                              className="h-20 min-w-32 max-w-32 border border-gray-300 rounded object-cover"
                            />
                          ) : (
                            <div className="h-20 min-w-32 max-w-32 border border-brand-300 rounded bg-brand-50 animate-pulse flex items-center justify-center">
                              <IconCloudUpload className="text-brand-500 opacity-50" />
                            </div>
                          )}
                          <div className="flex w-full flex-col justify-between">
                            <div className="flex items-center gap-2">
                              <IconCircleCheckFilled
                                size={ICON_SIZE.sm}
                                className={
                                  previewUrl
                                    ? 'text-success-600'
                                    : 'text-gray-400'
                                }
                              />
                              <p className="text-sm font-medium text-gray-700">
                                {previewUrl
                                  ? previewUrl.split('/').pop()
                                  : isCompressing
                                    ? 'Comprimindo imagem...'
                                    : 'Enviando...'}
                              </p>
                              {previewUrl && (
                                <Badge variant="neutralLight" className="ml-2">
                                  {currentSize === 'small'
                                    ? 'Pequena'
                                    : 'Grande'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress
                                value={previewUrl ? 100 : uploadProgress}
                              />
                              <p className="text-sm font-medium text-gray-700">
                                {previewUrl
                                  ? '100%'
                                  : `${Math.floor(uploadProgress)}%`}
                              </p>
                            </div>
                          </div>
                        </div>
                        {previewUrl && (
                          <div className="absolute right-2 top-2 flex items-center">
                            <Button
                              type="button"
                              variant="neutralLight"
                              size="icon"
                              onClick={handleRemoveImage}
                              disabled={isLoading}
                            >
                              <IconTrash
                                size={ICON_SIZE.md}
                                aria-hidden="true"
                              />
                              <span className="sr-only">Remover arquivo</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="group flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-300 bg-white p-3 text-center w-full">
                      <FeaturedIcon
                        Icon={IconCloudUpload}
                        size="lg"
                        variant="neutralBorderedLight"
                        rounded
                      />
                      <div className="flex flex-col gap-1 text-gray text-sm mt-3 items-center">
                        <p>
                          <span className="font-semibold text-brand-700">
                            Selecione o tamanho para adicionar arquivo
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG ou JPG até 10MB - (proporção 4:3)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          type="button"
                          variant="neutralOutline"
                          size="sm"
                          // LeftIcon={
                          //   isCompressing && pendingSize === 'small'
                          //     ? undefined
                          //     : IconCloudUpload
                          // }
                          onClick={() => handleUploadClick('small')}
                          disabled={isLoading}
                          isLoading={
                            (isCompressing || isUploading) &&
                            pendingSize === 'small'
                          }
                        >
                          Imagem pequena
                        </Button>
                        <span className="text-xs font-medium text-gray-500">
                          200×150px
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          type="button"
                          variant="neutralOutline"
                          size="sm"
                          // LeftIcon={
                          //   isCompressing && pendingSize === 'large'
                          //     ? undefined
                          //     : IconCloudUpload
                          // }
                          onClick={() => handleUploadClick('large')}
                          disabled={isLoading}
                          isLoading={
                            (isCompressing || isUploading) &&
                            pendingSize === 'large'
                          }
                        >
                          Imagem grande
                        </Button>
                        <span className="text-xs font-medium text-gray-500">
                          540×405px
                        </span>
                      </div>
                    </div>

                    {compressionError && (
                      <p className="text-xs text-red-500">{compressionError}</p>
                    )}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Input hidden */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  )
}
