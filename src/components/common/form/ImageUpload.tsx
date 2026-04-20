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
  maxSize?: number
  customHelpText?: string
}

export function FormImageUpload<T extends FieldValues>({
  name,
  control,
  className,
  maxSize = 1024 * 50,
  customHelpText,
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
    if (_formValues[name] && typeof _formValues[name] === 'string') {
      setUploadedFiles(_formValues[name])
    }
  }, [_formValues, name, setUploadedFiles])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('w-full', className)}>
          <FormControl>
            <>
              {!uploadedFiles || !field.value ? (
                <FileUploader
                  multiple={false}
                  maxFileCount={1}
                  maxSize={maxSize}
                  onUpload={async (files: File[]) => {
                    const res = await handleUpload(files)
                    if (res) field.onChange(res)
                  }}
                  disabled={isUploading}
                  customHelpText={customHelpText}
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
