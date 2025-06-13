'use client'

// React
import { Fragment, useEffect, useState } from 'react'

// Components
import { NewCategoryDialog } from './NewCategoryDialog'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { NewSubcategoryDialog } from './Actions/NewSubcategoryDialog'
import { EditSubcategoryDialog } from './Actions/EditSubcategoryDialog'

// UI
import { CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Table, TableRow, TableBody, TableCell } from '@/components/ui/table'

// Types
import type {
  NatureType,
  SubCategoryType,
  AccountsPlanDataType,
} from '@/types/settings/accountsPlan'
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPencil, IconSquarePlus } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function TableData({ tabs, searchParams }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [categoryRowData, setCategoryRowData] = useState<NatureType>()
  const [subCategoryRowData, setSubCategoryRowData] =
    useState<SubCategoryType>()
  const [combinedCode, setCombinedCode] = useState('')

  // Limpar dados dos modais ao fechar
  useEffect(() => {
    if (openDialog === '') {
      setCategoryRowData(undefined)
      setSubCategoryRowData(undefined)
    }
  }, [openDialog])

  // Verificando por "inativos" pois searchParams?.status pode não existir se for "ativos"
  const isInactiveTab = searchParams?.status === 'inativos'

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['accounts-plan-list', searchParams],
    queryFn: () =>
      getDataOld({ route: 'accountsPlanRoute', filters, perPage: '9999' }),
  })

  const accountsPlanArray: AccountsPlanDataType[] = data?.data || []
  // const hasData = accountsPlanArray.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={3} />
        ) : (
          <>
            <Table>
              <TableBody>
                {accountsPlanArray.map((accountPlan, index) => (
                  <Fragment key={accountPlan.code + index}>
                    {/* Header da categoria principal */}
                    <TableRow
                      className={cn(
                        accountPlan.name === 'Receitas'
                          ? 'bg-success-100 hover:bg-success-50'
                          : accountPlan.name === 'Despesas'
                            ? 'bg-error-100 hover:bg-error-50'
                            : 'bg-gray-100',
                      )}
                    >
                      <TableCell colSpan={3} className="font-medium text-xs">
                        {accountPlan.name}
                      </TableCell>
                    </TableRow>

                    {/* Renderiza os níveis 2 */}
                    {accountPlan.level2 && accountPlan.level2.length > 0 ? (
                      accountPlan.level2.map((level2Item, level2Index) => (
                        <Fragment
                          key={`level2-${level2Item.code}-${level2Index}`}
                        >
                          {/* Header do nível 2 */}
                          <TableRow className="bg-gray-100">
                            <TableCell
                              colSpan={3}
                              className="font-medium text-xs text-gray"
                            >
                              {`${level2Item.code} - ${level2Item.name}`}
                            </TableCell>
                          </TableRow>

                          {/* Naturezas e suas subcategorias */}
                          {level2Item.natures &&
                          level2Item.natures.length > 0 ? (
                            level2Item.natures.map((nature, natureIndex) => {
                              const combinedCode = `${nature.level1}.${nature.level2}.${nature.code}`

                              return (
                                <Fragment
                                  key={`nature-${nature.id}-${natureIndex}`}
                                >
                                  {/* Header da natureza */}
                                  <TableRow className="bg-gray-50">
                                    <TableCell
                                      colSpan={2}
                                      className="text-xs text-gray"
                                    >
                                      {`${combinedCode} - ${nature.description || 'Sem descrição'}`}
                                    </TableCell>
                                    <TableCell className="text-right w-[100px] py-0">
                                      <div className="flex justify-end gap-0.5">
                                        <TooltipProvider>
                                          {!isInactiveTab ? (
                                            <ActionButton
                                              Icon={IconSquarePlus}
                                              tooltip="Adicionar subcategoria"
                                              onClick={() => {
                                                setOpenDialog('create')
                                                setCategoryRowData(nature)
                                                setCombinedCode(combinedCode)
                                              }}
                                            />
                                          ) : null}
                                          <ActionButton
                                            Icon={IconPencil}
                                            tooltip="Editar categoria"
                                            onClick={() => {
                                              setOpenDialog('editCategory')
                                              setCategoryRowData(nature)
                                            }}
                                          />
                                        </TooltipProvider>
                                      </div>
                                    </TableCell>
                                  </TableRow>

                                  {/* Subcategorias da natureza */}
                                  {nature.subCategories &&
                                  nature.subCategories.length > 0 ? (
                                    nature.subCategories.map((subCategory) => (
                                      <TableRow
                                        key={`subcat-${nature.code}-${subCategory.id}`}
                                      >
                                        <TableCell className="w-[140px] text-sm font-medium">
                                          <div className="flex items-center gap-2">
                                            {`${nature.level1}.${nature.level2}.${nature.code}.${subCategory.code}`}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                          {subCategory.description ||
                                            'Sem descrição'}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex justify-end gap-1">
                                            <TooltipProvider>
                                              <ActionButton
                                                Icon={IconPencil}
                                                tooltip="Editar subcategoria"
                                                onClick={() => {
                                                  setOpenDialog('edit')
                                                  setSubCategoryRowData(
                                                    subCategory,
                                                  )
                                                  setCombinedCode(combinedCode)
                                                }}
                                              />
                                            </TooltipProvider>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell
                                        colSpan={3}
                                        className="text-gray-400 text-center pl-10"
                                      >
                                        Nenhuma subcategoria cadastrada ou{' '}
                                        {isInactiveTab ? 'inativa' : 'ativa'}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Fragment>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-gray-400 text-center pl-8"
                              >
                                Nenhuma categoria cadastrada ou{' '}
                                {isInactiveTab ? 'inativa' : 'ativa'}
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-gray-400 text-center"
                        >
                          Nenhuma categoria cadastrada ou{' '}
                          {isInactiveTab ? 'inativa' : 'ativa'}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>

            {/* Criação de subcategoria (subCategory) */}
            <NewSubcategoryDialog
              open={openDialog === 'create'}
              setOpen={setOpenDialog}
              natureId={categoryRowData?.id}
              combinedCode={combinedCode}
              searchParams={searchParams}
            />

            {/* Edição de categoria (nature) */}
            <NewCategoryDialog
              open={openDialog === 'editCategory'}
              setOpen={setOpenDialog}
              rowData={categoryRowData}
              searchParams={searchParams}
              editMode={true}
            />

            {/* Edição de subcategoria (subCategory) */}
            <EditSubcategoryDialog
              open={openDialog === 'edit'}
              setOpen={setOpenDialog}
              rowData={subCategoryRowData}
              searchParams={searchParams}
              combinedCode={combinedCode}
            />
          </>
        )}
      </CardContent>
      {/* {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null} */}
    </>
  )
}
