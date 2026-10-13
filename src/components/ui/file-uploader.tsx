'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Dropzone, { DropzoneProps, FileRejection } from 'react-dropzone'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatBytes } from '@/lib/utils'

export type FileStatus = 'uploading' | 'completed' | 'error'

export interface UploadedFileState {
  file: File
  preview?: string
  progress: number
  status: FileStatus
}

export interface UploadedFilesCardProps {
  uploadedFileUrl: string | null
  onRemove?: (url: string) => void
}

export interface FileUploaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  onUpload: (files: File[]) => Promise<void>
  accept?: DropzoneProps['accept']
  maxSize?: DropzoneProps['maxSize']
  maxFileCount?: DropzoneProps['maxFiles']
  multiple?: boolean
  disabled?: boolean
  customHelpText?: string
  imageOnly?: boolean // changes texts to "adicione imagem"
  // For sandbox / controlled environments
  controlledFiles?: UploadedFileState[]
  onRemove?: (file: File) => void
  onRetry?: (file: File) => void
  errorStatus?: boolean // manually force dropzone error state
}

const IconUploadCloud = () => (
  <svg
    width={48}
    height={48}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-grow-0 flex-shrink-0 w-12 h-12 relative"
  >
    <path
      d="M13.9999 35.9999C11.5045 35.9999 9.11123 35.0517 7.34668 33.3639C5.58213 31.676 4.59082 29.3869 4.59082 26.9999C4.59082 24.613 5.58213 22.3238 7.34668 20.6359C9.11123 18.9481 11.5045 17.9999 13.9999 17.9999C14.5893 15.3743 16.3134 13.0669 18.7931 11.5853C20.0209 10.8517 21.3972 10.343 22.8435 10.0881C24.2897 9.83326 25.7776 9.83726 27.2221 10.0999C28.6667 10.3625 30.0396 10.8787 31.2625 11.6189C32.4854 12.359 33.5343 13.3087 34.3494 14.4138C35.1645 15.5188 35.7298 16.7575 36.013 18.0591C36.2962 19.3607 36.2917 20.6998 35.9999 21.9999H37.9999C39.8564 21.9999 41.6369 22.7374 42.9497 24.0502C44.2624 25.3629 44.9999 27.1434 44.9999 28.9999C44.9999 30.8564 44.2624 32.6369 42.9497 33.9497C41.6369 35.2624 39.8564 35.9999 37.9999 35.9999H35.9999M18 30L24 24M24 24L30 30M24 24V42"
      stroke="#7A7A7A"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconCloseSmall = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
  >
    <path
      d="M15 9L9 15"
      stroke="#98A2B3"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9L15 15"
      stroke="#98A2B3"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      stroke="#98A2B3"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconGenericFile = () => (
  <svg
    width={53}
    height={53}
    viewBox="0 0 53 53"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[53px] h-[53px]"
  >
    <path
      d="M13.25 24.2917H6.625V33.125H13.25V15.4584M33.125 33.125H26.5V24.2917H33.125V39.75H26.5M19.875 33.125V24.2917M46.375 33.125H39.75V24.2917H46.375V39.75H39.75"
      stroke="black"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconTrashGreen = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 hover:opacity-80 transition-opacity"
  >
    <path
      d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7"
      stroke="#38CF8F"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function FileUploader(props: FileUploaderProps) {
  const {
    onUpload,
    accept = { 'image/*': [], 'application/pdf': [] },
    maxSize = 1024 * 1024 * 10, // 10MB
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    customHelpText,
    imageOnly = false,
    controlledFiles,
    onRemove,
    onRetry,
    errorStatus = false,
    ...rest
  } = props

  const [internalFiles, setInternalFiles] = useState<UploadedFileState[]>([])

  // Use controlled files if provided (sandbox/showcase), else use internal state
  const files = controlledFiles ?? internalFiles

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
        files.length + acceptedFiles.length + rejectedFiles.length >
        maxFileCount
      ) {
        toast.error(`Não é possível enviar mais de ${maxFileCount} arquivos`)
        return
      }

      const newFiles: UploadedFileState[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading' as FileStatus,
      }))

      if (!controlledFiles) {
        setInternalFiles((prev) => [...prev, ...newFiles])
      }

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`Falha ao enviar ${file.name}. Verifique os requisitos.`)
        })
      }

      if (acceptedFiles.length > 0 && acceptedFiles.length <= maxFileCount) {
        onUpload(acceptedFiles)
      }
    },
    [files.length, maxFileCount, multiple, onUpload, controlledFiles],
  )

  useEffect(() => {
    return () => {
      files.forEach((state) => {
        if (state.preview) URL.revokeObjectURL(state.preview)
      })
    }
  }, [files])

  const isDisabled = disabled || files.length >= maxFileCount
  const hideDropzone = isDisabled && maxFileCount === 1 && files.length > 0

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {!hideDropzone && (
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFileCount}
          multiple={maxFileCount > 1 || multiple}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => {
            const isError = errorStatus
            const bgClass = isError
              ? 'bg-error-25'
              : isDragActive
                ? 'bg-[#f4fdf8] dark:bg-brand-25'
                : 'bg-white'
            const borderClass = isError
              ? 'border-error-300'
              : isDragActive
                ? 'border-brand-500'
                : 'border-black/25'

            const titleFirstPart = imageOnly
              ? 'Adicionar imagem'
              : 'Adicionar arquivo'
            const helpText =
              customHelpText ||
              `Formato: PNG ou JPG\nTamanho: até ${formatBytes(maxSize)}`

            return (
              <div
                {...getRootProps()}
                className={cn(
                  ' justify-between items-center self-stretch flex-grow-0 flex-shrink-0 px-6 py-4 rounded-lg border border-dashed transition-all cursor-pointer',
                  bgClass,
                  borderClass,
                  isDisabled &&
                    'opacity-60 cursor-not-allowed pointer-events-none',
                )}
                {...rest}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <IconUploadCloud />
                  <div className="flex flex-col  items-center flex-grow relative gap-1">
                    <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-gray-800">
                      {titleFirstPart}
                    </p>
                    <p className="self-stretch flex-grow-0 flex-shrink-0 text-xs text-left text-[#949494] whitespace-pre-wrap">
                      {helpText}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 h-10 relative gap-2 px-4 rounded-lg border-2 border-brand-500 hover:bg-[#f4fdf8] dark:hover:bg-brand-25 transition-colors mt-3">
                  <p className="flex-grow-0 flex-shrink-0 text-sm font-semibold text-left text-brand-500">
                    Selecionar arquivo
                  </p>
                </div>
              </div>
            )
          }}
        </Dropzone>
      )}

      {files.length > 0 && (
        <ScrollArea className="w-full">
          <div className="flex flex-col gap-3 max-h-[400px]">
            {files.map((state, idx) => (
              <ProgressFileCard
                key={idx}
                state={state}
                onRemove={() => onRemove?.(state.file)}
                onRetry={() => onRetry?.(state.file)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function ProgressFileCard({
  state,
  onRemove,
  onRetry,
}: {
  state: UploadedFileState
  onRemove?: () => void
  onRetry?: () => void
}) {
  const { file, progress, status } = state
  const isError = status === 'error'
  const isCompleted = status === 'completed'

  if (isCompleted) {
    return (
      <UploadedFilesCard
        uploadedFileUrl={state.preview || ''}
        fileName={file.name}
        fileSize={file.size}
        onRemove={onRemove}
      />
    )
  }

  return (
    <div className="flex flex-col justify-center items-start flex-grow-0 flex-shrink-0 w-full relative overflow-hidden rounded-lg bg-gray-300">
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative px-4 py-2 bg-white">
        <p
          className={cn(
            'flex-grow-0 flex-shrink-0 text-sm text-center text-gray-700',
            isError && 'text-error-700',
          )}
        >
          {file.name}
        </p>
        <div className="flex items-center gap-2">
          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-semibold text-error-700 hover:underline focus:outline-none"
            >
              Tentar novamente
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="flex justify-center items-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconCloseSmall />
          </button>
        </div>
      </div>
      <div
        className={cn(
          'flex-grow-0 flex-shrink-0 h-[3px] rounded-[10px] transition-all duration-300',
          isError ? 'bg-error-600' : 'bg-[#46b43c]',
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function UploadedFilesCard({
  uploadedFileUrl,
  onRemove,
  fileName: propFileName,
  fileSize,
}: UploadedFilesCardProps & { fileName?: string; fileSize?: number }) {
  if (!uploadedFileUrl) return null

  const fileName = propFileName || uploadedFileUrl.split('/').pop() || 'Arquivo'
  const sizeText = fileSize
    ? `${formatBytes(fileSize)} of ${formatBytes(fileSize)}`
    : undefined

  return (
    <div
      className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-full gap-2.5 py-4 rounded-lg bg-white mt-4"
      style={{ boxShadow: '0px 4px 24px 0 rgba(0,0,0,0.1)' }}
    >
      <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 px-4">
        <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 gap-4 overflow-hidden">
          <div className="flex flex-col justify-center items-center flex-grow-0 flex-shrink-0 h-[86px] w-[86px] relative overflow-hidden gap-2.5 p-2.5 rounded bg-white border border-gray-300">
            {uploadedFileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
            uploadedFileUrl.startsWith('blob:') ? (
              <div
                className="w-full h-full bg-cover bg-center rounded"
                style={{ backgroundImage: `url(${uploadedFileUrl})` }}
              />
            ) : (
              <IconGenericFile />
            )}
          </div>
          <div className="flex flex-col justify-start items-start flex-grow-0 w-full relative gap-2 overflow-hidden">
            <p className="flex-grow-0 flex-shrink-0 text-lg font-semibold text-left text-gray-600 truncate w-full max-w-[400px]">
              {fileName}
            </p>
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-3">
              {sizeText && (
                <p className="flex-grow-0 flex-shrink-0 text-[15px] text-left text-[#888]">
                  {sizeText}
                </p>
              )}
              <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 mix-blend-multiply dark:mix-blend-normal">
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative gap-1 pl-3 pr-2.5 py-1 rounded-2xl bg-success-50">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-grow-0 flex-shrink-0 w-3 h-3 relative"
                  >
                    <path
                      d="M8.5 1.66995C9.25413 2.10537 9.88147 2.73021 10.3199 3.4826C10.7583 4.23498 10.9927 5.08883 10.9997 5.95962C11.0067 6.8304 10.7862 7.68792 10.36 8.44729C9.93378 9.20667 9.31662 9.84155 8.56962 10.2891C7.82262 10.7367 6.97168 10.9814 6.10105 10.999C5.23042 11.0166 4.37027 10.8065 3.60578 10.3896C2.84128 9.97261 2.19894 9.36321 1.74233 8.6217C1.28573 7.8802 1.0307 7.0323 1.0025 6.16195L1 5.99995L1.0025 5.83795C1.0305 4.97444 1.28177 4.13293 1.73182 3.39544C2.18187 2.65796 2.81533 2.04967 3.57045 1.62989C4.32557 1.2101 5.17657 0.993145 6.0405 1.00017C6.90443 1.00719 7.7518 1.23795 8.5 1.66995ZM7.8535 4.64645C7.7674 4.56036 7.65285 4.50864 7.53134 4.501C7.40983 4.49336 7.2897 4.53032 7.1935 4.60495L7.1465 4.64645L5.5 6.29245L4.8535 5.64645L4.8065 5.60495C4.71029 5.53037 4.59019 5.49346 4.4687 5.50112C4.34722 5.50879 4.2327 5.5605 4.14663 5.64658C4.06056 5.73265 4.00884 5.84717 4.00118 5.96865C3.99351 6.09013 4.03043 6.21024 4.105 6.30645L4.1465 6.35345L5.1465 7.35345L5.1935 7.39495C5.28119 7.46298 5.38902 7.4999 5.5 7.4999C5.61098 7.4999 5.71881 7.46298 5.8065 7.39495L5.8535 7.35345L7.8535 5.35345L7.895 5.30645C7.96963 5.21024 8.00658 5.09012 7.99894 4.96861C7.9913 4.84709 7.93959 4.73254 7.8535 4.64645Z"
                      fill="#12B76A"
                    />
                  </svg>
                  <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-center text-success-700">
                    Concluído
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(uploadedFileUrl)}
            className="flex justify-center items-center flex-grow-0 flex-shrink-0 h-10 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <IconTrashGreen />
          </button>
        )}
      </div>
    </div>
  )
}
