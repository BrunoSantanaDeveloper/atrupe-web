'use client'

import { FormTextarea } from '@/components/common/form/FormTextarea'

import { CompanyFormType } from '../../schema'

import { Path, useFormContext } from 'react-hook-form'
import { ProductImageUpload } from '@/components/common/form/global-inputs/ProductImageUpload'
import Image from 'next/image'
import { IconExternalLink, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF
import { useState } from 'react'
import { formData, quotationExampleData } from './previewData'
import { cn, maskCnpj } from '@/lib/utils'

export function Step3() {
  const { watch } = useFormContext<CompanyFormType>()
  const [isLoading, setIsLoading] = useState(false)

  const logoUrl = watch('personalization.logoUrl')
  const logoDarkUrl = watch('personalization.logoDarkUrl')
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

    const [{ pdf }, { GeneratePdf }] = await Promise.all([
      import('@react-pdf/renderer'),

      import('@/components/common/PrintQuotation/GeneratePdf'),
    ])

    const blob = await pdf(
      <GeneratePdf data={pdfData} printOptions={formData} type="quotation" />,
    ).toBlob()

    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setIsLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="grid w-full min-h-52 gap-4 md:grid-cols-3">
        <LogoUpload
          title="Logotipo"
          description="Será aplicado no menu lateral da plataforma, orçamentos e relatórios."
          name="personalization.logoUrl"
          imageUrl={logoUrl ?? undefined}
          customHelpText="PNG com fundo transparente até 50KB e 150x40px"
        />
        {/* O menu lateral troca para esta versão no tema escuro; sem ela,
            vale o logotipo normal. Orçamentos e relatórios usam sempre o
            normal, porque o papel é branco */}
        <LogoUpload
          title="Logotipo para o tema escuro"
          description="Versão com letras claras, para o menu lateral no tema escuro. Sem ela, vale o logotipo acima."
          name="personalization.logoDarkUrl"
          imageUrl={logoDarkUrl ?? undefined}
          customHelpText="PNG com fundo transparente até 50KB e 150x40px"
          darkPreview
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
  /** Mostra a imagem sobre fundo escuro, como ela vai aparecer */
  darkPreview?: boolean
}

function LogoUpload({
  title,
  description,
  name,
  imageUrl,
  customHelpText,
  darkPreview,
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
        <div
          className={cn(
            'w-full h-full min-h-32 flex items-center justify-center relative rounded-xl',
            darkPreview && 'bg-gray-900',
          )}
        >
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
            <FeaturedIcon tone="neutral" Icon={IconTrash} />
          </Button>
        </div>
      )}
    </div>
  )
}
