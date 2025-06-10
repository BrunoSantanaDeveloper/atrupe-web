'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
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
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import {
  IconRuler2,
  IconArrowRight,
  IconCircleCheck,
} from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

const options = {
  length: [
    { label: 'Metros (m)', value: 'MT' },
    { label: 'Centímetros (cm)', value: 'CM' },
    { label: 'Milímetros (mm)', value: 'MM' },
  ],
  weight: [
    { label: 'Quilogramas (kg)', value: 'KG' },
    { label: 'Gramas (g)', value: 'GR' },
    { label: 'Miligramas (mg)', value: 'MG' },
  ],
  volume: [
    { label: 'Litros (l)', value: 'LT' },
    { label: 'Mililitros (ml)', value: 'ML' },
  ],
}

export function MeasureDefaultsDialog() {
  const [open, setOpen] = useState(false)

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('measureDefaultsRoute', '', data),
    onSuccess: () => {
      toast.success('Sucesso!')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    handleOpenChange(false) // TODO : remove this
    return

    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset(defaultValues)
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" RightIcon={IconArrowRight}>
          Configurar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[886px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconRuler2} />
              <span>Padrões de medida</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="measure-defaults"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormSelect<FormType>
                name="length"
                label="Comprimento"
                width="flex-[1_0_190px]"
                options={options.length}
              />
              <FormSelect<FormType>
                name="weight"
                label="Peso"
                width="flex-[1_0_190px]"
                options={options.weight}
              />
              <FormSelect<FormType>
                name="volume"
                label="Capacidade"
                width="flex-[1_0_190px]"
                options={options.volume}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div></div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="measure-defaults"
              isLoading={mutation.isPending}
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
