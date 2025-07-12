'use client'

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
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { ConversionPreview } from './ConversionPreview'

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

export function MeasureDefaultsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('MeasureDialog') === 'true') {
      setOpen(true)
    }
  }, [])

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, reset } = form

  // Criar opções dinâmicas a partir das variantes
  const options = {
    length: [],
    weight: [],
    capacity: [],
  }

  const onSubmit = async (data: FormType) => {
    console.log(data)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      // Resetar para valores atuais ao fechar
      reset()
    }
    setOpen(value)
  }

  const isLoading = false

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
          <DialogDescription className="sr-only">
            Configure as unidades de medida padrão que serão usadas nos
            cadastros de produtos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex flex-wrap gap-5">
              <div className="flex-[1_0_190px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex-[1_0_190px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex-[1_0_190px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
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
                  name="capacity"
                  label="Capacidade"
                  width="flex-[1_0_190px]"
                  options={options.capacity}
                />
              </form>
            </Form>
          )}

          {/* Preview das conversões */}
          {!isLoading && process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <ConversionPreview data={form.watch()} />
            </div>
          )}
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
              disabled={isLoading}
              isLoading={form.formState.isSubmitting}
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
