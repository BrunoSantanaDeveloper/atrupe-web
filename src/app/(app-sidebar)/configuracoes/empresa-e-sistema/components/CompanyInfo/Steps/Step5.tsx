'use client'

import { useCallback, useState, useEffect } from 'react'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import {
  IconTrash,
  IconFileCertificate,
  IconCirclePlus,
  IconCircleCheckFilled,
  IconCloudUpload,
} from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

import { cn } from '@/lib/utils'
import { formatToLocaleDateTime } from '@/lib/formatDate'

import { CompanyFormType } from '../schema'

import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'

const toggleOptions = [
  {
    label: 'Certificado A1',
    value: 'A1',
  },
  {
    label: 'Certificado A3',
    value: 'A3',
  },
]

export function Step5() {
  const [showFields, setShowFields] = useState(false)

  const { watch, setValue } = useFormContext<CompanyFormType>()

  const certificate = watch('fiscal.certificate')
  const certificateType = watch('fiscal.certificateType')

  // Show fields automatically if certificate data already exists
  useEffect(() => {
    if (certificateType) {
      setShowFields(true)
    }
  }, [certificateType])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setValue('fiscal.certificate', base64String)
          setValue('fiscal.certificateName', file.name)
        }
        reader.readAsDataURL(file)
      }
    },
    [setValue],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-pkcs12': ['.pfx', '.p12'],
    },
    multiple: false,
  })

  const removeCertificate = () => {
    setValue('fiscal.certificate', '')
    setValue('fiscal.certificateDescription', '')
    setValue('fiscal.certificateName', '')
    setValue('fiscal.certificatePassword', '')
    setValue('fiscal.certificateType', '')
    setShowFields(false)
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <FormInput
          name="fiscal.cnae"
          label="CNAE"
          placeholder="Digite aqui"
          width="sm:col-span-1"
        />
        <FormInput
          name="fiscal.accessKey"
          label="Chave de acesso (AccessKey)"
          placeholder="Digite aqui"
          width="sm:col-span-3"
        />
      </div>

      <Separator className="bg-gray-300" />

      <div>
        {!showFields ? (
          <Button
            type="button"
            variant="none"
            className="flex justify-center items-center h-full w-full gap-3 py-4 rounded-none"
            onClick={() => {
              setValue('fiscal.certificateType', 'A1')
              setShowFields(true)
            }}
          >
            <FeaturedIcon variant="light" Icon={IconCirclePlus} rounded />
            <p className="text-sm text-gray-600 font-medium">
              Adicionar Certificado Digital
            </p>
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-700">
                Certificado Digital
              </h3>
              <Button
                type="button"
                variant="neutralGhost"
                size="icon"
                onClick={removeCertificate}
              >
                <IconTrash className="w-5 h-5 text-neutral-500" />
              </Button>
            </div>

            <div className="mb-4">
              <FormToggleCard
                name="fiscal.certificateType"
                options={toggleOptions}
                groupClassName="flex-col sm:flex-row"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormInput
                name="fiscal.certificateDescription"
                label="Descrição"
                placeholder="Ex: Teste de Nota"
              />
              <FormInput
                name="fiscal.certificatePassword"
                label="Senha"
                type="password"
                placeholder="••••••••••"
              />
            </div>
            {certificate ? (
              <div className="p-4 border rounded-lg flex items-center justify-between border-neutral-200 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <IconFileCertificate className="w-8 h-8 text-neutral-400" />
                    <IconCircleCheckFilled className="w-4 h-4 text-emerald-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {watch('fiscal.certificateName')}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {watch('fiscal.certificateUpdatedAt')
                        ? `Modificado em ${formatToLocaleDateTime(watch('fiscal.certificateUpdatedAt')!)} `
                        : 'Carregado agora'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="neutralGhost"
                  size="icon"
                  onClick={() => setValue('fiscal.certificate', '')}
                  RightIcon={IconTrash}
                />
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  'border border-dashed border-brand-300 hover:border-brand-200 rounded-lg px-6 py-6 text-center cursor-pointer transition-colors',
                  isDragActive ? 'bg-brand-50' : 'bg-white',
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <FeaturedIcon
                    variant="neutralBorderedLight"
                    Icon={IconCloudUpload}
                    size="default"
                    rounded
                  />
                  <p className="text-sm">
                    <span className="text-brand-700 font-semibold">
                      Clique para selecionar o arquivo .pfx ou .p12
                    </span>
                    <span className="text-gray">
                      {' '}
                      ou arraste e solte o arquivo aqui
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
