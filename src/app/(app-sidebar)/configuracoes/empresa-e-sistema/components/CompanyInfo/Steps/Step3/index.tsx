'use client'

// Component Imports
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Type Imports
import { CompanyFormType } from '../../schema'

import { Path, useFormContext } from 'react-hook-form'
import { ProductImageUpload } from '@/components/common/form/global-inputs/ProductImageUpload'
import Image from 'next/image'
import { IconExternalLink, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

export function Step3() {
  const { watch } = useFormContext<CompanyFormType>()

  const logoUrl = watch('personalization.logoUrl')
  const favIconUrl = watch('personalization.favIconUrl')

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex gap-4  min-h-52  w-full">
        <LogoUpload
          title="Logotipo"
          description="Será aplicado no menu lateral da plataforma, orçamentos e relatórios."
          customHelpText="PNG com fundo transparente até 200KB e 300x80px"
          name="personalization.logoUrl"
          imageUrl={logoUrl ?? undefined}
        />
        <LogoUpload
          title="Favicon"
          description="Será aplicado na aba do navegador. Utilize apenas o símbolo da sua marca."
          customHelpText="PNG com até 200KB e 50x50px"
          name="personalization.favIconUrl"
          imageUrl={favIconUrl ?? undefined}
        />
      </div>
      <div className="border border-gray-300 w-full my-7" />
      <p className="text-md font-semibold text-gray-700 mb-4">
        Textos da proposta comercial
      </p>
      <FormTextarea<CompanyFormType>
        name="personalization.textsBeforeItems"
        label="Texto antes dos itens"
        placeholder="Digite aqui"
        className="col-span-2"
        rows={5}
      />
      <FormTextarea<CompanyFormType>
        name="personalization.textsAfterItems"
        label="Texto depois dos itens"
        placeholder="Digite aqui"
        className="col-span-2"
        rows={5}
      />
      <Button
        type="button"
        variant="neutralOutline"
        LeftIcon={IconExternalLink}
        className="mx-auto"
      >
        Pré-visualizar proposta
      </Button>
    </div>
  )
}

interface LogoUploadProps {
  name: string
  title: string
  description: string
  imageUrl?: string
  customHelpText?: string
}

function LogoUpload({
  title,
  description,
  name,
  imageUrl,
  customHelpText,
}: LogoUploadProps) {
  const { control, setValue } = useFormContext<CompanyFormType>()

  return (
    <div className="w-full flex flex-col items-stretch justify-stretch relative">
      <p className="text-md font-semibold text-gray-700 pb-1">{title}</p>
      <span className="text-sm text-gray-500 pb-5">{description}</span>
      {!imageUrl && (
        <ProductImageUpload<CompanyFormType>
          control={control}
          name={name as Path<CompanyFormType>}
          className="w-full h-full"
          maxHeight="!max-h-[200px]"
          customHelpText={customHelpText}
          maxSize={1024 * 200} // 200kb
        />
      )}
      {imageUrl && imageUrl.length > 0 && (
        <div className="w-full h-full flex items-center justify-center relative">
          <Image
            src={imageUrl}
            alt="Logo"
            fill
            objectFit="contain"
            className="my-auto"
          />
          <Button
            size={'icon'}
            variant={'none'}
            onClick={() => setValue(name as Path<CompanyFormType>, '')}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-200"
            aria-label="Remover imagem"
          >
            <FeaturedIcon variant="neutralLight" Icon={IconTrash} />
          </Button>
        </div>
      )}
    </div>
  )
}
