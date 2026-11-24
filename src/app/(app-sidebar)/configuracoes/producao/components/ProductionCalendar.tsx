'use client'

// O expediente da produção (§4.8, decisão de 15/10/2026): os dias da
// semana, o horário e os feriados da empresa. A cadeia de alertas do
// gerenciador conta só esse tempo ao dizer se o que falta cabe até a
// entrega. Sem cadastro, vale segunda a sexta, das 08:00 às 18:00.

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/ui/icon'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  saveCalendar,
  type ProductionCalendar,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import { usePermissions } from '@/hooks/usePermissions'
import { PRODUCTION_MANAGE } from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'

// Icons
import { IconCalendarTime, IconX } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const WEEKDAYS = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

const date = (value: string) => value.split('-').reverse().join('/')

// A agenda viva (Maicol, 24/11/2026): vale para a cadeia inteira, de todos
// os setores, por isso fica no expediente da empresa
const liveScheduleOptions = [
  {
    value: 'WARN' as const,
    text: 'Avisar o atraso em toda a cadeia',
    help: 'As etapas seguintes mostram o atraso; quem gerencia reagenda.',
  },
  {
    value: 'RESCHEDULE' as const,
    text: 'Avisar e reagendar (agenda viva)',
    help: 'A agenda anda sozinha: a etapa que espera a anterior vai para depois dela e outro trabalho da fila ocupa o lugar; se a anterior termina antes, as seguintes vêm para mais cedo. O trabalho com o cadeado não anda.',
  },
]

export function ProductionCalendarCard({
  calendar,
  onSaved,
}: {
  calendar: ProductionCalendar
  onSaved: () => void
}) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(PRODUCTION_MANAGE[0])
  const [values, setValues] = useState(calendar)
  const [holiday, setHoliday] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => setValues(calendar), [calendar])

  const toggleDay = (day: number, checked: boolean) =>
    setValues((current) => ({
      ...current,
      workDays: checked
        ? [...current.workDays, day]
        : current.workDays.filter((item) => item !== day),
    }))

  const addHoliday = () => {
    if (!holiday || values.holidays.includes(holiday)) return
    setValues((current) => ({
      ...current,
      holidays: [...current.holidays, holiday].sort(),
    }))
    setHoliday('')
  }

  const save = async () => {
    setSaving(true)
    const res = await saveCalendar(values)
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Expediente salvo')
    onSaved()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FeaturedIcon tone="neutral" Icon={IconCalendarTime} />
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle>Expediente</CardTitle>
              <InfoHint title="Expediente">
                <p>
                  Os dias e o horário de trabalho da empresa, o intervalo e os
                  feriados. Cada gerenciador novo nasce com esse expediente e
                  pode ser editado. Os alertas de entrega em risco contam só
                  esse tempo. No feriado, a agenda deixa agendar, mas o dia fica
                  em vermelho.
                </p>
              </InfoHint>
            </div>
          </div>
        </div>
      </CardHeader>
      {/* Formulário dentro de card leva p-6 (design §18.1); sem ele, os
          campos encostavam na borda (29/10/2026) */}
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Label>Dias de trabalho</Label>
          <div className="flex flex-wrap gap-4">
            {WEEKDAYS.map((day) => (
              <label
                key={day.value}
                className="flex items-center gap-2 text-sm text-gray-800"
              >
                <Checkbox
                  checked={values.workDays.includes(day.value)}
                  disabled={!canEdit}
                  onCheckedChange={(checked) =>
                    toggleDay(day.value, checked === true)
                  }
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label htmlFor="calendar-start">Início</Label>
            <Input
              id="calendar-start"
              type="time"
              className="w-[140px]"
              disabled={!canEdit}
              value={values.startTime}
              onChange={(event) =>
                setValues({ ...values, startTime: event.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="calendar-end">Fim</Label>
            <Input
              id="calendar-end"
              type="time"
              className="w-[140px]"
              disabled={!canEdit}
              value={values.endTime}
              onChange={(event) =>
                setValues({ ...values, endTime: event.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="calendar-break-start">Intervalo de</Label>
            <Input
              id="calendar-break-start"
              type="time"
              className="w-[140px]"
              disabled={!canEdit}
              value={values.breakStart ?? ''}
              onChange={(event) =>
                setValues({ ...values, breakStart: event.target.value || null })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="calendar-break-end">Intervalo até</Label>
            <Input
              id="calendar-break-end"
              type="time"
              className="w-[140px]"
              disabled={!canEdit}
              value={values.breakEnd ?? ''}
              onChange={(event) =>
                setValues({ ...values, breakEnd: event.target.value || null })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Quando uma etapa atrasa</Label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {liveScheduleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={!canEdit}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    liveSchedule: option.value,
                  }))
                }
                className={cn(
                  'flex flex-col justify-start rounded-lg border p-3 text-left disabled:cursor-not-allowed',
                  (values.liveSchedule ?? 'WARN') === option.value
                    ? 'border-brand-500 bg-brand-25 ring-1 ring-brand-500'
                    : 'border-gray-200 hover:border-gray-300',
                )}
              >
                <span className="block text-sm font-medium text-gray-800">
                  {option.text}
                </span>
                <span className="block text-xs text-gray">{option.help}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="calendar-holiday">Feriados</Label>
          <PermissionGate permissions={PRODUCTION_MANAGE}>
            <div className="flex flex-wrap items-end gap-2">
              <Input
                id="calendar-holiday"
                type="date"
                className="w-[180px]"
                value={holiday}
                onChange={(event) => setHoliday(event.target.value)}
              />
              <Button
                type="button"
                variant="neutralOutline"
                disabled={!holiday}
                onClick={addHoliday}
              >
                Acrescentar
              </Button>
            </div>
          </PermissionGate>
          <div className="flex flex-wrap gap-2">
            {values.holidays.map((day) => (
              <Badge key={day} variant="neutralLight" className="gap-1">
                {date(day)}
                {canEdit && (
                  <button
                    type="button"
                    aria-label={`Tirar o feriado de ${date(day)}`}
                    onClick={() =>
                      setValues({
                        ...values,
                        holidays: values.holidays.filter(
                          (item) => item !== day,
                        ),
                      })
                    }
                  >
                    <Icon icon={IconX} size="sm" />
                  </button>
                )}
              </Badge>
            ))}
            {!values.holidays.length && (
              <p className="text-sm text-gray">Nenhum feriado cadastrado.</p>
            )}
          </div>
        </div>
      </CardContent>
      <PermissionGate permissions={PRODUCTION_MANAGE}>
        <CardFooter className="justify-end">
          <Button
            type="button"
            isLoading={saving}
            disabled={!values.workDays.length}
            onClick={save}
          >
            Salvar expediente
          </Button>
        </CardFooter>
      </PermissionGate>
    </Card>
  )
}
