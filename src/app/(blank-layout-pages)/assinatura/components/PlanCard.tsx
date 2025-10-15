'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import pro from '@/assets/images/pro-logo.png'
import lite from '@/assets/images/lite-logo.png'
import start from '@/assets/images/start-logo.png'
import Image, { StaticImageData } from 'next/image'
import { Separator } from '@/components/ui/separator'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { IconCheck, IconPlayerPlayFilled } from '@tabler/icons-react'
import { VideoDialog } from '@/app/(app-sidebar)/academy/_components/VideoDialog'

interface PlanFeature {
  title: string
  items: string[]
  videoUrl?: string
}

interface Plan {
  id: string
  logo: StaticImageData
  price?: number
  badge?: {
    text: string
    variant: 'light' | 'orangeLight'
  }
  sections: {
    concept?: {
      description: string
      objective: string
      mainActions: string[]
      expectedResults: { text?: string; list?: string[] }
      footer?: string
    }
    features?: PlanFeature[]
  }
}

const plans: Plan[] = [
  {
    id: 'start',
    logo: start,
    price: 11500,
    sections: {
      concept: {
        description:
          'Na jornada da excelência, tudo começa com a organização e estruturação das informações. Esse ponto de partida cria as bases para que o negócio avance de forma organizada e profissional.',
        objective:
          'Digitalizar e estruturar as informações principais, garantindo um início profissional e funcional.',
        mainActions: [
          'Cadastro de clientes, fornecedores, colaboradores e produtos.',
          'Organização financeira básica: plano de contas, despesas fixas, folha de pagamento e receitas.',
          'Implementação de um sistema simples para emissão de pedidos, controle financeiro básico e aparência profissional.',
        ],
        expectedResults: {
          text: 'A empresa sai do improviso, garantindo que nenhum trabalho seja esquecido, com informações organizadas e uma imagem mais profissional.',
        },
      },
      features: [
        {
          title: 'Empresa e sistema',
          items: [
            '3 usuários',
            'Cadastro de 1 CNPJ',
            'Padrões de medida',
            'Cadastro de colaboradores',
            'Perfis de usuário',
            'Setores',
          ],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Vendas',
          items: ['Orçamentos', 'Ordens de serviço'],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Financeiro',
          items: [
            'Fluxo financeiro',
            'Formas de pagamento',
            'Despesas fixas',
            'Folha de pagamento (Simplificada)',
            'Plano de contas',
          ],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Produtos',
          items: ['Produtos sem composição'],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Cadastros',
          items: ['Clientes (Simplificado)', 'Fornecedores (Simplificado)'],
          videoUrl: 'https://vimeo.com/495579294',
        },
      ],
    },
  },
  {
    id: 'lite',
    logo: lite,
    price: 23000,
    badge: {
      text: 'Próximo nível',
      variant: 'light',
    },
    sections: {
      concept: {
        description:
          'Com as bases lançadas na Etapa Start, o próximo passo é fortalecer a estabilidade financeira e comercial do negócio por meio de ferramentas mais robustas.',
        objective:
          'Aprofundar o controle financeiro da empresa enquanto integra informações comerciais (CRM) para facilitar tomadas de decisão estratégicas.',
        mainActions: [
          'Cadastro de produtos com composições básicas.',
          'Controle financeiro avançado:',
          'Separação por contas bancárias.',
          'Definição de limites de crédito para clientes.',
          'Opção para repasse automático das taxas financeiras.',
          'Introdução ao CRM (Gestão Comercial):',
          'Status das negociações em andamento.',
          'Motivos dos cancelamentos registrados no sistema.',
          'Histórico completo dos clientes.',
        ],
        expectedResults: {
          text: 'A empresa ganha previsibilidade financeira:',
          list: [
            'Redução significativa nas perdas financeiras;',
            'Melhor controle sobre vendas/compras;',
            'Decisões comerciais mais assertivas graças ao CRM integrado.',
          ],
        },
        footer:
          'As informações cadastradas aqui evoluem diretamente pra próxima etapa — sem retrabalho!',
      },
    },
  },
  {
    id: 'pro',
    logo: pro,
    badge: {
      text: 'Em breve',
      variant: 'orangeLight',
    },
    sections: {
      concept: {
        description:
          'Essa é a grande virada! Com a estabilidade financeira consolidada, é hora de aprofundar o conhecimento sobre custos e estruturar os processos para maior eficiência.',
        objective:
          'Compreender os custos reais e criar padrões para processos e orçamentos.',
        mainActions: [
          'Cadastro detalhado de custos: mão de obra, materiais e equipamentos.',
          'Identificação de trabalhos mais lucrativos e eliminação de serviços deficitários.',
          'Padronização de processos de trabalho, criando fluxos claros para orçamentos e produção.',
          'Delegação de funções antes centralizadas no dono da empresa baseada nesses processos.',
        ],
        expectedResults: {
          text: 'A empresa ganha clareza sobre sua operação, reduz sua linha de produtos para focar no que é mais lucrativo e padroniza processos, diminuindo a dependência exclusiva do dono.',
        },
      },
    },
  },
]

export function PlanCard() {
  const [videoDialog, setVideoDialog] = useState<{
    open: boolean
    url: string
    title: string
  }>({
    open: false,
    url: '',
    title: '',
  })

  const handleOpenVideo = (url: string, title: string) => {
    setVideoDialog({ open: true, url, title })
  }

  return (
    <>
      {plans.map((plan) => (
        <Card key={plan.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-4 items-center">
                <span className="flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-100 text-white border border-gray-300 check-icon transition-colors">
                  <IconCheck
                    size={12}
                    className="text-gray-100 flex-shrink-0 stroke-[3px]"
                  />
                </span>
                <Image src={plan.logo} alt="plano" priority />
                {plan.badge && (
                  <Badge variant={plan.badge.variant}>{plan.badge.text}</Badge>
                )}
              </div>
              {plan.price && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl text-gray-700 font-semibold">
                    {formatCurrencyToBrl(plan.price)}
                  </span>
                  <span className="text-sm text-gray"> /mês</span>
                </div>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent>
            <Accordion type="multiple">
              {plan.sections.concept && (
                <AccordionItem value="item-1" className="p-6 m-0 border-0">
                  <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                      <p className="text-gray-700 font-semibold text-base">
                        Conceito
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <AccordionTrigger
                        className={cn(
                          buttonVariants({
                            variant: 'neutralLight',
                            size: 'icon',
                          }),
                          'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                        )}
                      ></AccordionTrigger>
                    </div>
                  </div>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-gray-600">
                      {plan.sections.concept.description}
                    </p>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">Objetivo</p>
                      <p className="text-gray-600">
                        {plan.sections.concept.objective}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Principais Ações
                      </p>
                      <ul className="pl-2">
                        {plan.sections.concept.mainActions.map(
                          (action, index) => (
                            <li
                              key={index}
                              className="text-gray-600 flex gap-2 items-start"
                            >
                              <span className="inline-block w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Resultados Esperados
                      </p>
                      {typeof plan.sections.concept.expectedResults ===
                      'string' ? (
                        <p className="text-gray-600">
                          {plan.sections.concept.expectedResults}
                        </p>
                      ) : (
                        <>
                          {plan.sections.concept.expectedResults.text && (
                            <p className="text-gray-600">
                              {plan.sections.concept.expectedResults.text}
                            </p>
                          )}
                          <ul className="pl-2">
                            {plan.sections.concept.expectedResults.list
                              ?.length &&
                              plan.sections.concept.expectedResults.list.map(
                                (result, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-600 flex gap-2 items-start"
                                  >
                                    <span className="inline-block w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                                    <span>{result}</span>
                                  </li>
                                ),
                              )}
                          </ul>
                        </>
                      )}
                    </div>
                    {plan.sections.concept.footer && (
                      <p className="text-gray-600 font-semibold pt-2">
                        {plan.sections.concept.footer}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
              {plan.sections.features && (
                <>
                  <Separator />
                  <AccordionItem value="item-2" className="p-6 m-0 border-0">
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <p className="text-gray-700 font-semibold text-base">
                          Funcionalidades
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <AccordionTrigger
                          className={cn(
                            buttonVariants({
                              variant: 'neutralLight',
                              size: 'icon',
                            }),
                            'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                          )}
                        ></AccordionTrigger>
                      </div>
                    </div>
                    <AccordionContent className="space-y-4 pt-4">
                      {plan.sections.features.map((feature, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-700 font-medium">
                              {feature.title}
                            </p>
                            {feature.videoUrl && (
                              <Button type="button" variant="none" size="badge">
                                <Badge
                                  variant="neutralLight"
                                  LeftIcon={IconPlayerPlayFilled}
                                  onClick={() =>
                                    handleOpenVideo(
                                      feature.videoUrl!,
                                      feature.title,
                                    )
                                  }
                                >
                                  Ver vídeo
                                </Badge>
                              </Button>
                            )}
                          </div>
                          <ul className="space-y-2">
                            {feature.items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="text-gray-600 flex gap-2 items-start"
                              >
                                <IconCheck
                                  size={16}
                                  className="text-brand-400 mt-0.5 flex-shrink-0 stroke-[3px]"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <VideoDialog
        open={videoDialog.open}
        onOpenChange={(open) => setVideoDialog((prev) => ({ ...prev, open }))}
        video={videoDialog.url}
        title={videoDialog.title}
      />
    </>
  )
}
