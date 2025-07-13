'use client'

// React
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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

// Hooks
import { useUnitOfMeasureComplete } from '@/hooks/queries/useUnitOfMeasureDefaults'
import { useUpdateUnitDefaults } from '@/hooks/queries/useUpdateUnitDefaults'

export function MeasureDefaultsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('MeasureDialog') === 'true') {
      setOpen(true)
    }
  }, [])

  // Query otimizada que busca todas as informações de uma só vez
  const { data: unitData, isLoading } = useUnitOfMeasureComplete()

  // Mutation
  const updateMutation = useUpdateUnitDefaults()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, reset } = form

  // Atualizar formulário quando dados carregarem
  useEffect(() => {
    if (unitData?.companyDefaults) {
      reset({
        length: unitData.companyDefaults.LENGTH,
        weight: unitData.companyDefaults.WEIGHT,
        capacity: unitData.companyDefaults.CAPACITY,
      })
    }
  }, [unitData, reset])

  // Preparar opções para selects
  const options = {
    length:
      unitData?.lengthVariants?.map((variant) => ({
        value: variant.code,
        label: `${variant.name} (${variant.code})`,
      })) || [],
    weight:
      unitData?.weightVariants?.map((variant) => ({
        value: variant.code,
        label: `${variant.name} (${variant.code})`,
      })) || [],
    capacity:
      unitData?.capacityVariants?.map((variant) => ({
        value: variant.code,
        label: `${variant.name} (${variant.code})`,
      })) || [],
  }

  const onSubmit = async (data: FormType) => {
    try {
      // Atualizar todas as unidades em paralelo
      await Promise.all([
        updateMutation.mutateAsync({
          kind: 'LENGTH',
          defaultVariant: data.length,
        }),
        updateMutation.mutateAsync({
          kind: 'WEIGHT',
          defaultVariant: data.weight,
        }),
        updateMutation.mutateAsync({
          kind: 'CAPACITY',
          defaultVariant: data.capacity,
        }),
      ])

      toast.success('Padrões de medida atualizados com sucesso!')
      setOpen(false)
    } catch (error) {
      console.error('Erro ao salvar padrões:', error)
      toast.error('Erro ao salvar padrões de medida. Tente novamente.')
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      // Resetar para valores atuais ao fechar
      if (unitData?.companyDefaults) {
        reset({
          length: unitData.companyDefaults.LENGTH,
          weight: unitData.companyDefaults.WEIGHT,
          capacity: unitData.companyDefaults.CAPACITY,
        })
      }
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
          <DialogDescription className="sr-only">
            Configure as unidades de medida padrão que serão usadas nos
            cadastros de produtos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex flex-wrap gap-5">
              <div className="flex-[1_0_190px] space-y-2">
                <Skeleton className="bg-gray-300 h-4 w-20" />
                <Skeleton className="bg-gray-300 h-10 w-full" />
              </div>
              <div className="flex-[1_0_190px] space-y-2">
                <Skeleton className="bg-gray-300 h-4 w-20" />
                <Skeleton className="bg-gray-300 h-10 w-full" />
              </div>
              <div className="flex-[1_0_190px] space-y-2">
                <Skeleton className="bg-gray-300 h-4 w-20" />
                <Skeleton className="bg-gray-300 h-10 w-full" />
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
              isLoading={updateMutation.isPending}
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
