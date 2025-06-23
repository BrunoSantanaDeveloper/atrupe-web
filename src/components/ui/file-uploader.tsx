'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

// Next Imports
import Image from 'next/image'

// UI component Imports
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ScrollArea } from '@/components/ui/scroll-area'

// Icon Imports
import {
  IconCircleCheckFilled,
  IconCloudUpload,
  IconFileText,
  IconTrash,
} from '@tabler/icons-react'

// Lib Imports
import { cn, formatBytes } from '@/lib/utils'

// React Dropzone Imports
import Dropzone from 'react-dropzone'

import type { DropzoneProps, FileRejection } from 'react-dropzone'
import { UploadResult } from '@/actions/uploadFiles'

// Type Imports
// import type { UploadedFile } from '@/types'
// eslint-disable-next-line
type UploadedFile = UploadResult

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpload: (files: File[]) => Promise<void>
  progresses?: Record<string, number>
  accept?: DropzoneProps['accept']
  maxSize?: DropzoneProps['maxSize']
  maxFileCount?: DropzoneProps['maxFiles']
  multiple?: boolean
  disabled?: boolean
  progressstyle?: string
  customHelpText?: string
}

export function FileUploader(props: FileUploaderProps) {
  const {
    onUpload,
    progresses,
    accept = {
      'image/*': [],
    },
    maxSize = 1024 * 1024 * 20, // 20MB
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    customHelpText,
    ...dropzoneProps
  } = props

  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (
        !multiple &&
        maxFileCount === 1 &&
        (acceptedFiles.length > 1 || rejectedFiles.length > 1)
      ) {
        toast.error('Não é possível enviar mais de 1 arquivo')
        return
      }

      if (
        (files?.length ?? 0) + acceptedFiles.length + rejectedFiles.length >
        maxFileCount
      ) {
        toast.error(`Não é possível enviar mais de ${maxFileCount} arquivos`)
        return
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      )

      setFiles(newFiles)

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`Falha ao enviar ${file.name}.`, {
            description:
              'Verifique se o arquivo atende aos requisitos de tamanho e formato e tente novamente.',
            duration: 20000,
          })
        })
      }

      if (acceptedFiles.length > 0 && acceptedFiles.length <= maxFileCount) {
        toast.promise(onUpload(acceptedFiles), {
          loading: 'Enviando...',
          success: () => {
            setFiles([])
            return 'Sucesso!'
          },
          error: 'Falha no envio',
        })
      }
    },

    [files, maxFileCount, multiple, onUpload, setFiles],
  )

  // Revoke preview url when component unmounts
  useEffect(() => {
    return () => {
      if (!files) return
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount

  return (
    <div className="flex flex-col gap-6 overflow-hidden">
      {!isDisabled ? (
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFileCount}
          multiple={maxFileCount > 1 || multiple}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={cn(
                'group grid h-32 w-full cursor-pointer place-items-center rounded-lg border border-dashed border-brand-300 bg-white px-6 py-4 text-center transition hover:bg-gray-50',
                'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
                isDragActive && 'bg-gray-50',
                isDisabled && 'pointer-events-none opacity-60',
                isDisabled && maxFileCount === 1 && 'hidden',
                className,
              )}
              {...dropzoneProps}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center sm:px-5">
                {isDragActive ? (
                  <>
                    <FeaturedIcon
                      Icon={IconCloudUpload}
                      size="lg"
                      variant="neutralBorderedLight"
                      rounded
                    />
                    <p className="text-sm font-semibold text-gray">
                      Solte aqui
                    </p>
                  </>
                ) : (
                  <>
                    <FeaturedIcon
                      Icon={IconCloudUpload}
                      size="lg"
                      variant="neutralBorderedLight"
                      rounded
                    />
                    <div className="flex flex-col gap-1 text-gray text-sm">
                      <p>
                        <span className="font-semibold text-brand-700">
                          Clique para adicionar arquivo{' '}
                        </span>
                        {customHelpText && (
                          <>
                            <br />{' '}
                          </>
                        )}
                        ou arraste e solte o arquivo aqui
                      </p>
                      {customHelpText && (
                        <p className="text-xs mt-px">{customHelpText}</p>
                      )}
                      {!customHelpText && (
                        <p className="text-xs">
                          {customHelpText && customHelpText}
                          {maxFileCount > 1
                            ? ` ${maxFileCount === Infinity ? 'multiple' : maxFileCount}
                      arquivos até ${formatBytes(maxSize)}`
                            : ` PNG ou JPG até ${formatBytes(maxSize)}`}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Dropzone>
      ) : null}
      {files?.length ? (
        <div className="flex items-center gap-2.5 rounded-lg border bg-white">
          <ScrollArea className="w-full">
            <div className={cn('flex max-h-48 flex-col', props.progressstyle)}>
              {files?.map((file, index) => (
                <ProgressFileCard
                  key={index}
                  file={file}
                  progress={progresses?.[file.name]}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  )
}

interface ProgressFileCardProps {
  file: File
  progress?: number
}

function ProgressFileCard({ file, progress }: ProgressFileCardProps) {
  return (
    <div className="relative h-full min-h-28 border-b p-4">
      <div className="flex h-full flex-1 gap-4">
        {isFileWithPreview(file) ? (
          file.type.startsWith('image/') ? (
            <Image
              src={file.preview}
              alt={file.name}
              width={30}
              height={20}
              loading="lazy"
              className="h-20 min-w-32 max-w-32 border border-gray-300 rounded object-cover my-auto"
            />
          ) : (
            <IconFileText
              className="size-10 text-gray-600"
              aria-hidden="true"
            />
          )
        ) : null}
        <div className="flex w-full flex-col my-auto justify-between">
          <div className="flex flex-col">
            <p className="line-clamp-1 text-sm font-medium text-gray-600">
              {file.name}
            </p>
            <p className="text-xs text-gray-600">{formatBytes(file.size)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} />
            <p className="text-sm font-medium text-gray-700">
              {Math.floor(progress || 0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string'
}

interface UploadedFilesCardProps {
  uploadedFileUrl: string | null
  onRemove?: (url: string) => void
}

export function UploadedFilesCard({
  uploadedFileUrl,
  onRemove,
}: UploadedFilesCardProps) {
  if (!uploadedFileUrl) return null

  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-white">
      <div className="w-full">
        <div className="relative h-28 p-4">
          <div className="flex h-full flex-1 gap-4">
            <Image
              src={uploadedFileUrl}
              alt="Arquivo carregado"
              width={200}
              height={133}
              loading="lazy"
              className="h-20 min-w-32 max-w-32 border border-gray-300 rounded object-cover"
            />
            <div className="flex w-full flex-col justify-between">
              <div className="flex items-center gap-2">
                <IconCircleCheckFilled size={16} className="text-success-600" />
                <p className="text-sm font-medium text-gray-700">
                  {uploadedFileUrl?.split('/')?.pop()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={100} />
                <p className="text-sm font-medium text-gray-700">100%</p>
              </div>
            </div>
          </div>
          {onRemove && (
            <div className="absolute right-2 top-2 flex items-center">
              <Button
                type="button"
                variant="neutralLight"
                size="icon"
                onClick={() => onRemove(uploadedFileUrl)}
              >
                <IconTrash className="size-5" aria-hidden="true" />
                <span className="sr-only">Remover arquivo</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
