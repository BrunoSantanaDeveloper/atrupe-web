import { useEffect } from 'react'

// UI component Imports
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { FileUploader } from '@/components/ui/file-uploader'
import { useUploadFile } from '@/hooks/use-upload-file'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { Path, Control, FieldValues } from 'react-hook-form'

import { IconTrash } from '@tabler/icons-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface Props<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  className?: string
  maxHeight?: string
  customHelpText?: string
  maxSize?: number
}

export function ProductImageUpload<T extends FieldValues>({
  name,
  control,
  className,
  maxHeight,
  customHelpText,
  maxSize = 1024 * 50, // 50KB
}: Props<T>) {
  const { handleUpload, isUploading, setUploadedFiles, uploadedFiles } =
    useUploadFile()
  const { _formValues } = control

  useEffect(() => {
    const imageUrl = _formValues.imageUrl || _formValues.avatarUrl
    if (imageUrl !== undefined) {
      setUploadedFiles(imageUrl as unknown as string)
    }
    return () => {
      setUploadedFiles(undefined)
    }
  }, [_formValues, setUploadedFiles])

  const handleDelete = () => {
    setUploadedFiles(undefined)
    _formValues.imageUrl = ''
    _formValues.avatarUrl = ''
  }
  return (
    <div className="w-full h-full relative">
      {!uploadedFiles && (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={cn('w-full h-full', className)}>
              <FormControl className={cn('w-full !h-72', maxHeight)}>
                <FileUploader
                  multiple={false}
                  maxFileCount={1}
                  maxSize={maxSize}
                  onUpload={async (files: File[]) => {
                    const res = await handleUpload(files)
                    if (res) field.onChange(res)
                  }}
                  customHelpText={customHelpText}
                  disabled={isUploading}
                  className={cn(className)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {uploadedFiles && uploadedFiles?.length > 0 && (
        <div className="w-full h-full">
          <div className="w-full h-full flex justify-between px-2 absolute top-3 mx-auto z-10">
            {/* <Badge className="rounded-md !px-3 " variant={'default'}>
              Alterar imagem
            </Badge> */}
            <div></div>
            <Button
              type="button"
              size="iconSm"
              variant="neutralLight"
              onClick={handleDelete}
              RightIcon={IconTrash}
            />
          </div>

          <Image
            src={(uploadedFiles as unknown as string) || ''}
            alt="Product"
            fill
            className="rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  )
}
