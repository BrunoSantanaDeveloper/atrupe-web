'use client'

// UI component Imports
import {
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { FileUploader, UploadedFilesCard } from '@/components/ui/file-uploader'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { Path, Control, FieldValues } from 'react-hook-form'

// Icon Imports
import { useUploadFile } from '@/hooks/use-upload-file'
import { useEffect } from 'react'

interface Props<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  className?: string
  multiple?: boolean
}

export function FormFileUpload<T extends FieldValues>({
  name,
  control,
  className,
  multiple = false,
}: Props<T>) {
  const {
    handleUpload,
    progresses,
    uploadedFiles,
    isUploading,
    setUploadedFiles,
  } = useUploadFile()
  const { _formValues } = control

  useEffect(() => {
    if (_formValues.files === undefined) {
      setUploadedFiles('')
    }
    return () => {
      setUploadedFiles('')
    }
  }, [_formValues.files, setUploadedFiles])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('w-full', className)}>
          <FormControl>
            <>
              {!uploadedFiles?.length || !field.value ? (
                <FileUploader
                  multiple={multiple}
                  maxFileCount={multiple ? 3 : 1}
                  maxSize={1024 * 1024 * 30}
                  customHelpText="PDF de até 30MB"
                  progresses={progresses}
                  onUpload={async (files: File[]) => {
                    const res = await handleUpload(files)
                    if (res) field.onChange(res)
                  }}
                  disabled={isUploading}
                  accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc', '.docx'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                      ['.docx'],
                    'application/vnd.ms-excel': ['.xls', '.xlsx'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                      ['.xlsx'],
                  }}
                />
              ) : (
                (console.info(uploadedFiles),
                (
                  <UploadedFilesCard
                    uploadedFileUrl={uploadedFiles}
                    onRemove={() => {
                      if (!uploadedFiles) return

                      setUploadedFiles('')
                      field.onChange(undefined)
                    }}
                  />
                ))
              )}
            </>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
