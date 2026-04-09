'use client'

// React
import { Fragment, useEffect } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
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
import {
  FormCheckbox,
  CheckboxBasic,
} from '@/components/common/form/FormCheckbox'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconShieldLock, IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { permissionsData } from '@/consts/permissions'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

// Lib
import { cn } from '@/lib/utils'

// Types
import type { RoleType } from '@/types/settings/role'
import type { SearchParamsType } from '@/types/coreTypes'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useSession } from 'next-auth/react'

// Actions
import { updateItem, getItemOld } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: RoleType
}

function convertPermissionsArrayToObject(permissions: string[] = []) {
  const permissionsObject: Record<
    string,
    {
      view?: boolean
      edit?: boolean
      create?: boolean
      delete?: boolean
    }
  > = {}

  permissions.forEach((permission) => {
    const [section, item, action] = permission.split(':')
    const fieldKey = `${section}:${item}`

    if (!permissionsObject[fieldKey]) {
      permissionsObject[fieldKey] = {}
    }

    switch (action) {
      case 'view':
        permissionsObject[fieldKey].view = true
        break
      case 'edit':
        permissionsObject[fieldKey].edit = true
        break
      case 'create':
        permissionsObject[fieldKey].create = true
        break
      case 'delete':
        permissionsObject[fieldKey].delete = true
        break
    }
  })

  return permissionsObject
}

export function UserPermissionsDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const {
    hasFeature,
    hasFinancialModule,
    canManageClients,
    canManageSuppliers,
    canManageProducts,
    canManageDeliverySchedule,
    canManageSectors,
    canManageRejectionReasons,
    canManageBudgetStatus,
    canManageSalesOrders,
  } = usePlanFeatures()

  // Função para obter limite de usuários da sessão
  const getUserLimit = () => session?.company?.plan?.limits?.max_users || 0

  const _shouldShowPermission = (section: string, item: string) => {
    // Verifica permissões do módulo financeiro
    if (section === 'financial') {
      if (item === 'payable') return hasFinancialModule('payable')
      if (item === 'receivable') return hasFinancialModule('receivable')
      if (item === 'cash_control') return hasFinancialModule('cash')
      if (item === 'checkout') return hasFinancialModule('pdv')
      if (item === 'credit_limit') return false // Temporariamente desabilitado até implementação do plano full
    }

    // Verifica permissões de cadastros
    if (section === 'register') {
      if (item === 'client') {
        return canManageClients()
      }
      if (item === 'supplier') {
        return canManageSuppliers()
      }
      if (item === 'credit_limit') return false // Temporariamente desabilitado até implementação do plano full
    }

    // Verifica permissões de configurações financeiras
    if (section === 'financial_settings') {
      if (item === 'credit_limits') return false // Temporariamente desabilitado até implementação do plano full
    }

    // Verifica permissões de produtos
    if (section === 'product_settings') {
      return canManageProducts()
    }

    // Verifica permissões de produção
    if (section === 'production') {
      if (item === 'delivery_schedule') {
        // Agenda de entrega só disponível no plano full
        return canManageDeliverySchedule()
      }
    }

    // Verifica permissões de empresa e sistema
    if (section === 'company_settings') {
      if (item === 'measurement_standards') return canManageSectors()
      if (item === 'users') return getUserLimit() > 0
    }

    // Verifica permissões de vendas
    if (section === 'sales_settings') {
      if (item === 'rejection_reasons') {
        // Motivos de rejeição só disponível no plano full
        return canManageRejectionReasons()
      }
      if (item === 'quotation_status') {
        // Status de orçamento só disponível no plano full
        return canManageBudgetStatus()
      }
      if (item === 'series') {
        return canManageSalesOrders()
      }
    }

    // Verifica permissões de venda
    if (section === 'sale') {
      if (item === 'quick') {
        // Venda rápida só disponível no plano full
        return canManageSalesOrders()
      }
      if (item === 'quotation') {
        return canManageBudgetStatus()
      }
      if (item === 'order') {
        return canManageSalesOrders()
      }
    }

    // Fiscal section only shown if company has contracted the module
    if (section === 'nota_fiscal') {
      return hasFeature('nota_fiscal')
    }

    return true
  }

  const { data: roleData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['role-permissions', rowData?.id],
    queryFn: () =>
      getItemOld({ route: 'roleRoute', id: rowData?.id as string }),
    enabled: !!rowData?.id && open,
  })

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: convertPermissionsArrayToObject(roleData?.permissions || []),
  })

  // Atualizar o formulário quando os dados forem carregados
  useEffect(() => {
    if (roleData?.permissions) {
      form.reset(convertPermissionsArrayToObject(roleData.permissions))
    }
  }, [roleData, form])

  // Monitorar mudanças nas permissões e aplicar as dependências
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (!name || type !== 'change') return

      const [section, item, action] = name.split('.')
      const baseKey = `${section}.${item}`

      const formValue = value as Record<
        string,
        Record<
          string,
          { view?: boolean; edit?: boolean; create?: boolean; delete?: boolean }
        >
      >

      if (action === 'edit' && formValue[section]?.[item]?.edit) {
        // Se edita está marcado, visualiza deve estar marcado
        form.setValue(`${baseKey}.view`, true)
      } else if (action === 'create' && formValue[section]?.[item]?.create) {
        // Se cria está marcado, visualiza deve estar marcado
        form.setValue(`${baseKey}.view`, true)
      } else if (action === 'delete' && formValue[section]?.[item]?.delete) {
        // Se exclui está marcado, visualiza deve estar marcado
        form.setValue(`${baseKey}.view`, true)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  const { handleSubmit } = form

  const mutation = useMutation({
    mutationFn: (data: string[]) =>
      updateItem('roleRoute', `${rowData?.id}`, { permissions: data }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Permissões salvas!')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    const permissions: string[] = []

    Object.entries(data || {}).forEach(([fieldKey, actions]) => {
      const [section, item] = fieldKey.split(':')

      if (actions.view) permissions.push(`${section}:${item}:view`)
      if (actions.edit) permissions.push(`${section}:${item}:edit`)
      if (actions.create) permissions.push(`${section}:${item}:create`)
      if (actions.delete) permissions.push(`${section}:${item}:delete`)
    })

    await mutation.mutateAsync(permissions)
  }

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setOpen('permissions')
      return
    }
    setOpen('')
    form.reset()
  }

  const handleCheckAllColumnInSection = (
    sectionKey: string,
    items: { key: string; name: string }[],
    column: 'view' | 'edit' | 'create' | 'delete',
    checked: boolean,
  ) => {
    items.forEach((item) => {
      const baseKey = `${sectionKey}:${item.key}`

      // Se estiver desmarcando, apenas desmarca a coluna específica
      if (!checked) {
        // Não permitir desmarcar "view" se houver outras permissões
        if (column === 'view') {
          const hasOtherPermissions =
            form.watch(`${baseKey}.edit`) ||
            form.watch(`${baseKey}.create`) ||
            form.watch(`${baseKey}.delete`)

          if (hasOtherPermissions) return
        }
        form.setValue(`${baseKey}.${column}`, false)
        return
      }

      // Se estiver marcando, aplica as regras de dependência
      switch (column) {
        case 'view':
          form.setValue(`${baseKey}.view`, true)
          break
        case 'edit':
          form.setValue(`${baseKey}.view`, true)
          form.setValue(`${baseKey}.edit`, true)
          break
        case 'create':
          form.setValue(`${baseKey}.view`, true)
          form.setValue(`${baseKey}.edit`, true)
          form.setValue(`${baseKey}.create`, true)
          break
        case 'delete':
          form.setValue(`${baseKey}.view`, true)
          form.setValue(`${baseKey}.edit`, true)
          form.setValue(`${baseKey}.create`, true)
          form.setValue(`${baseKey}.delete`, true)
          break
      }
    })
  }

  return (
    <PermissionGate permissions={['company_settings:roles:edit']}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconShieldLock} />
                <span>Permissões do cargo {rowData?.name || ''}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="edit-permissions"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="bg-white border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Módulo</TableHead>
                        <TableHead className="w-28">Visualiza</TableHead>
                        <TableHead className="w-28">Edita</TableHead>
                        <TableHead className="w-28">Cria</TableHead>
                        <TableHead className="w-28">Exclui</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      className={cn(isLoadingPermissions && 'opacity-50')}
                    >
                      {permissionsData.map((section) => {
                        const filteredItems = section.items.filter((item) =>
                          _shouldShowPermission(section.key, item.key),
                        )

                        // Se não houver itens na seção após o filtro, não exibe a seção
                        if (filteredItems.length === 0) return null

                        return (
                          <Fragment key={section.key}>
                            {section.key !== 'values' && (
                              <TableRow className="bg-gray-100">
                                <TableCell className="text-gray-700 font-medium text-xs">
                                  {section.section}
                                </TableCell>
                                <TableCell className="text-center">
                                  <CheckboxBasic
                                    name={`check-view-${section.key}`}
                                    className="flex-none mx-auto"
                                    onCheckedChange={(checked) =>
                                      handleCheckAllColumnInSection(
                                        section.key,
                                        filteredItems,
                                        'view',
                                        checked as boolean,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <CheckboxBasic
                                    name={`check-edit-${section.key}`}
                                    className="flex-none mx-auto"
                                    onCheckedChange={(checked) =>
                                      handleCheckAllColumnInSection(
                                        section.key,
                                        filteredItems,
                                        'edit',
                                        checked as boolean,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <CheckboxBasic
                                    name={`check-create-${section.key}`}
                                    className="flex-none mx-auto"
                                    onCheckedChange={(checked) =>
                                      handleCheckAllColumnInSection(
                                        section.key,
                                        filteredItems,
                                        'create',
                                        checked as boolean,
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <CheckboxBasic
                                    name={`check-delete-${section.key}`}
                                    className="flex-none mx-auto"
                                    onCheckedChange={(checked) =>
                                      handleCheckAllColumnInSection(
                                        section.key,
                                        filteredItems,
                                        'delete',
                                        checked as boolean,
                                      )
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            {filteredItems.map((item) => {
                              const baseKey = `${section.key}:${item.key}`
                              const hasOtherPermissions =
                                form.watch(`${baseKey}.edit`) ||
                                form.watch(`${baseKey}.create`) ||
                                form.watch(`${baseKey}.delete`)

                              return (
                                <TableRow key={baseKey}>
                                  <TableCell className="font-medium">
                                    {item.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <FormCheckbox<FormType>
                                      name={`${baseKey}.view`}
                                      label=""
                                      disabled={hasOtherPermissions}
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <FormCheckbox<FormType>
                                      name={`${baseKey}.edit`}
                                      label=""
                                      onChange={(checked) => {
                                        if (checked) {
                                          form.setValue(`${baseKey}.view`, true)
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <FormCheckbox<FormType>
                                      name={`${baseKey}.create`}
                                      label=""
                                      onChange={(checked) => {
                                        if (checked) {
                                          form.setValue(`${baseKey}.view`, true)
                                          form.setValue(`${baseKey}.edit`, true)
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <FormCheckbox<FormType>
                                      name={`${baseKey}.delete`}
                                      label=""
                                      onChange={(checked) => {
                                        if (checked) {
                                          form.setValue(`${baseKey}.view`, true)
                                          form.setValue(`${baseKey}.edit`, true)
                                          form.setValue(
                                            `${baseKey}.create`,
                                            true,
                                          )
                                        }
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </form>
            </Form>
          </DialogBody>

          <DialogFooter className="sm:justify-between">
            <div> </div>
            <div className="space-x-4">
              <DialogTrigger asChild>
                <Button type="button" variant="neutralOutline">
                  Cancelar
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                form="edit-permissions"
                isLoading={mutation.isPending || isLoadingPermissions}
                RightIcon={IconCircleCheck}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
