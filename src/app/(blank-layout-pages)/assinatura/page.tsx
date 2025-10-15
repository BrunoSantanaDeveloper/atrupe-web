'use client'

import { z } from 'zod'
import {
  IconUser,
  IconArrowLeft,
  IconArrowRight,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/common/form/FormInput'
import { SubscriptionTerms } from './components/SubscriptionTerms'
import FormToggleCard from '@/components/common/form/FormToggleCard'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

const toggleOptions = [
  {
    label: 'Pessoa Física',
    value: 'PF',
    icon: IconUser,
  },
  {
    label: 'Pessoa Jurídica',
    value: 'PJ',
    icon: IconBuildingCommunity,
  },
]

const baseSchema = z.object({
  type: z.enum(['PF', 'PJ']),
  // Campos comuns
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  telefone: z.string().optional(),
  celular: z.string().min(1, 'Celular é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  rua: z.string().min(1, 'Rua é obrigatória'),
  complemento: z.string().optional(),
})

const schemaPF = baseSchema.extend({
  type: z.literal('PF'),
  name: z.string().min(1, 'Nome completo é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
})

const schemaPJ = baseSchema.extend({
  type: z.literal('PJ'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  nomeResponsavel: z
    .string()
    .min(1, 'Nome completo do responsável é obrigatório'),
  cpfResponsavel: z.string().min(1, 'CPF do responsável é obrigatório'),
})

const schema = z.discriminatedUnion('type', [schemaPF, schemaPJ])

type FormType = z.infer<typeof schema>

export default function SubscriptionPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'PF',
    },
  })

  const { handleSubmit, watch } = form
  const selectedType = watch('type')

  const onSubmit = (data: FormType) => {
    if (!agreedToTerms) return

    console.log(data)
  }

  return (
    <div className="w-full bg-gray-100">
      <header className="flex flex-wrap justify-between gap-2 bg-white px-6 py-4">
        <div className="flex items-center gap-1">
          <Button
            asChild
            type="button"
            size="icon"
            variant="neutralLight"
            className="bg-transparent"
          >
            <Link href="/dashboard">
              <IconArrowLeft />
            </Link>
          </Button>
          <h1 className="text-gray-800 font-semibold text-lg">Assinatura</h1>
        </div>
        <Logo text />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plano Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                Plano
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Escolha o plano mais compatível com o seu negócio.
              </p>
              <Card>
                <CardContent className="p-6"></CardContent>
              </Card>
            </div>

            {/* Nota Fiscal Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                Nota Fiscal
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Contrate recursos adicionais para impulsionar o seu plano.
              </p>
              <Card>
                <CardContent className="p-6"></CardContent>
              </Card>
            </div>

            {/* Usuários adicionais Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                Usuários adicionais
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Contrate usuários adicionais para uma melhor organização do seu
                time.
              </p>
              <Card>
                <CardContent className="p-6"></CardContent>
              </Card>
            </div>

            {/* Dados complementares Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                Dados complementares
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Informações para emissão de suas Notas Fiscais.
              </p>
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form
                      id="subscription-form"
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="flex flex-wrap gap-5"
                    >
                      <FormToggleCard options={toggleOptions} />

                      {/* Campos específicos por tipo */}
                      {selectedType === 'PF' ? (
                        <>
                          <FormInput
                            name="name"
                            label="Nome completo"
                            width="w-full mt-2"
                          />
                          <div className="flex w-full flex-wrap gap-5">
                            <FormInput
                              name="cpf"
                              label="CPF"
                              width="flex-[1_1_300px]"
                            />
                            <FormInput
                              name="email"
                              label="E-mail"
                              width="flex-[1_1_300px]"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <FormInput
                            name="razaoSocial"
                            label="Razão social"
                            width="w-full mt-2"
                          />
                          <FormInput name="cnpj" label="CNPJ" width="w-full" />
                          <FormInput
                            name="nomeResponsavel"
                            label="Nome completo do responsável"
                            width="w-full"
                          />
                          <div className="flex w-full flex-wrap gap-5">
                            <FormInput
                              name="cpfResponsavel"
                              label="CPF do responsável"
                              width="flex-[1_1_300px]"
                            />
                            <FormInput
                              name="email"
                              label="E-mail"
                              width="flex-[1_1_300px]"
                            />
                          </div>
                        </>
                      )}

                      {/* Campos comuns */}
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="telefone"
                          label="Telefone"
                          width="flex-[1_1_300px]"
                        />
                        <FormInput
                          name="celular"
                          label="Celular"
                          width="flex-[1_1_300px]"
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="cep"
                          label="CEP"
                          width="flex-[1_1_300px]"
                        />
                        <FormInput
                          name="estado"
                          label="Estado"
                          width="flex-[1_1_300px]"
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="cidade"
                          label="Cidade"
                          width="flex-[1_1_300px]"
                        />
                        <FormInput
                          name="bairro"
                          label="Bairro"
                          width="flex-[1_1_300px]"
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-5">
                        <FormInput
                          name="numero"
                          label="Número"
                          width="flex-[1_0_100px]"
                        />
                        <FormInput
                          name="rua"
                          label="Rua"
                          width="flex-[1_1_400px]"
                        />
                      </div>
                      <FormInput
                        name="complemento"
                        label="Complemento"
                        width="w-full"
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-700">
                    Resumo da assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => {
                        setAgreedToTerms(checked as boolean)
                      }}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      Estou de acordo com os{' '}
                      <SubscriptionTerms onAgreeChange={setAgreedToTerms} /> da
                      Atrupe.
                    </label>
                  </div>
                  <Button
                    type="submit"
                    form="subscription-form"
                    className="w-full"
                    disabled={!agreedToTerms}
                  >
                    Avançar
                    <IconArrowRight />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
