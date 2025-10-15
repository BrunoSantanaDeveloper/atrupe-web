'use client'

import Image from 'next/image'
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

export function PlanCard() {
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex gap-4 items-center">
              <span className="flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-100 text-white border border-gray-300 check-icon transition-colors">
                <IconCheck size={12} className="stroke-[4px] stroke-gray-100" />
              </span>
              <Image src={start} alt="plano" priority />
            </div>
            <div className="flex gap-1">
              <p className="text-xl text-gray-700 font-semibold">R$ 115,00</p>
              <span className="text-sm text-gray mt-[5px]"> /mês</span>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <Accordion type="multiple">
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
                  Na jornada da excelência, tudo começa com a organização e
                  estruturação das informações. Esse ponto de partida cria as
                  bases para que o negócio avance de forma organizada e
                  profissional.
                </p>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Objetivo</p>
                  <p className="text-gray-600">
                    Digitalizar e estruturar as informações principais,
                    garantindo um início profissional e funcional.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Principais Ações</p>
                  <p className="text-gray-600">
                    - Cadastro de clientes, fornecedores, colaboradores e
                    produtos. <br /> - Organização financeira básica: plano de
                    contas, despesas fixas, folha de pagamento e receitas.{' '}
                    <br /> - Implementação de um sistema simples para emissão de
                    pedidos, controle financeiro básico e aparência
                    profissional.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">
                    Resultados Esperados
                  </p>
                  <p className="text-gray-600">
                    A empresa sai do improviso, garantindo que nenhum trabalho
                    seja esquecido, com informações organizadas e uma imagem
                    mais profissional.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-medium">
                      Empresa e sistema
                    </p>
                    <Badge
                      variant="neutralLight"
                      LeftIcon={IconPlayerPlayFilled}
                    >
                      Ver vídeo
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    - 3 usuários <br /> - Cadastro de 1 CNPJ <br /> - Padrões de
                    medida <br /> - Cadastro de colaboradores
                    <br /> - Perfis de usuário <br /> - Setores
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-medium">Vendas</p>
                    <Badge
                      variant="neutralLight"
                      LeftIcon={IconPlayerPlayFilled}
                    >
                      Ver vídeo
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    - Orçamentos <br /> - Ordens de serviço
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-medium">Financeiro</p>
                    <Badge
                      variant="neutralLight"
                      LeftIcon={IconPlayerPlayFilled}
                    >
                      Ver vídeo
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    - Fluxo financeiro <br /> - Formas de pagamento
                    <br /> - Despesas fixas <br /> - Folha de pagamento
                    (Simplificada)
                    <br /> - Plano de contas
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-medium">Produtos</p>
                    <Badge
                      variant="neutralLight"
                      LeftIcon={IconPlayerPlayFilled}
                    >
                      Ver vídeo
                    </Badge>
                  </div>
                  <p className="text-gray-600">- Produtos sem composição</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-medium">Cadastros</p>
                    <Badge
                      variant="neutralLight"
                      LeftIcon={IconPlayerPlayFilled}
                    >
                      Ver vídeo
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    - Clientes (Simplificado) <br /> - Fornecedores
                    (Simplificado)
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex gap-4 items-center">
              <span className="flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-100 text-white border border-gray-300 check-icon transition-colors">
                <IconCheck size={12} className="stroke-[4px] stroke-gray-100" />
              </span>
              <Image src={lite} alt="plano" priority />
              <Badge variant="light">Próximo nível</Badge>
            </div>
            <div className="flex gap-1">
              <p className="text-xl text-gray-700 font-semibold">R$ 230,00</p>
              <span className="text-sm text-gray mt-[5px]"> /mês</span>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <Accordion type="multiple">
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
                  Com as bases lançadas na Etapa Start, o próximo passo é
                  fortalecer a estabilidade financeira e comercial do negócio
                  por meio de ferramentas mais robustas.
                </p>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Objetivo</p>
                  <p className="text-gray-600">
                    Aprofundar o controle financeiro da empresa enquanto integra
                    informações comerciais (CRM) para facilitar tomadas de
                    decisão estratégicas.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Principais Ações</p>
                  <p className="text-gray-600">
                    - Cadastro de produtos com composições básicas. <br /> -
                    Controle financeiro avançado: <br /> - Separação por contas
                    bancárias. <br /> - Definição de limites de crédito para
                    clientes. <br /> - Opção para repasse automático das taxas
                    financeiras. <br /> - Introdução ao CRM (Gestão Comercial):
                    <br /> - Status das negociações em andamento. <br /> -
                    Motivos dos cancelamentos registrados no sistema. <br /> -
                    Histórico completo dos clientes.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">
                    Resultados Esperados
                  </p>
                  <p className="text-gray-600">
                    A empresa ganha previsibilidade financeira: <br />
                    <br /> - Redução significativa nas perdas financeiras;{' '}
                    <br /> - Melhor controle sobre vendas/compras; <br /> -
                    Decisões comerciais mais assertivas graças ao CRM integrado.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex gap-4 items-center">
              <span className="flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-100 text-white border border-gray-300 check-icon transition-colors">
                <IconCheck size={12} className="stroke-[4px] stroke-gray-100" />
              </span>
              <Image src={pro} alt="plano" priority />
              <Badge variant="orangeLight">Em breve</Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <Accordion type="multiple">
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
                  Essa é a grande virada! Com a estabilidade financeira
                  consolidada, é hora de aprofundar o conhecimento sobre custos
                  e estruturar os processos para maior eficiência.
                </p>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Objetivo</p>
                  <p className="text-gray-600">
                    Compreender os custos reais e criar padrões para processos e
                    orçamentos.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Principais Ações</p>
                  <p className="text-gray-600">
                    - Cadastro detalhado de custos: mão de obra, materiais e
                    equipamentos. <br /> - Identificação de trabalhos mais
                    lucrativos e eliminação de serviços deficitários. <br /> -
                    Padronização de processos de trabalho, criando fluxos claros
                    para orçamentos e produção. <br /> - Delegação de funções
                    antes centralizadas no dono da empresa baseada nesses
                    processos.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">
                    Resultados Esperados
                  </p>
                  <p className="text-gray-600">
                    A empresa ganha clareza sobre sua operação, reduz sua linha
                    de produtos para focar no que é mais lucrativo e padroniza
                    processos, diminuindo a dependência exclusiva do dono.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </>
  )
}
