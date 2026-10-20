'use client'

// O expediente da produção (§4.8, decisão de 15/10/2026): os dias da
// semana, o horário e os feriados da empresa. A cadeia de alertas do
// gerenciador conta só esse tempo ao dizer se o que falta cabe até a
// entrega. Sem cadastro, vale segunda a sexta, das 08:00 às 18:00.

// React / Next
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
  CardDescription,
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
            <CardTitle>Expediente</CardTitle>
            <CardDescription>
              Os dias e o horário de trabalho da produção, e os feriados. Os
              alertas de entrega em risco contam só esse tempo.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
