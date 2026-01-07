'use client'

import { Fragment } from 'react'

// UI
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

// Components
import { TablePagination } from '@/components/common/TablePagination'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { InvoiceFilter } from './InvoiceFilter'
import { ActionButton } from '@/components/common/ActionButton'

// Icons
import { IconSearch } from '@tabler/icons-react'

import type { SearchParamsType } from '@/types/coreTypes'

interface Props extends SearchParamsType {}

export function InvoiceResultsTable({ searchParams }: Props) {
  // Mock data to demonstrate the design
  const allMockData = [
    {
      date: 'Terça-feira, 13 de Agosto de 2024',
      items: [
        {
          id: '1',
          client: 'Cliente não informado',
          ref: '108-v1 - Venda rápida',
          value: 'R$ 500,00',
          status: 'Não emitida',
          statusVariant: 'neutralLight' as const,
        },
        {
          id: '2',
          client: 'Nome do Cliente Ltda',
          ref: '107-v1 - Descrição do serviço',
          value: 'R$ 500,00',
          status: 'Não emitida',
          statusVariant: 'neutralLight' as const,
        },
        {
          id: '3',
          client: 'Nome do Cliente Ltda',
          ref: '106-v1 - Descrição do serviço',
          value: 'R$ 500,00',
          status: 'Não emitida',
          statusVariant: 'neutralLight' as const,
        },
        {
          id: '4',
          client: 'Nome do Cliente Ltda',
          ref: '105-v1 - Descrição do serviço',
          value: 'R$ 500,00',
          status: 'Em digitação',
          statusVariant: 'blueLight' as const,
        },
      ],
    },
    {
      date: 'Sexta-feira, 09 de Agosto de 2024',
      items: [
        {
          id: '5',
          client: 'Nome do Cliente Ltda',
          ref: '26-t1 - Descrição do serviço',
          value: 'R$ 500,00',
          status: 'Não emitida',
          statusVariant: 'neutralLight' as const,
        },
        {
          id: '6',
          client: 'Nome do Cliente Ltda',
          ref: '104-v1 - Descrição do serviço',
          value: 'R$ 500,00',
          status: 'Não emitida',
          statusVariant: 'neutralLight' as const,
        },
      ],
    },
  ]

  // Filter mock data based on clientId from URL
  // For mock purpose, we'll map id '1' to 'Nome do Cliente Ltda' to show filtering working
  const selectedClientId = searchParams?.clientId as string

  const filteredData = selectedClientId
    ? allMockData
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => {
            // Mock logic: ID 1 matches 'Nome do Cliente Ltda'
            if (selectedClientId === '1')
              return item.client === 'Nome do Cliente Ltda'
            return false
          }),
        }))
        .filter((group) => group.items.length > 0)
    : allMockData

  return (
    <Card className="h-full flex flex-col">
      <TableFiltersHeader searchParams={searchParams}>
        <InvoiceFilter searchParams={searchParams} />
      </TableFiltersHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-y border-gray-100">
              <TableHead className="w-12"></TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Fase atual</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((group) => (
              <Fragment key={group.date}>
                <TableRow className="bg-gray-100">
                  <TableCell
                    colSpan={5}
                    className="text-gray font-medium text-xs py-3"
                  >
                    {group.date}
                  </TableCell>
                </TableRow>
                {group.items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 group transition-colors"
                  >
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-800">{item.client}</p>
                      <p className="text-gray truncate">{item.ref}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-success-600">
                      {item.value}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.statusVariant} status>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton
                          Icon={IconSearch}
                          tooltip="Visualizar"
                          onClick={() => {}}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="border-t border-gray-100 p-4 mt-auto">
        <TablePagination
          searchParams={searchParams}
          lastPage={10} // Mocked pagination
        />
      </CardFooter>
    </Card>
  )
}
