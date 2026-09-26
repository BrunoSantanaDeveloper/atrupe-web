'use client'

// Novo processo: nome, setor e se é acabamento de outro setor (MS-1). O resto
// — linhas, regras, tempo — se monta na página do processo.

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import {
  createProcessDef,
  getAssemblyResources,
} from '@/actions/product-assembly'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCirclePlus, IconListCheck } from '@tabler/icons-react'

interface Props {
  onCreated: (processId: string) => void
}

export function NewProcessModal({ onCreated }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [finishingOf, setFinishingOf] = useState('none')
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
  })
  const sectors = data?.data?.sectors || []

  useEffect(() => {
    if (open) {
      setName('')
      setSector(sectors[0] || '')
      setFinishingOf('none')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = async () => {
    setSaving(true)
    const res = await createProcessDef({
      name,
      sector,
      finishingOf: finishingOf === 'none' ? null : finishingOf,
    })
    setSaving(false)
    if (!res.success || !res.data) return toast.error(res.message)
    toast.success('Processo criado')
    await queryClient.invalidateQueries({ queryKey: ['process-list'] })
    setOpen(false)
    onCreated(res.data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button LeftIcon={IconCirclePlus}>Novo processo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconListCheck} />
            <div>
              <DialogTitle>Novo processo</DialogTitle>
              <DialogDescription>
                A etapa de um setor que se repete em vários produtos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="process-name">Nome</Label>
            <Input
              id="process-name"
              autoFocus
              placeholder="Ex.: Impressão solvente, Bainha, Ilhós"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <SelectBasic
            name="process-sector"
            label="Setor"
            options={sectors.map((item) => ({ value: item, label: item }))}
            value={sector}
            onChange={(value) => value && setSector(String(value))}
          />
          <SelectBasic
            name="process-finishing"
            label="É acabamento de"
            options={[
              { value: 'none', label: 'Não é acabamento' },
              ...sectors.map((item) => ({ value: item, label: item })),
            ]}
            value={finishingOf}
            onChange={(value) => value && setFinishingOf(String(value))}
          />
          <p className="text-sm text-gray">
            O acabamento é oferecido ao lado da etapa do setor de que ele é
            acabamento, e herda a medida dela.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={!name.trim() || !sector}
            onClick={save}
          >
            Criar processo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
