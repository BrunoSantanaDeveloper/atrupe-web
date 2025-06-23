'use client'

// React
import { useState, Fragment } from 'react'

// UI
import { toast } from 'sonner'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
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
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormFileUpload } from '@/components/common/form/FileUpload'
import { ListDataStatusEmpty } from '@/components/common/TableEmptyState'
import { VideoDialog } from '@/app/(app-sidebar)/academy/_components/VideoDialog'

// Icons
import {
  IconBook,
  IconTrash,
  IconVideo,
  IconCirclePlus,
  IconCircleCheck,
  IconFileTextFilled,
} from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

// Actions
import { createItemNew, deleteItemNew, getData } from '@/actions/_cruds'

// Utils
import { cn } from '@/lib/utils'

// Button variants for file types
const buttonVariant: Record<
  string,
  'errorGhost' | 'neutralGhost' | 'successGhost' | 'warningGhost'
> = {
  pdf: 'errorGhost',
  doc: 'neutralGhost',
  docx: 'neutralGhost',
  xls: 'successGhost',
  xlsx: 'successGhost',
  ppt: 'warningGhost',
  other: 'neutralGhost',
}

// Interfaces (baseado na estrutura da AcademyPage)
interface AcademyItem {
  id: string
  type: string[]
  section: string
  description?: string
  order: number
  video?: string
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
  const [selectedPlan, setSelectedPlan] = useState('START')
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false)
  const [isGenerating, setIsGenerating] = useState<string[]>([])
  const [fileFieldsCount, setFileFieldsCount] = useState(1)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string
    title: string
  } | null>(null)
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

  const planSelectOptions = planOptions.map((option) => ({
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
      return createItemNew({
        route: '/academy',
        data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-admin'] })
      refetchAcademy()
    },
  })

  const onSubmit = async (data: FormType) => {
    // Coletar URLs dos arquivos dos campos do formulário
    const filesUrls: string[] = []
    for (let i = 0; i < fileFieldsCount; i++) {
      const fileUrl = form.getValues(`files.${i}` as keyof FormType) as string
      if (fileUrl && fileUrl.trim() !== '') {
        filesUrls.push(fileUrl)
      }
    }

    const formData = {
      ...data,
      files: filesUrls,
    }

    await mutation
      .mutateAsync(formData)
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
      setFileFieldsCount(1)
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
    setFileFieldsCount(fileFieldsCount + 1)
  }

  const removeFileField = (index: number) => {
    // Remover o valor do campo do formulário
    form.setValue(`files.${index}` as keyof FormType, '' as string)

    // Reorganizar os campos restantes
    for (let i = index; i < fileFieldsCount - 1; i++) {
      const nextValue = form.getValues(
        `files.${i + 1}` as keyof FormType,
      ) as string
      form.setValue(`files.${i}` as keyof FormType, nextValue)
    }

    // Limpar o último campo e diminuir o contador
    form.setValue(
      `files.${fileFieldsCount - 1}` as keyof FormType,
      '' as string,
    )
    setFileFieldsCount(Math.max(1, fileFieldsCount - 1))
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
      refetchAcademy()
    } else {
      toast.error(response.message || 'Erro ao excluir item da academy')
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsGenerating([])
  }

  const handleVideoClick = (videoUrl: string, description: string) => {
    setSelectedVideo({ url: videoUrl, title: description })
    setVideoDialogOpen(true)
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
                    {/* Primeira linha - Plano e Seção */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormSelect<FormType>
                          name="type"
                          label="Plano"
                          options={planSelectOptions}
                        />
                      </div>
                      <div
                        className={cn(
                          'grid gap-4',
                          isCreatingNewSection
                            ? 'grid-cols-[1fr_2fr]'
                            : 'grid-cols-1',
                        )}
                      >
                        <FormSelect<FormType>
                          name="section"
                          label="Seção"
                          options={sectionOptions}
                          additionalOnChange={handleSectionChange}
                          disabled={isSectionDisabled}
                        />
                        {/* Campo para nova seção (quando aplicável) */}
                        {isCreatingNewSection && (
                          <FormInput<FormType>
                            name="section"
                            label="Nome da nova seção"
                            placeholder="Digite o nome da nova seção"
                            width="w-full"
                          />
                        )}
                      </div>
                    </div>

                    {/* Terceira linha - Descrição */}
                    <FormTextarea<FormType>
                      name="description"
                      label="Descrição"
                      placeholder="Digite uma descrição"
                      rows={3}
                      width="w-full"
                    />

                    {/* Quarta linha - URL do Vídeo e Ordem */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <FormInput<FormType>
                          name="videoUrl"
                          label="URL do Vídeo"
                          type="url"
                          placeholder="https://vimeo.com/495579294"
                          width="w-full"
                        />
                      </div>
                      <div>
                        <FormInput<FormType>
                          name="order"
                          label="Ordem"
                          type="number"
                          placeholder="1"
                          width="w-full"
                          additionalOnChange={(value) => {
                            const numValue = value ? Number(value) : 0
                            setValue('order', numValue)
                          }}
                        />
                      </div>
                    </div>

                    {/* Quinta linha - Página, Modal e Título do Botão */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput<FormType>
                        name="page"
                        label="Página"
                        placeholder="/cadastros/clientes"
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
                        placeholder="NewClient"
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
                        placeholder="Cadastrar Cliente"
                        width="w-full"
                      />
                    </div>

                    {/* Arquivos */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Arquivos</Label>
                      {Array.from({ length: fileFieldsCount }, (_, index) => (
                        <div key={index} className="flex gap-4 items-end">
                          <div className="flex-1">
                            <FormFileUpload<FormType>
                              control={form.control}
                              name={`files.${index}` as keyof FormType}
                            />
                          </div>
                          {fileFieldsCount > 1 && (
                            <Button
                              type="button"
                              variant="error"
                              size="icon"
                              onClick={() => removeFileField(index)}
                              RightIcon={IconTrash}
                              className="mb-1"
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFileField}
                        LeftIcon={IconCirclePlus}
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
                  <TableHead className="max-w-10">#</TableHead>
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
                        colSpan={7}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {section}
                      </TableCell>
                    </TableRow>
                    {/* Items da seção */}
                    {items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm text-gray">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <p className="truncate">{item.description || '-'}</p>
                        </TableCell>
                        <TableCell>
                          {item.files && item.files.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.files.map((file, index) => {
                                const fileExtension =
                                  file.split('.').pop()?.toLowerCase() ||
                                  'other'

                                return (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant={
                                      buttonVariant[fileExtension] ||
                                      'neutralGhost'
                                    }
                                    size="iconSm"
                                    RightIcon={IconFileTextFilled}
                                    onClick={() => window.open(file, '_blank')}
                                  />
                                )
                              })}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.video ? (
                            <Button
                              type="button"
                              variant="neutralGhost"
                              size="iconSm"
                              onClick={() =>
                                handleVideoClick(
                                  item.video!,
                                  item.description || 'Vídeo',
                                )
                              }
                              RightIcon={IconVideo}
                            />
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
            <ListDataStatusEmpty
              title={`Não há itens no plano ${selectedPlan}.`}
            />
          )}
        </CardContent>
      </Card>

      {selectedVideo && (
        <VideoDialog
          open={videoDialogOpen}
          onOpenChange={setVideoDialogOpen}
          video={selectedVideo.url}
          title={selectedVideo.title}
          description={selectedVideo.title}
        />
      )}
    </div>
  )
}
