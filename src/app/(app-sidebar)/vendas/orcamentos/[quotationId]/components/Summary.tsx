// React
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'

// UI
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
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
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { formatToLocaleDateTime } from '@/lib/formatDate'
import { cn, maskCpfCnpj, truncateString } from '@/lib/utils'

// Icons
import {
  IconPencil,
  IconFileInvoice,
  IconDeviceFloppy,
} from '@tabler/icons-react'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Consts
import { clientStatusObj } from '@/consts/client'

// Actions
import { updateItemNew } from '@/actions/_cruds'

import { QUOTATION_DATA_QUERY_KEY } from './Quotation'

interface Props {
  data: QuotationType
  onEditClick?: () => void
  editDisabled?: boolean
}

function formatDateForInput(date?: string | Date) {
  if (!date) return ''

  const dateParts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(new Date(date))

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value || ''

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`
}

function dateInputToSaoPauloIso(date: string) {
  return new Date(`${date}T00:00:00-03:00`).toISOString()
}

function EditableDateField({
  label,
  value,
  field,
  quotationId,
}: {
  label: string
  value?: string | Date
  field: 'createdAt' | 'approvedAt'
  quotationId: string
}) {
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState(formatDateForInput(value))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setInputValue(formatDateForInput(value))
  }, [value])

  const hasChanged = inputValue !== formatDateForInput(value)

  const handleSave = async () => {
    if (!inputValue) {
      toast.error('Informe uma data válida.')
      return
    }

    setIsSaving(true)
    const res = await updateItemNew({
      route: `/sale/quotation/${quotationId}`,
      data: {
        [field]: dateInputToSaoPauloIso(inputValue),
      },
    })
    setIsSaving(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Data atualizada com sucesso!')
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })

    if (field === 'approvedAt') {
      queryClient.invalidateQueries({ queryKey: ['order-data'] })
      queryClient.invalidateQueries({ queryKey: ['order-list'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray">{label}</p>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="h-9 max-w-[170px] text-sm"
          disabled={isSaving}
        />
        <Button
          type="button"
          variant="neutralLight"
          size="iconSm"
          LeftIcon={IconDeviceFloppy}
          leftIconSize={16}
          title="Salvar data"
          disabled={isSaving || !hasChanged}
          isLoading={isSaving}
          onClick={handleSave}
        />
      </div>
    </div>
  )
}

export function QuotationSummary({ data, onEditClick, editDisabled }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin

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
                  <DuplicateDialog quotationData={data} />
                  <Button
                    type="button"
                    variant="neutralLight"
                    size="icon"
                    LeftIcon={IconPencil}
                    title="Editar"
                    onClick={() => {
                      if (onEditClick) {
                        onEditClick()
                      } else {
                        setOpenDialog('editQuotation')
                      }
                    }}
                    disabled={
                      editDisabled !== undefined
                        ? editDisabled
                        : actionDisabled('editQuotation', data?.status)
                    }
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
                {isAdmin ? (
                  <EditableDateField
                    label="Data de criação"
                    value={data?.createdAt}
                    field="createdAt"
                    quotationId={data.id}
                  />
                ) : (
                  <TextSupportingText
                    supporting="Data de criação"
                    text={formatToLocaleDateTime(data?.createdAt)}
                  />
                )}
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
                  {/* TODO : Adicionar data de rejeição */}
                  <TextSupportingText supporting="Data de rejeição" text="-" />
                </DetailCardRowItem>
              )}
              {data?.status === 'APPROVED' && (
                <DetailCardRowItem>
                  <TextSupportingText
                    supporting="Data de conclusão"
                    text={formatToLocaleDateTime(data?.finishedAt) || '-'}
                  />
                  {isAdmin ? (
                    <EditableDateField
                      label="Data de aprovação"
                      value={data?.approvedAt}
                      field="approvedAt"
                      quotationId={data.id}
                    />
                  ) : (
                    <TextSupportingText
                      supporting="Data de aprovação"
                      text={formatToLocaleDateTime(data?.approvedAt) || '-'}
                    />
                  )}
                </DetailCardRowItem>
              )}
              {!data?.quickSale || data?.client ? (
                <DetailCardRowItem
                  showSeparator={false}
                  className="pb-4 lg:grid-cols-5"
                >
                  <TextSupportingText
                    supporting="Cliente"
                    text={data?.client?.name || '-'}
                    badge={{
                      variant:
                        clientStatusObj[data?.client?.status ?? '']?.variant,
                      text: clientStatusObj[data?.client?.status ?? '']?.text,
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
                  <TextSupportingText
                    supporting="Responsável"
                    text={data?.contact?.name || '-'}
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
