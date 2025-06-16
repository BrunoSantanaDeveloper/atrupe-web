'use client'

// React
import { useState, Fragment } from 'react'

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
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormRadio } from '@/components/common/form/FormRadio'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

// Icons
import {
  IconBook,
  IconTrash,
  IconCirclePlus,
  IconCircleCheck,
} from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

// Actions
import { createItemNew, deleteItemNew, getData } from '@/actions/_cruds'
import { Topbar } from '@/components/common/Topbar'

// Interfaces (baseado na estrutura da AcademyPage)
interface AcademyItem {
  id: string
  type: string[]
  section: string
  description?: string
  order: number
  videoUrl?: string
  page?: string
  modal?: string
  buttonTitle?: string
  files?: string[]
  checked?: boolean
}

interface AcademySection {
  title: string
  items: AcademyItem[]
}

interface AcademyData {
  plan: string
  sections: AcademySection[]
}

export default function AddAcademyPage() {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<string[]>([''])
  const [selectedPlan, setSelectedPlan] = useState('START')
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false)
  const [isGenerating, setIsGenerating] = useState<string[]>([])
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, reset, watch, setValue } = form

  // Observar os campos para lógica de exclusividade
  const pageValue = watch('page')
  const modalValue = watch('modal')

  const planOptions = [
    { value: 'START', label: 'Start' },
    { value: 'LITE', label: 'Lite' },
    { value: 'PRO', label: 'Pro' },
    { value: 'ELITE', label: 'Elite' },
    { value: 'FULL', label: 'Full' },
  ]

  const planRadioItems = planOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  // Query para buscar dados da academy de todos os planos
  const planQueries = useQuery({
    queryKey: ['academy-all-plans'],
    queryFn: async () => {
      const promises = planOptions.map(async (plan) => {
        const response = await getData({
          route: `/academy/${plan.value.toLowerCase()}`,
        })
        return { plan: plan.value, data: response?.data }
      })
      return Promise.all(promises)
    },
    staleTime: 5 * 60 * 1000,
  })

  // Query para buscar dados da academy do plano selecionado na tabela
  const {
    data: academyResponse,
    isLoading: isLoadingAcademy,
    refetch: refetchAcademy,
  } = useQuery({
    queryKey: ['academy-admin', selectedPlan],
    queryFn: () => getData({ route: `/academy/${selectedPlan.toLowerCase()}` }),
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation({
    mutationFn: (data: FormType) => {
      // Filtrar arquivos vazios antes de enviar
      const filteredData = {
        ...data,
        files: files.filter((file) => file.trim() !== ''),
      }
      return createItemNew({
        route: '/academy',
        data: filteredData,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-admin'] })
      refetchAcademy()
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation
      .mutateAsync(data)
      .then(() => {
        toast.success('Item da academy criado com sucesso!')
        handleOpenChange(false)
      })
      .catch((err) => {
        toast.error(err.message || 'Erro ao criar item da academy')
      })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
    if (!openDialog) {
      reset(defaultValues)
      setFiles([''])
      setIsCreatingNewSection(false)
    }
  }

  const handleSectionChange = (value: string) => {
    if (value === '__new__') {
      setIsCreatingNewSection(true)
      setValue('section', '')
    } else {
      setIsCreatingNewSection(false)
      setValue('section', value)
    }
  }

  const addFileField = () => {
    setFiles([...files, ''])
  }

  const removeFileField = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles.length === 0 ? [''] : newFiles)
  }

  const updateFileField = (index: number, value: string) => {
    const newFiles = [...files]
    newFiles[index] = value
    setFiles(newFiles)
  }

  const academyData: AcademyData = academyResponse?.data
  const allPlansData = planQueries.data || []

  // Extrair seções existentes baseadas nos planos selecionados no formulário
  const typeValue = watch('type') || []
  const selectedPlans = Array.isArray(typeValue)
    ? typeValue
    : [typeValue].filter(Boolean)
  const existingSections = new Set<string>()

  if (selectedPlans.length > 0) {
    selectedPlans.forEach((selectedPlan) => {
      const planData = allPlansData.find((p) => p.plan === selectedPlan)?.data
      if (planData?.sections) {
        planData.sections.forEach((section: AcademySection) => {
          existingSections.add(section.title)
        })
      }
    })
  }

  const sectionOptions = [
    ...Array.from(existingSections).map((section) => ({
      value: section,
      label: section,
    })),
    { value: '__new__', label: '+ Criar nova seção' },
  ]

  const isSectionDisabled = selectedPlans.length === 0

  // Organizar items por seção
  const itemsBySection: { [key: string]: AcademyItem[] } = {}

  if (academyData?.sections) {
    academyData.sections.forEach((section) => {
      if (section.items && section.items.length > 0) {
        itemsBySection[section.title] = section.items.sort(
          (a, b) => a.order - b.order,
        )
      }
    })
  }

  const handleDeleteItem = async (id: string) => {
    setIsGenerating([...isGenerating, id])
    const response = await deleteItemNew({
      route: `/academy/${id}`,
    })

    if (response.success) {
      toast.success('Item da academy excluído com sucesso!')
    } else {
      toast.error(response.message || 'Erro ao excluir item da academy')
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsGenerating([])
  }

  return (
    <div className="space-y-6">
      <Topbar
        title="Academy"
        primaryCta={
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" LeftIcon={IconCirclePlus}>
                Novo Item Academy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Adicionar Item da Academy</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Form {...form}>
                  <form
                    id="academy-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                  >
                    {/* Primeira linha - Planos */}
                    <div className="space-y-2">
                      <FormRadio<FormType>
                        name="type"
                        label="Plano *"
                        items={planRadioItems}
                        className="space-y-2"
                      />
                      {form.formState.errors.type && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.type.message}
                        </p>
                      )}
                    </div>

                    {/* Segunda linha - Seção e Ordem */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3">
                        <FormSelect<FormType>
                          name="section"
                          label="Seção *"
                          options={sectionOptions}
                          additionalOnChange={handleSectionChange}
                          disabled={isSectionDisabled}
                        />
                      </div>
                      {/* <div>
                        <FormInput<FormType>
                          name="order"
                          label="Ordem *"
                          type="number"
                          placeholder="0"
                          width="w-full"
                          additionalOnChange={(value) => {
                            const numValue = value ? Number(value) : 0
                            setValue('order', numValue)
                          }}
                        />
                      </div> */}
                    </div>

                    {/* Campo para nova seção (quando aplicável) */}
                    {isCreatingNewSection && (
                      <FormInput<FormType>
                        name="section"
                        label="Nome da nova seção *"
                        placeholder="Digite o nome da nova seção"
                        width="w-full"
                      />
                    )}

                    {/* Terceira linha - Descrição */}
                    <FormTextarea<FormType>
                      name="description"
                      label="Descrição"
                      placeholder="Digite uma descrição (opcional)"
                      rows={3}
                      width="w-full"
                    />

                    {/* Quarta linha - URL do Vídeo */}
                    <FormInput<FormType>
                      name="videoUrl"
                      label="URL do Vídeo"
                      type="url"
                      placeholder="https://exemplo.com/video (opcional)"
                      width="w-full"
                    />

                    {/* Quinta linha - Página, Modal e Título do Botão */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput<FormType>
                        name="page"
                        label="Página"
                        placeholder="Nome da página (opcional)"
                        width="w-full"
                        disabled={!!modalValue}
                        additionalOnChange={(value) => {
                          if (value && modalValue) {
                            setValue('modal', '')
                          }
                        }}
                      />
                      <FormInput<FormType>
                        name="modal"
                        label="Modal"
                        placeholder="Nome do modal (opcional)"
                        width="w-full"
                        disabled={!!pageValue}
                        additionalOnChange={(value) => {
                          if (value && pageValue) {
                            setValue('page', '')
                          }
                        }}
                      />
                      <FormInput<FormType>
                        name="buttonTitle"
                        label="Título do Botão"
                        placeholder="Texto do botão (opcional)"
                        width="w-full"
                      />
                    </div>

                    {/* Arquivos */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Arquivos</Label>
                      {files.map((file, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={file}
                            onChange={(e) =>
                              updateFileField(index, e.target.value)
                            }
                            placeholder="URL ou caminho do arquivo"
                            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <Button
                            type="button"
                            variant="error"
                            size="icon"
                            onClick={() => removeFileField(index)}
                            RightIcon={IconTrash}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFileField}
                      >
                        Adicionar Arquivo
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogBody>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button type="button" variant="neutralOutline">
                    Cancelar
                  </Button>
                </DialogTrigger>
                <Button
                  type="submit"
                  form="academy-form"
                  isLoading={mutation.isPending}
                  RightIcon={IconCircleCheck}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconBook className="size-5" />
            Aulas Cadastradas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="plan-select" className="text-sm font-medium">
              Plano:
            </Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger id="plan-select" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAcademy ? (
            <TableSkeleton cols={5} />
          ) : Object.keys(itemsBySection).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Descrição</TableHead>
                  <TableHead>Arquivos</TableHead>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Modal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(itemsBySection).map(([section, items]) => (
                  <Fragment key={section}>
                    {/* Header da seção */}
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {section}
                      </TableCell>
                    </TableRow>
                    {/* Items da seção */}
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-xs">
                          <p className="truncate">{item.description || '-'}</p>
                        </TableCell>
                        <TableCell>
                          {item.files && item.files.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {item.files.map((file, index) => (
                                <a
                                  key={index}
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs underline truncate"
                                >
                                  Arquivo {index + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.videoUrl ? (
                            <a
                              href={item.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              Ver vídeo
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.page ? (
                            <span className="text-xs text-gray-600">
                              {item.page}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.modal ? (
                            <span className="text-xs text-gray-600">
                              {item.modal}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="errorGhost"
                            size="icon"
                            RightIcon={IconTrash}
                            isLoading={isGenerating.includes(item.id)}
                            onClick={() => handleDeleteItem(item.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          ) : (
            <FilteredDataEmpty
              title="Nenhum item encontrado"
              description={`Não há itens cadastrados para o plano ${selectedPlan}.`}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
