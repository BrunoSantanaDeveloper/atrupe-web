// React
import { useState } from 'react'

// UI
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { DuplicateDialog } from './QuotationActions/Duplicate'
import { NewQuotationModal } from '../../components/NewQuotation'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { DetailCardRowItem } from '@/app/(app)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { formatToLocaleDateTime } from '@/lib/formatDate'
import { cn, maskCpfCnpj, truncateString } from '@/lib/utils'

// Icons
import { IconPencil, IconFileInvoice } from '@tabler/icons-react'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Consts
import { clientStatusObj } from '@/consts/client'

interface Props {
  data: QuotationType
}

export function QuotationSummary({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')

  return (
    <Card className="w-full">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="p-0 m-0 border-0">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Resumo
                </CardTitle>
              </div>
              <div className="flex gap-3">
                <TooltipProvider>
                  {/* <ActionButton
                    Icon={IconReceipt2}
                    tooltip="Previsão de custos"
                    className={cn(
                      buttonVariants({ variant: 'neutralLight', size: 'icon' }),
                    )}
                  /> */}
                  <DuplicateDialog quotationData={data} />
                  <Button
                    type="button"
                    variant="neutralLight"
                    size="icon"
                    LeftIcon={IconPencil}
                    title="Editar"
                    onClick={() => {
                      setOpenDialog('editQuotation')
                    }}
                    disabled={actionDisabled('editQuotation', data?.status)}
                  />
                </TooltipProvider>
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
          </CardHeader>
          <AccordionContent>
            <Separator className="mb-4" />
            <CardContent>
              <DetailCardRowItem>
                <TextSupportingText
                  supporting="Referência"
                  text={truncateString(150, data?.description)}
                  containerClassName="col-span-2 md:col-span-3 lg:col-span-4"
                />
              </DetailCardRowItem>
              <DetailCardRowItem>
                <TextSupportingText
                  supporting="Vendedor"
                  text={data?.seller?.name || '-'}
                />
                <TextSupportingText
                  supporting="Empresa"
                  text={truncateString(30, data?.company?.name) || '-'}
                />
                <TextSupportingText
                  supporting="CNPJ empresa"
                  text={maskCpfCnpj(data?.company?.cnpj || '-')}
                />
                <TextSupportingText
                  supporting="Data de criação"
                  text={formatToLocaleDateTime(data?.createdAt)}
                />
              </DetailCardRowItem>
              {data?.status === 'DONE' && (
                <DetailCardRowItem>
                  <TextSupportingText
                    supporting="Data de conclusão"
                    text={formatToLocaleDateTime(data?.finishedAt) || '-'}
                  />
                  <TextSupportingText
                    supporting="Validade da proposta"
                    text={formatToLocaleDateTime(data?.dueDate) || '-'}
                  />
                  <TextSupportingText
                    supporting="Data de aprovação"
                    text={formatToLocaleDateTime(data?.approvedAt) || '-'}
                  />
                  {/* TODO : Adicionar data de rejeição */}
                  <TextSupportingText supporting="Data de rejeição" text="-" />
                </DetailCardRowItem>
              )}
              {!data?.quickSale ? (
                <DetailCardRowItem showSeparator={false}>
                  <TextSupportingText
                    supporting="Cliente"
                    text={data?.client?.name || '-'}
                    badge={{
                      variant: clientStatusObj[data?.client?.status]?.variant,
                      text: clientStatusObj[data?.client?.status]?.text,
                    }}
                  />
                  <TextSupportingText
                    supporting={`${data?.client?.cpf ? 'CPF' : 'CNPJ'} Cliente`}
                    text={data?.client?.cpf || data?.client?.cnpj || '-'}
                  />
                  <TextSupportingText
                    supporting="E-mail cliente"
                    text={data?.client?.email || '-'}
                  />
                  <TextSupportingText
                    supporting="Telefone Cliente"
                    text={data?.client?.phoneNumber || '-'}
                  />
                </DetailCardRowItem>
              ) : null}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <NewQuotationModal
        editMode
        data={data}
        open={openDialog === 'editQuotation'}
        onOpenChange={(open) => {
          setOpenDialog(open ? 'editQuotation' : '')
        }}
      />
    </Card>
  )
}
