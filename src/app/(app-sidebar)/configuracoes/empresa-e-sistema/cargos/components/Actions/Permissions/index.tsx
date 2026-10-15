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
import { useForm, type FieldPath } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { permissionsData } from '@/consts/permissions'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

// Lib
import { cn } from '@/lib/utils'
import { DEMO_DATA } from '@/lib/demo'
import { planAllowsUsers } from '@/lib/plans/planAccess'

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

function isExportablePermission(section: string, item: string) {
  return permissionsData.some(
    (permissionSection) =>
      permissionSection.key === section &&
      permissionSection.items.some(
        (permissionItem) =>
          permissionItem.key === item && permissionItem.exportable,
      ),
  )
}

function convertPermissionsArrayToObject(permissions: string[] = []) {
  const permissionsObject: Record<
    string,
    {
      view?: boolean
      edit?: boolean
      create?: boolean
      delete?: boolean
      export?: boolean
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
      case 'export':
        if (isExportablePermission(section, item)) {
          permissionsObject[fieldKey].export = true
        }
        break
    }
  })

  // Regra de negócio: escrever implica ler.
  // Se edit/create/delete estiver presente mas view não, auto-adiciona view=true.
  // Isso corrige permissões salvas antes desta regra existir no frontend,
  // onde o checkbox de view fica disabled quando os outros estão marcados,
  // impedindo o usuário de marcá-lo manualmente.
  Object.values(permissionsObject).forEach((perms) => {
    if ((perms.edit || perms.create || perms.delete) && !perms.view) {
      perms.view = true
    }
  })

  return permissionsObject
}

/**
 * Permissão (seção.item) → recurso do plano que a tela exige; com lista,
 * basta um. A composição dos planos é configurada pelo superadmin.
 */
const PERMISSION_FEATURES: Record<string, string[]> = {
  'financial.cash_control': ['cash_control'],
  'register.credit_limit': ['credit_limit_configuration'],
  'financial_settings.credit_limits': ['credit_limit_configuration'],
  // A Agenda de entrega não pede recurso: abre do Start em diante (PO,
  // 14/10/2026)
  'product_settings.composition': ['product_composition'],
  'invoice.nfse': ['nota_fiscal'],
  'financial.pdv': ['pdv_screen'],
  'financial.checkout': ['pdv_screen'],
  'sale.quotation_result': ['cost_base'],
  'company_settings.sectors': ['sectors_configuration'],
  'sales_settings.rejection_reasons': ['quotation_rejection_reasons'],
  'sales_settings.quotation_status': ['quotation_status_configuration'],
  // Telas do PRO, do ELITE e do FULL
  'cost.base': ['cost_base'],
  'cost.pricing': ['pricing_center'],
  'production.production': ['production_manager'],
  'stock.stock': ['stock_control'],
  'stock.invoice_entry': ['invoice_entry'],
}

/**
 * Permissões de telas que ainda rodam sobre dados de exemplo (DEMO_ROUTES):
 * sem a flag de demonstração elas não aparecem no editor, como em produção
 * hoje, mesmo para quem tem a chave do plano por cortesia ou ajuste de matriz.
 * Cada uma sai desta lista quando a rota dela sair de DEMO_ROUTES.
 */
const DEMO_PERMISSIONS = [
  // A frente de caixa saiu daqui na Fase 7 (API em /financial/pdv)
  'cost.base',
  'cost.pricing',
  'production.production',
  'stock.stock',
  'stock.invoice_entry',
]

export function UserPermissionsDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { hasAnyFeature } = usePlanFeatures()

  // Só aparece a permissão de uma tela que o plano da empresa inclui.
  const _shouldShowPermission = (section: string, item: string) => {
    if (!DEMO_DATA && DEMO_PERMISSIONS.includes(`${section}.${item}`)) {
      return false
    }

    const features = PERMISSION_FEATURES[`${section}.${item}`]
    if (features && !hasAnyFeature(features)) return false

    // -1 (ilimitado) e a chave ausente mostram a permissão; só o limite 0
    // a esconde.
    if (section === 'company_settings' && item === 'users') {
      return planAllowsUsers(session?.company?.plan?.limits)
    }

    // A seção fiscal só aparece com o módulo contratado.
    if (section === 'nota_fiscal') return hasAnyFeature(['nota_fiscal'])

    return true
  }

  const { data: roleData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['role-permissions', rowData?.id],
    queryFn: () =>
      getItemOld({ route: 'roleRoute', id: rowData?.id as string }),
    enabled: !!rowData?.id && open,
    staleTime: 0,
    refetchOnMount: 'always',
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
          {
            view?: boolean
            edit?: boolean
            create?: boolean
            delete?: boolean
            export?: boolean
          }
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
      queryClient.invalidateQueries({
        queryKey: ['role-permissions', rowData?.id],
      })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Permissões salvas')
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
      if (actions.export && isExportablePermission(section, item)) {
        permissions.push(`${section}:${item}:export`)
      }
    })

    await mutation.mutateAsync(permissions)
  }

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setOpen('permissions')
      return
    }
    setOpen('')
    // Reset form with current roleData so it doesn't clear values on reopen
    // A full blank reset would make the cache data stale vs form state
    form.reset({})
  }

  const handleCheckAllColumnInSection = (
    sectionKey: string,
    items: { key: string; name: string; exportable?: boolean }[],
    column: 'view' | 'edit' | 'create' | 'delete' | 'export',
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
        case 'export':
          form.setValue(`${baseKey}.export`, true)
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
                        <TableHead className="w-28">Exporta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      className={cn(isLoadingPermissions && 'opacity-50')}
                    >
                      {permissionsData.map((section) => {
                        const filteredItems = section.items.filter((item) =>
                          _shouldShowPermission(section.key, item.key),
                        )
                        const exportableItems = filteredItems.filter(
                          (item) => item.exportable,
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
                                    checked={
                                      filteredItems.length > 0 &&
                                      filteredItems.every((item) =>
                                        form.watch(
                                          `${section.key}:${item.key}.view` as FieldPath<FormType>,
                                        ),
                                      )
                                    }
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
                                    checked={
                                      filteredItems.length > 0 &&
                                      filteredItems.every((item) =>
                                        form.watch(
                                          `${section.key}:${item.key}.edit` as FieldPath<FormType>,
                                        ),
                                      )
                                    }
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
                                    checked={
                                      filteredItems.length > 0 &&
                                      filteredItems.every((item) =>
                                        form.watch(
                                          `${section.key}:${item.key}.create` as FieldPath<FormType>,
                                        ),
                                      )
                                    }
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
                                    checked={
                                      filteredItems.length > 0 &&
                                      filteredItems.every((item) =>
                                        form.watch(
                                          `${section.key}:${item.key}.delete` as FieldPath<FormType>,
                                        ),
                                      )
                                    }
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
                                <TableCell className="text-center">
                                  {exportableItems.length > 0 ? (
                                    <CheckboxBasic
                                      name={`check-export-${section.key}`}
                                      className="flex-none mx-auto"
                                      checked={exportableItems.every((item) =>
                                        form.watch(
                                          `${section.key}:${item.key}.export` as FieldPath<FormType>,
                                        ),
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleCheckAllColumnInSection(
                                          section.key,
                                          exportableItems,
                                          'export',
                                          checked as boolean,
                                        )
                                      }
                                    />
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
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
                                  <TableCell className="text-center">
                                    {item.exportable ? (
                                      <FormCheckbox<FormType>
                                        name={`${baseKey}.export`}
                                        label=""
                                      />
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
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
