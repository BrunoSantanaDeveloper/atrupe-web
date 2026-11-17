'use client'

// A máquina offset como tipo próprio de patrimônio (OF-7): os campos que só a
// impressão offset lê. O custo-hora continua vindo do patrimônio, como nas
// outras máquinas. Mudar aqui recalcula o item ao lado.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BrlInput } from '@/components/common/BrlInput'

import { formatBrl, type OffsetMachine } from '../calc'

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-sm text-gray">{hint}</p>}
    </div>
  )
}

export function OffsetMachines({
  machines,
  machineId,
  onMachineId,
  onChange,
}: {
  machines: OffsetMachine[]
  machineId: string
  onMachineId: (id: string) => void
  onChange: (machine: OffsetMachine) => void
}) {
  const machine = machines.find((item) => item.id === machineId) || machines[0]
  const patch = (changes: Partial<OffsetMachine>) =>
    onChange({ ...machine, ...changes })
  const number = (key: keyof OffsetMachine, min = 0) => ({
    type: 'number' as const,
    min,
    value: machine[key] as number,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      patch({ [key]: Math.max(Number(event.target.value) || 0, min) }),
  })

  return (
    <div className="space-y-4">
      <div className="max-w-md space-y-1.5">
        <Label>Máquina</Label>
        <Select value={machine.id} onValueChange={onMachineId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {machines.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Formato e impressão</CardTitle>
            <CardDescription>
              Patrimônios › máquina do tipo &quot;Impressora offset&quot;. É o
              que diz se o trabalho cabe e quantas passadas ele pede.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 px-6 pb-6">
            <div className="col-span-2">
              <Field id="m-name" label="Nome">
                <Input
                  id="m-name"
                  value={machine.name}
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </Field>
            </div>
            <Field id="m-maxw" label="Formato máximo: largura (cm)">
              <Input id="m-maxw" step="0.5" {...number('maxWidth', 1)} />
            </Field>
            <Field id="m-maxh" label="Formato máximo: altura (cm)">
              <Input id="m-maxh" step="0.5" {...number('maxHeight', 1)} />
            </Field>
            <Field id="m-minw" label="Formato mínimo: largura (cm)">
              <Input id="m-minw" step="0.5" {...number('minWidth', 1)} />
            </Field>
            <Field id="m-minh" label="Formato mínimo: altura (cm)">
              <Input id="m-minh" step="0.5" {...number('minHeight', 1)} />
            </Field>
            <Field
              id="m-gripper"
              label="Margem de pinça (mm)"
              hint="Borda da folha que a máquina segura e não imprime."
            >
              <Input id="m-gripper" {...number('gripperMm')} />
            </Field>
            <Field
              id="m-towers"
              label="Cores por passada"
              hint="Mais cores que isso pedem outra passada."
            >
              <Input id="m-towers" {...number('towers', 1)} />
            </Field>
            <div className="col-span-2 flex items-start gap-3">
              <Switch
                id="m-turn"
                checked={machine.workAndTurn}
                onCheckedChange={(workAndTurn) => patch({ workAndTurn })}
              />
              <div>
                <Label htmlFor="m-turn">Aceita tira e retira</Label>
                <p className="text-sm text-gray">
                  Frente e verso com um só jogo de chapas, quando as cores dos
                  dois lados são as mesmas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chapas, acerto e produção</CardTitle>
            <CardDescription>
              O custo fixo de cada trabalho: é o que faz o unitário cair quando
              a tiragem sobe.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 px-6 pb-6">
            <Field
              id="m-plate"
              label="Chapa"
              hint="O material da chapa, por chapa."
            >
              <BrlInput
                id="m-plate"
                value={machine.plateCents}
                onChange={(plateCents) => patch({ plateCents })}
              />
            </Field>
            <Field id="m-engraving" label="Gravação por chapa">
              <BrlInput
                id="m-engraving"
                value={machine.engravingCents}
                onChange={(engravingCents) => patch({ engravingCents })}
              />
            </Field>
            <Field
              id="m-makeready"
              label="Folhas de acerto por chapa"
              hint="Somadas à tiragem, uma vez por trabalho."
            >
              <Input id="m-makeready" {...number('makereadySheetsPerPlate')} />
            </Field>
            <Field id="m-setup" label="Preparo por chapa (min)">
              <Input id="m-setup" {...number('setupMinutesPerPlate')} />
            </Field>
            <Field
              id="m-speed"
              label="Folhas por hora"
              hint="Por passada na máquina."
            >
              <Input id="m-speed" step="500" {...number('sheetsPerHour', 1)} />
            </Field>
            <Field
              id="m-hour"
              label="Custo-hora"
              hint="Vem dos custos do patrimônio, como nas outras máquinas."
            >
              <BrlInput
                id="m-hour"
                value={machine.hourCents}
                onChange={(hourCents) => patch({ hourCents })}
              />
            </Field>
            <p className="col-span-2 text-sm text-gray">
              Um trabalho 4x4 nesta máquina, sem tira e retira, começa com{' '}
              {formatBrl(
                8 * (machine.plateCents + machine.engravingCents) +
                  Math.round(
                    ((8 * machine.setupMinutesPerPlate) / 60) *
                      machine.hourCents,
                  ),
              )}{' '}
              de chapas e preparo e {8 * machine.makereadySheetsPerPlate} folhas
              de acerto, antes da primeira peça.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
