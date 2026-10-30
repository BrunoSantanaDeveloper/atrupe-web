'use client'

// Papéis (GR-0, GR-2): a lista dos papéis da gráfica, por setor, com a
// gramatura, a folha e a área útil que o aproveitamento lê. Sem custo nem
// preço: no LITE o papel não tem dinheiro; no PRO ele vive em Materiais.

// React
import { Fragment } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableGroupRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { PaperDialog } from './PaperDialog'
import { Topbar, type TabNavType } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getPapers } from '@/actions/papers'

// Hooks / Consts
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { mmSize, sheetFormatObj } from '@/consts/papers'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import { IconFiles } from '@tabler/icons-react'

const tabs: TabNavType[] = [
  { value: 'ativos', tab: 'ativos', label: 'Ativos' },
  { value: 'inativos', tab: 'inativos', label: 'Inativos' },
]

export function Papers({ searchParams }: SearchParamsType) {
  const status = searchParams?.status || 'ativos'
  const { hasFeature } = usePlanFeatures()
  const inMaterials = hasFeature(FEATURES.COSTS.COST_BASE)

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    queryKey: ['papers', searchParams],
    queryFn: () => getPapers({ filters: searchParams }),
  })
  const papers = data?.data || []
  const sectors = Array.from(new Set(papers.map((paper) => paper.sector)))

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Papéis"
          supportText={
            inMaterials
              ? 'Os papéis da gráfica. Eles também aparecem em Materiais, com custo e preço.'
              : 'Os papéis da gráfica: gramatura, folha e a área útil que o aproveitamento usa.'
          }
          tabs={tabs}
          activeTab={status}
          paramName="status"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <PaperDialog />
            </PermissionGate>
          }
        />
        <Card>
          <FetchingRegion isFetching={isPlaceholderData}>
            {!isLoading && !papers.length ? (
              status === 'inativos' ? (
                <ListDataTotalEmpty
                  icon={IconFiles}
                  title="Nenhum papel inativo"
                  description="Para inativar um papel, desligue a chave Ativo na edição dele"
                />
              ) : (
                <ListDataTotalEmpty
                  icon={IconFiles}
                  title="Nenhum papel cadastrado"
                  description="Cadastre o primeiro papel: nome, gramatura e a folha"
                />
              )
            ) : (
              <CardContent>
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[36%] min-w-[200px]">
                        Papel
                      </TableHead>
                      <TableHead className="w-[14%]">Gramatura</TableHead>
                      <TableHead className="w-[22%]">Folha</TableHead>
                      <TableHead className="w-[22%]">Área útil</TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeletonRows cols={5} />
                    ) : (
                      sectors.map((sector) => (
                        <Fragment key={sector}>
                          <TableGroupRow>{sector}</TableGroupRow>
                          {papers
                            .filter((paper) => paper.sector === sector)
                            .map((paper) => (
                              <TableRow key={paper.id}>
                                <TableCell>
                                  <p className="font-medium">{paper.name}</p>
                                  <p className="text-sm text-gray">
                                    {paper.code}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  {paper.grammage
                                    ? `${paper.grammage} g/m²`
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  {paper.sheetFormat ? (
                                    <>
                                      <p>
                                        {sheetFormatObj[paper.sheetFormat].text}
                                      </p>
                                      <p className="text-sm text-gray">
                                        {mmSize(
                                          paper.sheetWidth,
                                          paper.sheetHeight,
                                        )}
                                      </p>
                                    </>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell>
                                  {paper.usableWidth && paper.usableHeight ? (
                                    mmSize(
                                      paper.usableWidth,
                                      paper.usableHeight,
                                    )
                                  ) : (
                                    <span className="text-gray">
                                      A folha inteira
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <PermissionGate
                                    permissions={[
                                      'product_settings:products:edit',
                                    ]}
                                  >
                                    <PaperDialog paper={paper} />
                                  </PermissionGate>
                                </TableCell>
                              </TableRow>
                            ))}
                        </Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </FetchingRegion>
        </Card>
      </div>
    </TooltipProvider>
  )
}
