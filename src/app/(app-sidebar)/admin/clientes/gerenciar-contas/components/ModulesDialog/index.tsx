'use client'

// React
import { useState, useEffect } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

// Actions
import { updateItem, getData } from '@/actions/_cruds'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import { IconStack2 } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

interface Module {
  id: string
  name: string
  category: string
  enabled: boolean
}

interface ModulesByCategory {
  [category: string]: Module[]
}

export function ModulesDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const [modules, setModules] = useState<ModulesByCategory>({})

  const { data: modulesData, isLoading } = useQuery({
    enabled: open && !!rowData?.id,
    queryKey: ['client-modules', rowData?.id],
    queryFn: () =>
      getData({
        route: `/subscriptions/active-clients/${rowData?.id}/modules`,
      }),
  })

  useEffect(() => {
    if (modulesData?.data) {
      setModules(modulesData.data)
    }
  }, [modulesData])

  const mutation = useMutation({
    mutationFn: (data: { modules: ModulesByCategory }) =>
      updateItem(
        '/subscriptions/active-clients',
        `${rowData?.id}/modules`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['client-modules', rowData?.id],
      })
      toast.success('Módulos atualizados com sucesso')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro ao atualizar os módulos')
    },
  })

  const handleToggleModule = (category: string, moduleId: string) => {
    const updatedModules = { ...modules }
    const moduleIndex = updatedModules[category].findIndex(
      (m) => m.id === moduleId,
    )

    if (moduleIndex !== -1) {
      updatedModules[category][moduleIndex].enabled =
        !updatedModules[category][moduleIndex].enabled

      setModules(updatedModules)

      // Auto-save on toggle
      mutation.mutate({ modules: updatedModules })
    }
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
  }

  const categoryLabels: { [key: string]: string } = {
    'cost-management': 'Gestão de custos',
    'fiscal-note': 'Nota fiscal',
    'production-manager': 'Gerenciador de produção',
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[740px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconStack2} />
              <span>Módulos</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(modules).map(([category, categoryModules]) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="font-semibold text-sm mb-4">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="space-y-4">
                    {categoryModules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between"
                      >
                        <Label
                          htmlFor={module.id}
                          className="text-sm font-normal text-gray-700 cursor-pointer"
                        >
                          {module.name}
                        </Label>
                        <Switch
                          id={module.id}
                          checked={module.enabled}
                          onCheckedChange={() =>
                            handleToggleModule(category, module.id)
                          }
                          disabled={mutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(modules).length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum módulo disponível
                </div>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
