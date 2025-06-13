// React
import { useEffect, useState } from 'react'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSwitch } from '@/components/common/form/FormSwitch'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Third-party
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

import { maskTime } from '@/lib/utils'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: DeliveryScheduleType
}

export function DeliveryScheduleDateDialog({ open, rowData, setOpen }: Props) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('')
  const [addTime, setAddTime] = useState(false)
  const [error, setError] = useState('')

  const queryClient = useQueryClient()

  const form = useForm()

  useEffect(() => {
    if (rowData && open) {
      setDate(new Date(rowData.scheduledDate))
      setTime(format(rowData.scheduledDate, 'HH:mm'))
      setAddTime(rowData?.addScheduleTime)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, open])

  const mutation = useMutation({
    mutationFn: (body: { scheduledDate: Date; addScheduleTime: boolean }) =>
      updateItem('deliveryScheduleRoute', `${rowData?.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
  const handleSubmit = async () => {
    if (!rowData) return

    if (!date) {
      setError('Selecione uma data.')
      return
    }

    if (addTime) {
      const timeParts = time.split(':')
      if (timeParts.length !== 2) {
        setError('Horário inválido. Formato esperado: HH:mm.')
        return
      }

      const [hours, minutes] = timeParts.map(Number)

      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        setError(
          'Horário inválido. Horas devem ser entre 0 e 23, e minutos entre 00 e 59.',
        )
        return
      }
    }

    let scheduledDate = date
    if (addTime && time) {
      const [hours, minutes] = time.split(':')
      scheduledDate = new Date(date)
      scheduledDate.setHours(Number(hours), Number(minutes))
    }

    const body = {
      scheduledDate,
      addScheduleTime: addTime,
    }

    await mutation.mutateAsync(body).then(() => {
      toast.success('Data salva!')
      handleOpenChange(false)
    })
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setDate(undefined)
      setTime('')
      setAddTime(false)
      setError('')
      setOpen('')
      return
    }
    setOpen('notes')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:w-auto sm:max-w-[323px]" closeButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Data da agenda de entrega</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 mx-auto">
          <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={(value) => {
              setDate(value)
              setError('')
            }}
            className="rounded-md border p-0"
          />
          <Form {...form}>
            <div className="flex items-center gap-4">
              <FormSwitch
                name="addTime"
                label="Adicionar horário"
                checked={addTime}
                additionalOnChange={setAddTime}
              />
              <FormInput
                name="time"
                disabled={!addTime}
                endAdornment={<>H</>}
                className="w-[100px]"
                maxLength={5}
                value={date && addTime ? time : ''}
                additionalOnChange={(value) => {
                  setError('')
                  const maskedTime = maskTime(String(value))
                  setTime(maskedTime)
                }}
              />
            </div>
            {error && <p className="text-sm font-medium text-error">{error}</p>}
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div></div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button RightIcon={IconCircleCheck} onClick={handleSubmit}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
