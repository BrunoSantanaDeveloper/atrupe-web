'use client'

import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Icons
import {
  IconX,
  IconBox,
  IconSum,
  IconSend,
  IconUser,
  IconCopy,
  IconScale,
  IconTruck,
  IconPencil,
  IconPrinter,
  IconSettings,
  IconFileText,
  IconDownload,
  IconCreditCard,
} from '@tabler/icons-react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Types
interface Props {
  id: string
}

export function IssueInvoiceForm({ id }: Props) {
  const [accordionValue, setAccordionValue] = useState<string[]>([
    'config',
    'recipient',
    'items',
    'totals',
  ])
  console.info(id)

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-10">
        {/* Topbar */}
        <Topbar
          title="Emissão de NF-e"
          supportText="Nome do Cliente"
          badge={{ text: 'Em digitação', variant: 'blueLight' }}
          previousPage="/nota-fiscal/emitir"
          primaryCta={
            <Button
              variant="neutralOutline"
              size="iconMd"
              LeftIcon={IconPrinter}
            />
          }
        />

        {/* Alert Area */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center">
          <p className="text-warning-700 font-medium text-sm flex items-center justify-center gap-2">
            <span className="text-lg">⚠</span>
            Atenção! O emissor está em ambiente de homologação, a nota emitida
            não terá valor fiscal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <Button
            variant="neutralOutline"
            className="text-error-600 border-error-100 hover:bg-error-50"
            LeftIcon={IconX}
          >
            Cancelar digitação
          </Button>
          <Button variant="success" className="px-8" RightIcon={IconSend}>
            Emitir NF-e
          </Button>
        </div>

        {/* Form Sections */}
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="space-y-4"
        >
          {/* Configuração de emissão */}
          <AccordionItem value="config" className="border-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Configuração de emissão
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutralGhost"
                    size="iconSm"
                    LeftIcon={IconPencil}
                  />
                  <AccordionTrigger className="p-0 hover:no-underline" />
                </div>
              </CardHeader>
              <AccordionContent>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {[
                    {
                      label: 'Emissor',
                      value: 'Atrupe Sistemas Administrativos Ltda',
                    },
                    { label: 'CNPJ', value: '00.000.000/0001-00' },
                    { label: 'Próximo documento', value: '000000 - 1' },
                    { label: 'Tipo', value: '1 - Saída' },
                    { label: 'Finalidade', value: '1 - NF-e normal' },
                    {
                      label: 'Natureza da operação',
                      value: 'Venda de produção do estabelecimento',
                    },
                    { label: 'Consumidor final', value: '0 - Não' },
                    {
                      label: 'Presença do consumidor',
                      value: '1 - Operação presencial',
                    },
                    { label: 'NF-e referenciada', value: 'Sem referência' },
                    { label: 'Data de saída', value: '00/00/0000  00:00:00' },
                    {
                      label: 'Destino operação',
                      value: '2 - Operação interestadual',
                    },
                    {
                      label: 'Modalidade de frete',
                      value: '9 - Sem ocorrência de transporte',
                    },
                  ].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Destinatário / Tomador */}
          <AccordionItem value="recipient" className="border-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Destinatário / Tomador
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutralGhost"
                    size="iconSm"
                    LeftIcon={IconPencil}
                  />
                  <AccordionTrigger className="p-0 hover:no-underline" />
                </div>
              </CardHeader>
              <AccordionContent>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {[
                    { label: 'Razão Social', value: 'Nome do Cliente Ltda' },
                    { label: 'CNPJ', value: '00.000.000/0001-00' },
                    { label: 'I.E.', value: 'N/D' },
                    { label: 'E-mail', value: 'cliente@email.com' },
                    { label: 'Telefone', value: '(00) 00000-0000' },
                    { label: 'CEP', value: '00.000-000' },
                    { label: 'Estado', value: 'Estado' },
                    { label: 'Cidade', value: 'Cidade' },
                    { label: 'Bairro', value: 'Nome do Bairro' },
                    { label: 'Rua', value: 'Nome da Rua, 123' },
                  ].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Itens */}
          <AccordionItem value="items" className="border-none">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconBox} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Itens
                  </CardTitle>
                </div>
                <AccordionTrigger className="p-0 hover:no-underline" />
              </CardHeader>
              <AccordionContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50/50 border-y border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Referência
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          CST
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Frete
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Seguro
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Valor unitário
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Qtd.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Valor final
                        </th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group Header */}
                      <tr className="bg-gray-50/20">
                        <td
                          colSpan={8}
                          className="px-6 py-2 text-xs font-bold text-gray-600 border-b border-gray-100 uppercase"
                        >
                          107-v1 - Descrição do serviço
                        </td>
                      </tr>
                      {/* Item Row 1 */}
                      <tr className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              1 - Descrição do Item
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tight">
                              COD: 0001 | NCM: 0000.00.00 | CFOP: 0000
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 truncate max-w-[120px]">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-medium">
                              ICMS: 102
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-medium">
                              IPI: Sem enquadramento
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">-</td>
                        <td className="px-4 py-4 text-sm text-gray-500">-</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          R$ 500,00
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          2
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-success-600 text-nowrap">
                          R$ 1.000,00
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="neutralGhost"
                            size="iconSm"
                            LeftIcon={IconPencil}
                            className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </td>
                      </tr>
                      {/* Item Row 2 */}
                      <tr className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              2 - Descrição do Item
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tight">
                              COD: 0001 | NCM: 0000.00.00 | CFOP: 0000
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-medium">
                              ICMS: 102
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-medium">
                              IPI: Sem enquadramento
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">-</td>
                        <td className="px-4 py-4 text-sm text-gray-500">-</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          R$ 500,00
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          2
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-success-600 text-nowrap">
                          R$ 1.000,00
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="neutralGhost"
                            size="iconSm"
                            LeftIcon={IconPencil}
                            className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </td>
                      </tr>
                      {/* Group Header 2 */}
                      <tr className="bg-gray-50/20">
                        <td
                          colSpan={8}
                          className="px-6 py-2 text-xs font-bold text-gray-600 border-b border-gray-100 uppercase"
                        >
                          111-v1 - Descrição do serviço
                        </td>
                      </tr>
                      {/* Item Row 3 (Configuration required) */}
                      <tr className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              3 - Descrição do Item
                            </p>
                            <p className="text-[11px] text-error-600 font-medium">
                              Este item ainda não foi configurado.
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="success"
                            size="sm"
                            LeftIcon={IconSettings}
                            className="h-8 text-xs"
                          >
                            Configurar
                          </Button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">-</td>
                        <td className="px-4 py-4 text-sm text-gray-500">-</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          R$ 500,00
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">
                          2
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-success-600 text-nowrap">
                          R$ 1.000,00
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="neutralGhost"
                            size="iconSm"
                            LeftIcon={IconPencil}
                            className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Collapsed Sections */}
          {[
            { id: 'transport', label: 'Transportadora', icon: IconTruck },
            { id: 'volumes', label: 'Volumes transportados', icon: IconScale },
            { id: 'payment', label: 'Pagamento', icon: IconCreditCard },
            { id: 'installments', label: 'Duplicatas', icon: IconCopy },
            {
              id: 'auth',
              label: 'Autorização de download',
              icon: IconDownload,
            },
            {
              id: 'info',
              label: 'Informações complementares',
              icon: IconFileText,
            },
          ].map((sec) => (
            <AccordionItem key={sec.id} value={sec.id} className="border-none">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={sec.icon} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      {sec.label}
                    </CardTitle>
                  </div>
                  <AccordionTrigger className="p-0 hover:no-underline" />
                </CardHeader>
                <AccordionContent>
                  <CardContent className="text-sm text-gray-500 italic">
                    Conteúdo do setor {sec.label}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}

          {/* Totais */}
          <AccordionItem value="totals" className="border-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconSum} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Totais
                  </CardTitle>
                </div>
                <AccordionTrigger className="p-0 hover:no-underline" />
              </CardHeader>
              <AccordionContent>
                <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-y-8 gap-x-4 pt-4 border-t border-gray-50">
                  {[
                    { label: 'Valor Prod/Serv', value: 'R$ 3.000,00' },
                    { label: 'Base de cálc ICMS', value: '-' },
                    { label: 'Base de cálc ICMS ST', value: '-' },
                    { label: 'Valor COFINS', value: '-' },
                    { label: 'Outras desps. acess.', value: '-' },
                    { label: 'Desconto', value: '-' },
                    { label: 'Valor ICMS', value: '-' },
                    { label: 'Valor ICMS ST', value: '-' },
                    { label: 'Valor PIS', value: '-' },
                    { label: 'Total Tributos', value: '-' },
                    { label: 'Seguro', value: '-' },
                    { label: 'Crédito ICMS', value: '-' },
                    { label: 'Valor IPI', value: '-' },
                    { label: 'Valor da deson.', value: 'R$ 3.500,00' },
                    { label: 'Frete', value: '-' },
                    { label: 'Valor IPI Devo.', value: '-' },
                    { label: 'Valor da Nota', value: 'R$ 3.500,00' },
                  ].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </TooltipProvider>
  )
}
