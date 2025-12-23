'use client'

// React
import { useState } from 'react'

// UI
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { toast } from 'sonner'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import {
  IconBriefcase,
  IconSettings,
  IconSearch,
  IconCircleCheck,
} from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { getDataOld, createItemNew } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Service {
  id: string
  name: string
  code?: string
  category?: {
    name: string
    kind: string
  }
  fiscalData?: {
    codigoServico?: string
    aliquotaIss?: number
  }
}

const serviceFiscalSchema = z.object({
  codigoServico: z.string().optional(),
  aliquotaIss: z.coerce.number().min(0).max(100).optional(),
  discriminacao: z.string().optional(),
})

type ServiceFiscalFormType = z.infer<typeof serviceFiscalSchema>

const codigoServicoOptions = [
  { value: '01.01', label: '01.01 - Análise e desenvolvimento de sistemas' },
  { value: '01.02', label: '01.02 - Programação' },
  { value: '01.03', label: '01.03 - Processamento de dados' },
  { value: '01.04', label: '01.04 - Elaboração de programas' },
  { value: '01.05', label: '01.05 - Licenciamento de software' },
  { value: '01.06', label: '01.06 - Assessoria em informática' },
  { value: '01.07', label: '01.07 - Planejamento de TI' },
  { value: '01.08', label: '01.08 - Suporte técnico em informática' },
  { value: '07.02', label: '07.02 - Consultoria' },
  { value: '07.03', label: '07.03 - Assessoria' },
  { value: '17.01', label: '17.01 - Assessoria ou consultoria' },
  { value: '17.02', label: '17.02 - Análise de projetos' },
  { value: '17.03', label: '17.03 - Planejamento organizacional' },
  { value: '17.04', label: '17.04 - Recrutamento e seleção' },
  { value: '17.05', label: '17.05 - Treinamento e avaliação' },
  { value: '17.06', label: '17.06 - Gestão de recursos humanos' },
]

async function fetchServices(search: string) {
  try {
    // Fetch products with SERVICE category
    const response = await getDataOld({
      route: `/product?search=${search}&limit=50&categoryKind=SERVICE`,
    })
    return response?.data || response || []
  } catch (error) {
    return []
  }
}

async function fetchServiceFiscalData(productId: string) {
  try {
    const response = await getDataOld({
      route: `/fiscal/product/${productId}`,
    })
    return response || null
  } catch (error) {
    return null
  }
}

export function ServicosFiscaisClient() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-fiscal', search],
    queryFn: () => fetchServices(search),
  })

  const { data: fiscalData, isLoading: isLoadingFiscal } = useQuery({
    queryKey: ['service-fiscal-data', selectedService?.id],
    queryFn: () =>
      selectedService ? fetchServiceFiscalData(selectedService.id) : null,
    enabled: !!selectedService && dialogOpen,
  })

  const form = useForm<ServiceFiscalFormType>({
    resolver: zodResolver(serviceFiscalSchema),
    defaultValues: {
      codigoServico: '',
      aliquotaIss: undefined,
      discriminacao: '',
    },
  })

  function handleConfigureFiscal(service: Service) {
    setSelectedService(service)
    setDialogOpen(true)
    // Reset form when opening dialog
    form.reset({
      codigoServico: fiscalData?.codigoServico || '',
      aliquotaIss: fiscalData?.aliquotaIss || undefined,
      discriminacao: fiscalData?.discriminacao || '',
    })
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setSelectedService(null)
      form.reset()
    }
  }

  // Update form when fiscal data loads
  if (dialogOpen && selectedService && fiscalData && !form.formState.isDirty) {
    form.reset({
      codigoServico: fiscalData.codigoServico || '',
      aliquotaIss: fiscalData.aliquotaIss || undefined,
      discriminacao: fiscalData.discriminacao || '',
    })
  }

  async function onSubmit(data: ServiceFiscalFormType) {
    if (!selectedService) return

    try {
      const result = await createItemNew({
        route: '/fiscal/product/upsert',
        data: { ...data, productId: selectedService.id },
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao salvar dados fiscais')
        return
      }

      toast.success('Dados fiscais salvos com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['service-fiscal-data', selectedService.id],
      })
      queryClient.invalidateQueries({ queryKey: ['services-fiscal'] })
      handleDialogClose(false)
    } catch (error) {
      toast.error('Erro ao salvar dados fiscais')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FeaturedIcon variant="outline" Icon={IconBriefcase} />
        <div>
          <h2 className="text-lg font-semibold">Lista de Serviços</h2>
          <p className="text-sm text-gray-500">
            Configure os dados fiscais dos seus serviços para emissão de NFS-e
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando serviços...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 gap-2">
            <p className="text-gray-500">Nenhum serviço encontrado</p>
            <p className="text-sm text-gray-400">
              Serviços são produtos cadastrados em categorias do tipo
              &quot;Serviço&quot;
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cód. Serviço</TableHead>
                <TableHead>Alíquota ISS</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service: Service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.code || '-'}</TableCell>
                  <TableCell>{service.category?.name || '-'}</TableCell>
                  <TableCell>
                    {service.fiscalData?.codigoServico || '-'}
                  </TableCell>
                  <TableCell>
                    {service.fiscalData?.aliquotaIss
                      ? `${service.fiscalData.aliquotaIss}%`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {service.fiscalData?.codigoServico ? (
                      <Badge variant="success">Configurado</Badge>
                    ) : (
                      <Badge variant="warning">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="neutralOutline"
                      size="sm"
                      onClick={() => handleConfigureFiscal(service)}
                    >
                      <IconSettings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h4 className="font-medium text-blue-900 mb-2">Dados Fiscais NFS-e</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            <strong>Código do Serviço</strong> - Classificação do serviço
            conforme lista de serviços (LC 116/03).
          </li>
          <li>
            <strong>Alíquota ISS</strong> - Percentual do ISS a ser destacado na
            NFS-e.
          </li>
          <li>
            O código do serviço pode variar conforme a legislação municipal.
          </li>
          <li>
            Serviços sem código configurado aparecerão como{' '}
            <Badge variant="warning" className="inline">
              Pendente
            </Badge>
            .
          </li>
        </ul>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconBriefcase} />
                <span>Dados Fiscais do Serviço</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            {isLoadingFiscal ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : (
              <Form {...form}>
                <form
                  id="service-fiscal-data"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serviço</label>
                    <Input
                      value={selectedService?.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <FormSelect
                    name="codigoServico"
                    label="Código do Serviço"
                    options={codigoServicoOptions}
                    placeholder="Selecione o código do serviço"
                  />

                  <FormInput
                    name="aliquotaIss"
                    label="Alíquota ISS (%)"
                    type="number"
                    placeholder="0.00"
                  />

                  <FormInput
                    name="discriminacao"
                    label="Discriminação do Serviço"
                    placeholder="Descrição detalhada do serviço prestado"
                  />
                </form>
              </Form>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleDialogClose(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="service-fiscal-data"
              RightIcon={IconCircleCheck}
              disabled={form.formState?.isSubmitting}
              isLoading={form.formState?.isSubmitting}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
