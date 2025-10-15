'use client'

import { z } from 'zod'
import {
  IconUser,
  IconArrowLeft,
  IconArrowRight,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/common/form/FormInput'
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

const schema = z.any()

type FormType = z.infer<typeof schema>

export default function SubscriptionPage() {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { setValue, handleSubmit } = form

  const onSubmit = (data: FormType) => {
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
                      id="form-data"
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="flex flex-wrap gap-4"
                    >
                      <FormToggleCard
                        options={toggleOptions}
                        onChange={(value) => {
                          setValue('type', value as 'PF' | 'PJ')
                        }}
                      />
                      <FormInput
                        name="name"
                        label="Nome completo"
                        width="w-full"
                      />
                      <FormInput
                        name="cpf"
                        label="CPF"
                        width="flex-[1_0_200px]"
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
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      Estou de acordo com os{' '}
                      <button className="text-brand font-medium hover:underline">
                        Termos de Contratação
                      </button>{' '}
                      da Atrupe.
                    </label>
                  </div>
                  <Button className="w-full">
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
