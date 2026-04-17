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

export const dynamic = 'force-dynamic'
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
          <h1 className="text-2xl font-bold text-[#101828]">
            Table Elements — Sandbox
          </h1>
          <p className="text-sm text-[#667085] mt-1">
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
              <TableHeader className="bg-gray-50 border-y border-[#EAECF0]">
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
                <TableRow className="border-b border-[#EAECF0]">
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
                      className="bg-[#ecfdf3] text-[#027a48] hover:bg-[#ecfdf3] h-6 border-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] mr-1.5" />
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#475467]">
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
                <TableRow className="bg-gray-50/50 border-b border-[#EAECF0]">
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
                      className="bg-[#ecfdf3] text-[#027a48] hover:bg-[#ecfdf3] h-6 border-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] mr-1.5" />
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#475467]">
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
                      className="border border-[#D0D5DD] shadow-sm text-sm text-[#344054] hover:bg-gray-50"
                    >
                      Anterior
                    </PaginationPrevious>
                  </PaginationItem>
                  <div className="flex items-center gap-0.5">
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive
                        className="bg-[#d2f9e3] hover:bg-[#bbf0d0] text-[#077550] border-none"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-[#667085] hover:bg-gray-50 border-none"
                      >
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-[#667085] hover:bg-gray-50 border-none"
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis className="text-[#667085]" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-[#667085] hover:bg-gray-50 border-none"
                      >
                        8
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-[#667085] hover:bg-gray-50 border-none"
                      >
                        9
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="text-[#667085] hover:bg-gray-50 border-none"
                      >
                        10
                      </PaginationLink>
                    </PaginationItem>
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="border border-[#D0D5DD] shadow-sm text-sm text-[#344054] hover:bg-gray-50"
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
        <section className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EAECF0]">
            <h2 className="text-base font-semibold text-[#101828]">
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
                    iconBgColor="bg-[#eef4ff]"
                    iconColor="text-[#3538cd]"
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
            <h2 className="text-xl flex items-center font-semibold text-[#101828]">
              Empty States de Tabela
            </h2>
            <p className="text-[#667085]">
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAECF0] bg-white">
              <div className="flex border border-[#D0D5DD] rounded-lg overflow-hidden shadow-sm">
                <Button
                  variant="ghost"
                  className="rounded-none bg-gray-50 border-r border-[#D0D5DD] h-10 px-4"
                >
                  View all
                </Button>
                <Button variant="ghost" className="rounded-none h-10 px-4">
                  Monitored
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="text"
                    value="Stripe"
                    readOnly
                    className="h-10 pl-9 pr-3 rounded-lg border border-[#38CF8F] ring-4 ring-[#F4EBFF] focus:outline-none w-[300px] text-sm font-medium text-[#101828]"
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
                      className="border border-[#D0D5DD] shadow-sm text-sm text-[#344054] hover:bg-gray-50"
                    >
                      Anterior
                    </PaginationPrevious>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="border border-[#D0D5DD] shadow-sm text-sm text-[#344054] hover:bg-gray-50"
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
                  <Button variant="outline" className="text-[#344054]">
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
                  <Button variant="outline" className="text-[#344054]">
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
