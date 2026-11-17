'use client'

import { FormTextarea } from '@/components/common/form/FormTextarea'
import { GeneratePdf } from '@/components/common/PrintQuotation/GeneratePdf'

import { CompanyFormType } from '../../schema'

import { Path, useFormContext } from 'react-hook-form'
import { ProductImageUpload } from '@/components/common/form/global-inputs/ProductImageUpload'
import Image from 'next/image'
import { IconExternalLink, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'
import { formData, quotationExampleData } from './previewData'
import { maskCnpj } from '@/lib/utils'

export function Step3() {
  const { watch } = useFormContext<CompanyFormType>()
  const [isLoading, setIsLoading] = useState(false)

  const logoUrl = watch('personalization.logoUrl')
  const favIconUrl = watch('personalization.favIconUrl')

  // Dados para a pré-visualização do orçamento
  const customData = {
    company: {
      name: watch('general.name'),
      cnpj: maskCnpj(watch('general.cnpj')),
      email: watch('general.email'),
      siteUrl: watch('general.siteUrl'),
      address: {
        street: watch('address.street'),
        number: watch('address.number'),
        complement: watch('address.complement'),
        neighborhood: watch('address.neighborhood'),
        city: watch('address.city'),
        state: watch('address.state'),
        zipCode: watch('address.zipcode'),
      },
      socialNetworks: {
        facebook: watch('socialNetworks.facebook'),
        instagram: watch('socialNetworks.instagram'),
        linkedin: watch('socialNetworks.linkedin'),
      },
      logo: logoUrl,
      textBeforeItems: watch('personalization.textsBeforeItems'),
      textAfterItems: watch('personalization.textsAfterItems'),
    },
  }

  const handlePreview = async () => {
    setIsLoading(true)

    const pdfData = {
      ...quotationExampleData,
      ...customData,
    }

    const blob = await pdf(
      <GeneratePdf data={pdfData} printOptions={formData} type="quotation" />,
    ).toBlob()

    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setIsLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex gap-4  min-h-52  w-full">
        <LogoUpload
          title="Logotipo"
          description="Será aplicado no menu lateral da plataforma, orçamentos e relatórios."
          name="personalization.logoUrl"
          imageUrl={logoUrl ?? undefined}
          customHelpText="PNG com fundo transparente até 50KB e 150x40px"
        />
        <LogoUpload
          title="Favicon"
          description="Será aplicado na aba do navegador. Utilize apenas o símbolo da sua marca."
          name="personalization.favIconUrl"
          imageUrl={favIconUrl ?? undefined}
          customHelpText="PNG com fundo transparente até 50KB e 40x40px"
        />
      </div>
      <div className="border border-gray-300 w-full my-7" />
      <div className="w-full mb-4">
        <p className="text-md font-semibold text-gray-700">
          Textos da proposta comercial
        </p>
        <p className="text-sm text-gray-500">
          Valem para as séries de venda sem texto próprio. Cada série pode ter
          os seus em Configurações › Vendas › Séries de venda.
        </p>
      </div>
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
        RightIcon={IconExternalLink}
        className="mx-auto"
        onClick={handlePreview}
        isLoading={isLoading}
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
          maxSize={1024 * 50} // 50kb
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
