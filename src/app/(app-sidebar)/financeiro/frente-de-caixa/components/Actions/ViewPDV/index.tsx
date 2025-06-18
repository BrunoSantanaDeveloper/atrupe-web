'use client'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components

// Icons
import { IconSearch, IconCircleCheck } from '@tabler/icons-react'

// Form Imports
import { schema, defaultValues, type FormType } from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { CheckoutType } from '@/types/financial/checkout'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: CheckoutType
}

export function ViewPDVDialog(props: Props) {
  const { open, setOpen } = props

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit } = form

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      reset(defaultValues)
      setOpen('')
      return
    }
    setOpen('view')
  }

  const onSubmit = (data: FormType) => {
    console.info(props, data)

    handleOpenChange(false)

    toast.success('Sucesso')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[537px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <FeaturedIcon variant="neutralOutline" Icon={IconSearch} />
                  <span>Frente de caixa fechado</span>
                </div>
              </DialogTitle>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody></DialogBody>
            <DialogFooter className="sm:justify-between">
              <div></div>
              <div className="space-x-4">
                <DialogTrigger asChild>
                  <Button type="button" variant="neutralOutline">
                    Voltar
                  </Button>
                </DialogTrigger>
                <Button
                  type="submit"
                  RightIcon={IconCircleCheck}
                  isLoading={false}
                >
                  Reabrir
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
