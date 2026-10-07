'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusTag } from '@/components/ui/status-tag'
import { Badge } from '@/components/ui/badge'
import {
  CellUser,
  CellFile,
  CellPayment,
  CellProgress,
  CellAvatarGroup,
  CellActionGroup,
} from '@/components/ui/table-cells'
import {
  DataTableCard,
  DataTableHeader,
  DataTableFooter,
  DataTableSortHead,
} from '@/components/ui/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { IconSearch, IconCreditCard, IconFileText } from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

export default function TableCellsSandboxPage() {
  const mockAvatarGroup = [
    { fallback: 'A' },
    { fallback: 'B' },
    { fallback: 'C' },
    { fallback: 'D' },
    { fallback: 'E' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Table Elements — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualização de padrões de conteúdo de células isolados e compostos
            em tabelas.
          </p>
        </div>

        {/* --- DEMONSTRAÇÃO 1: USUÁRIOS E EQUIPES COM DATA TABLE WRAPPER --- */}
        <section>
          <DataTableCard>
            <DataTableHeader
              title="Team members"
              badge="100 users"
              actions={
                <Button variant="outline" size="sm">
                  Add member
                </Button>
              }
            />
            <Table>
              <TableHeader className="bg-gray-50 border-y border-gray-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16 pl-6">
                    <Checkbox size="md" />
                  </TableHead>
                  <TableHead className="w-[300px]">
                    <DataTableSortHead title="Name" />
                  </TableHead>
                  <TableHead>
                    <DataTableSortHead title="Status" sortDirection="desc" />
                  </TableHead>
                  <TableHead>
                    <DataTableSortHead title="Role" />
                  </TableHead>
                  <TableHead>
                    <DataTableSortHead title="Teams" />
                  </TableHead>
                  <TableHead className="text-right pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-200">
                  <TableCell className="pl-6">
                    <Checkbox size="md" />
                  </TableCell>
                  <TableCell>
                    <CellUser
                      title="Olivia Rhye"
                      subtitle="@olivia"
                      avatarFallback="OR"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="success"
                      className="bg-success-50 text-success-700 hover:bg-success-50 h-6 border-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 mr-1.5" />
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    Product Designer
                  </TableCell>
                  <TableCell>
                    <CellAvatarGroup
                      users={mockAvatarGroup}
                      total={10}
                      max={5}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <CellActionGroup
                      className="justify-end"
                      onDelete={() => {}}
                      onEdit={() => {}}
                      mode="icon"
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-50/50 border-b border-gray-200">
                  <TableCell className="pl-6">
                    <Checkbox size="md" checked />
                  </TableCell>
                  <TableCell>
                    <CellUser
                      title="Phoenix Baker"
                      subtitle="@phoenix"
                      avatarFallback="PB"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="success"
                      className="bg-success-50 text-success-700 hover:bg-success-50 h-6 border-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 mr-1.5" />
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    Product Manager
                  </TableCell>
                  <TableCell>
                    <CellAvatarGroup
                      users={mockAvatarGroup.slice(0, 3)}
                      total={3}
                      max={5}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <CellActionGroup
                      className="justify-end"
                      onDelete={() => {}}
                      onEdit={() => {}}
                      mode="icon"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <DataTableFooter>
              <Pagination className="w-full">
                <PaginationContent className="w-full justify-between">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className="border border-gray-300 shadow-sm text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Anterior
                    </PaginationPrevious>
                  </PaginationItem>
                  <div className="flex items-center gap-0.5">
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive
                        className="bg-brand-50 hover:bg-[#bbf0d0] dark:hover:bg-brand-50 text-brand-600 border-none"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-gray-500 hover:bg-gray-50 border-none"
                      >
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-gray-500 hover:bg-gray-50 border-none"
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis className="text-gray-500" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-gray-500 hover:bg-gray-50 border-none"
                      >
                        8
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-gray-500 hover:bg-gray-50 border-none"
                      >
                        9
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-gray-500 hover:bg-gray-50 border-none"
                      >
                        10
                      </PaginationLink>
                    </PaginationItem>
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="border border-gray-300 shadow-sm text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Próximo
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </DataTableFooter>
          </DataTableCard>
        </section>

        {/* --- DEMONSTRAÇÃO 2: FATURAMENTO & ARQUIVOS --- */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              Faturamento & Documentos
            </h2>
          </div>
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[300px]">Método de Pagamento</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="w-[200px]">Progresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <CellPayment
                    title="Visa ending in 1234"
                    subtitle="Expiry 06/2024"
                  />
                </TableCell>
                <TableCell>
                  <CellFile title="Tech requirements.pdf" subtitle="200 KB" />
                </TableCell>
                <TableCell>
                  <CellProgress value={60} />
                </TableCell>
                <TableCell className="text-right">
                  <CellActionGroup
                    className="justify-end"
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <CellPayment
                    title="Mastercard ending in 1234"
                    subtitle="Expiry 06/2024"
                    icon={<IconCreditCard className="w-5 h-5" />}
                  />
                </TableCell>
                <TableCell>
                  <CellFile
                    title="Q1 Performance.csv"
                    subtitle="720 KB"
                    iconBgColor="bg-indigo-50"
                    iconColor="text-indigo-700"
                  />
                </TableCell>
                <TableCell>
                  <CellProgress value={100} label="Concluído" />
                </TableCell>
                <TableCell className="text-right">
                  <CellActionGroup
                    className="justify-end"
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* --- DEMONSTRAÇÃO 3: EMPTY STATES --- */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl flex items-center font-semibold text-gray-900">
              Empty States de Tabela
            </h2>
            <p className="text-gray-500">
              Demonstração de estados vazios para search, data upload e telas de
              erro integradas na tabela.
            </p>
          </div>

          {/* Estado de Busca Vazia */}
          <DataTableCard>
            <DataTableHeader
              title="Vendor movements"
              badge="240 vendors"
              actions={
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    Import
                  </Button>
                  <Button variant="success" size="sm">
                    Add vendor
                  </Button>
                </div>
              }
            />
            {/* Simulation of Filters Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <Button
                  variant="ghost"
                  className="rounded-none bg-gray-50 border-r border-gray-300 h-10 px-4"
                >
                  View all
                </Button>
                <Button variant="ghost" className="rounded-none h-10 px-4">
                  Monitored
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value="Stripe"
                    readOnly
                    className="h-10 pl-9 pr-3 rounded-lg border border-brand-300 ring-4 ring-[#F4EBFF] focus:outline-none w-[300px] text-sm font-medium text-gray-900"
                  />
                </div>
                <Button variant="outline">Filters</Button>
              </div>
            </div>

            <EmptyState
              iconType="search"
              title="No vendors found"
              description={
                <>
                  Your search "Stripe" did not match any vendors.
                  <br />
                  Please try again or create a new vendor.
                </>
              }
              action={
                <>
                  <Button variant="outline">Clear search</Button>
                  <Button variant="success">Add vendor</Button>
                </>
              }
            />
            <DataTableFooter>
              <Pagination className="w-full">
                <PaginationContent className="w-full justify-between">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className="border border-gray-300 shadow-sm text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Anterior
                    </PaginationPrevious>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="border border-gray-300 shadow-sm text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Próximo
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </DataTableFooter>
          </DataTableCard>

          {/* Estado de Arquivos (Data Empty State) */}
          <DataTableCard>
            <DataTableHeader
              title="My projects"
              actions={
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    Download all
                  </Button>
                  <Button variant="success" size="sm">
                    Upload
                  </Button>
                </div>
              }
            />
            <EmptyState
              iconType="data"
              title="Start by uploading a file"
              description={
                <>
                  Any assets used in projects will live here.
                  <br />
                  Start creating by uploading your files.
                </>
              }
              action={
                <>
                  <Button variant="outline" className="text-gray-700">
                    Support article
                  </Button>
                  <Button variant="success">Upload</Button>
                </>
              }
            />
          </DataTableCard>

          {/* Estado de Erro */}
          <DataTableCard>
            <DataTableHeader title="Team members" badge="100 users" />
            <EmptyState
              iconType="error"
              title="Something went wrong..."
              description={
                <>
                  We had some trouble loading this page. Please
                  <br />
                  refresh the page to try again or touch if the
                  <br />
                  problem severe enough?
                </>
              }
              action={
                <>
                  <Button variant="outline" className="text-gray-700">
                    Contact support
                  </Button>
                  <Button variant="success">Reload page</Button>
                </>
              }
            />
          </DataTableCard>
        </section>
      </div>
    </div>
  )
}
