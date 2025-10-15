'use client'

import Image, { StaticImageData } from 'next/image'
import { cn } from '@/lib/utils'
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
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { IconCheck, IconPlayerPlayFilled } from '@tabler/icons-react'

interface PlanFeature {
  title: string
  content: string
}

interface Plan {
  id: string
  logo: StaticImageData
  price?: string
  badge?: {
    text: string
    variant: 'light' | 'orangeLight'
  }
  sections: {
    concept?: {
      description: string
      objective: string
      mainActions: string
      expectedResults: string
    }
    features?: PlanFeature[]
  }
}

const plans: Plan[] = [
  {
    id: 'start',
    logo: start,
    price: 'R$ 115,00',
    sections: {
      concept: {
        description:
          'Na jornada da excelência, tudo começa com a organização e estruturação das informações. Esse ponto de partida cria as bases para que o negócio avance de forma organizada e profissional.',
        objective:
          'Digitalizar e estruturar as informações principais, garantindo um início profissional e funcional.',
        mainActions:
          '- Cadastro de clientes, fornecedores, colaboradores e produtos. <br /> - Organização financeira básica: plano de contas, despesas fixas, folha de pagamento e receitas. <br /> - Implementação de um sistema simples para emissão de pedidos, controle financeiro básico e aparência profissional.',
        expectedResults:
          'A empresa sai do improviso, garantindo que nenhum trabalho seja esquecido, com informações organizadas e uma imagem mais profissional.',
      },
      features: [
        {
          title: 'Empresa e sistema',
          content:
            '- 3 usuários <br /> - Cadastro de 1 CNPJ <br /> - Padrões de medida <br /> - Cadastro de colaboradores<br /> - Perfis de usuário <br /> - Setores',
        },
        {
          title: 'Vendas',
          content: '- Orçamentos <br /> - Ordens de serviço',
        },
        {
          title: 'Financeiro',
          content:
            '- Fluxo financeiro <br /> - Formas de pagamento<br /> - Despesas fixas <br /> - Folha de pagamento (Simplificada)<br /> - Plano de contas',
        },
        {
          title: 'Produtos',
          content: '- Produtos sem composição',
        },
        {
          title: 'Cadastros',
          content:
            '- Clientes (Simplificado) <br /> - Fornecedores (Simplificado)',
        },
      ],
    },
  },
  {
    id: 'lite',
    logo: lite,
    price: 'R$ 230,00',
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
        mainActions:
          '- Cadastro de produtos com composições básicas. <br /> - Controle financeiro avançado: <br /> - Separação por contas bancárias. <br /> - Definição de limites de crédito para clientes. <br /> - Opção para repasse automático das taxas financeiras. <br /> - Introdução ao CRM (Gestão Comercial):<br /> - Status das negociações em andamento. <br /> - Motivos dos cancelamentos registrados no sistema. <br /> - Histórico completo dos clientes.',
        expectedResults:
          'A empresa ganha previsibilidade financeira: <br /><br /> - Redução significativa nas perdas financeiras; <br /> - Melhor controle sobre vendas/compras; <br /> - Decisões comerciais mais assertivas graças ao CRM integrado.',
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
        mainActions:
          '- Cadastro detalhado de custos: mão de obra, materiais e equipamentos. <br /> - Identificação de trabalhos mais lucrativos e eliminação de serviços deficitários. <br /> - Padronização de processos de trabalho, criando fluxos claros para orçamentos e produção. <br /> - Delegação de funções antes centralizadas no dono da empresa baseada nesses processos.',
        expectedResults:
          'A empresa ganha clareza sobre sua operação, reduz sua linha de produtos para focar no que é mais lucrativo e padroniza processos, diminuindo a dependência exclusiva do dono.',
      },
    },
  },
]

export function PlanCard() {
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
                    className="stroke-[4px] stroke-gray-100"
                  />
                </span>
                <Image src={plan.logo} alt="plano" priority />
                {plan.badge && (
                  <Badge variant={plan.badge.variant}>{plan.badge.text}</Badge>
                )}
              </div>
              {plan.price && (
                <div className="flex gap-1">
                  <p className="text-xl text-gray-700 font-semibold">
                    {plan.price}
                  </p>
                  <span className="text-sm text-gray mt-[5px]"> /mês</span>
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
                    <p
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: plan.sections.concept.description,
                      }}
                    />
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">Objetivo</p>
                      <p
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: plan.sections.concept.objective,
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Principais Ações
                      </p>
                      <p
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: plan.sections.concept.mainActions,
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Resultados Esperados
                      </p>
                      <p
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: plan.sections.concept.expectedResults,
                        }}
                      />
                    </div>
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
                            <Badge
                              variant="neutralLight"
                              LeftIcon={IconPlayerPlayFilled}
                            >
                              Ver vídeo
                            </Badge>
                          </div>
                          <p
                            className="text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: feature.content,
                            }}
                          />
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
    </>
  )
}
