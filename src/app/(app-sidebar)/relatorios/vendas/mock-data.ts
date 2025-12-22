// Mock data for development
// Replace with API calls when backend is ready

import type {
  SalesReportData,
  SalesEvolutionData,
  ApprovedRejectedData,
  OriginChartData,
  TopProductData,
  TopClientData,
  SalesClientGroup,
  SaleRecord,
  SalesTableData,
} from './types'

const evolutionData: SalesEvolutionData[] = [
  { month: '01', approved: 0, inProgress: 0 },
  { month: '02', approved: 0, inProgress: 0 },
  { month: '10', approved: 3472.68, inProgress: 0 },
  { month: '04', approved: 0, inProgress: 0 },
  { month: '05', approved: 0, inProgress: 0 },
  { month: '06', approved: 3393.33, inProgress: 0 },
  { month: '07', approved: 0, inProgress: 0 },
]

const approvedRejectedData: ApprovedRejectedData[] = [
  { label: 'Jul', approved: 100, expired: 65, rejected: 25 },
  { label: 'Ago', approved: 78, expired: 58, rejected: 18 },
  { label: 'Set', approved: 72, expired: 72, rejected: 25 },
  { label: 'Out', approved: 35, expired: 28, rejected: 25 },
  { label: 'Nov', approved: 30, expired: 18, rejected: 28 },
  { label: 'Dez', approved: 18, expired: 0, rejected: 30 },
]

const quotationsOrigin: OriginChartData[] = [
  { name: 'WhatsApp', value: 75, color: '#039855' },
  { name: 'Balcão', value: 45, color: '#F97066' },
  { name: 'Instagram', value: 30, color: '#475467' },
  { name: 'Site', value: 35, color: '#F79009' },
  { name: 'Outros', value: 15, color: '#FDB022' },
]

const ordersOrigin: OriginChartData[] = [
  { name: 'WhatsApp', value: 75, color: '#039855' },
  { name: 'Balcão', value: 45, color: '#F97066' },
  { name: 'Instagram', value: 30, color: '#475467' },
  { name: 'Site', value: 35, color: '#F79009' },
  { name: 'Outros', value: 15, color: '#FDB022' },
]

const topProducts: TopProductData[] = [
  { name: 'Produto 1', type: 'PDF', value: 100 },
  { name: 'Produto 2', type: 'Excel', value: 90 },
  { name: 'Produto 3', type: 'PDF', value: 80 },
  { name: 'Produto 4', type: 'PDF', value: 70 },
  { name: 'Produto 5', type: 'Excel', value: 60 },
  { name: 'Produto 6', type: 'PDF', value: 50 },
  { name: 'Produto 7', type: 'PDF', value: 40 },
  { name: 'Produto 8', type: 'Excel', value: 30 },
  { name: 'Produto 9', type: 'PDF', value: 20 },
  { name: 'Produto 10', type: 'PDF', value: 10 },
]

const topClients: TopClientData[] = [
  { name: 'Cliente 1', value: 100 },
  { name: 'Cliente 2', value: 90 },
  { name: 'Cliente 3', value: 80 },
  { name: 'Cliente 4', value: 70 },
  { name: 'Cliente 5', value: 60 },
  { name: 'Cliente 6', value: 50 },
  { name: 'Cliente 7', value: 40 },
  { name: 'Cliente 8', value: 30 },
  { name: 'Cliente 9', value: 20 },
  { name: 'Cliente 10', value: 10 },
]

// Mock data for grouped by client view
const tableDataGrouped: SalesClientGroup[] = [
  {
    clientId: '1',
    clientName: 'Nome do Cliente Ltda',
    count: 4,
    total: 4500.0,
    records: [
      {
        id: '1',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: '108-v1 - Venda rápida',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 50000.0,
        phase: 'em-producao',
        phasePercentage: 14,
      },
      {
        id: '2',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: '107-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 14,
      },
      {
        id: '3',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: '106-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'em-producao',
        phasePercentage: 14,
      },
      {
        id: '4',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: '105-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 14,
      },
    ],
  },
  {
    clientId: '2',
    clientName: 'Outro Cliente SA',
    count: 40,
    total: 4500.0,
    records: [
      {
        id: '5',
        clientName: 'Outro Cliente SA',
        serviceDescription: '26-t1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 14,
      },
      {
        id: '6',
        clientName: 'Outro Cliente SA',
        serviceDescription: '104-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 14,
      },
      {
        id: '7',
        clientName: 'Outro Cliente SA',
        serviceDescription: '103-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 14,
      },
      {
        id: '8',
        clientName: 'Outro Cliente SA',
        serviceDescription: '25-t1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'em-producao',
        phasePercentage: 14,
      },
      {
        id: '9',
        clientName: 'Outro Cliente SA',
        serviceDescription: '102-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'em-producao',
        phasePercentage: 14,
      },
      {
        id: '10',
        clientName: 'Outro Cliente SA',
        serviceDescription: '101-v1 - Descrição do serviço',
        approvedDate: '00/00/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 14,
      },
    ],
  },
]

// Mock data for ungrouped (flat) view
const tableDataFlat: SaleRecord[] = [
  {
    id: '1',
    clientName: 'Nome do Cliente Ltda',
    serviceDescription: '108-v1 - Venda rápida',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 50000.0,
    phase: 'em-producao',
    phasePercentage: 14,
  },
  {
    id: '2',
    clientName: 'Nome do Cliente Ltda',
    serviceDescription: '107-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'entregue',
    phasePercentage: 14,
  },
  {
    id: '3',
    clientName: 'Nome do Cliente Ltda',
    serviceDescription: '106-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'em-producao',
    phasePercentage: 14,
  },
  {
    id: '4',
    clientName: 'Nome do Cliente Ltda',
    serviceDescription: '105-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'entregue',
    phasePercentage: 14,
  },
  {
    id: '5',
    clientName: 'Outro Cliente SA',
    serviceDescription: '26-t1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'entregue',
    phasePercentage: 14,
  },
  {
    id: '6',
    clientName: 'Outro Cliente SA',
    serviceDescription: '104-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'entregue',
    phasePercentage: 14,
  },
  {
    id: '7',
    clientName: 'Outro Cliente SA',
    serviceDescription: '103-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'entregue',
    phasePercentage: 14,
  },
  {
    id: '8',
    clientName: 'Outro Cliente SA',
    serviceDescription: '25-t1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'em-producao',
    phasePercentage: 14,
  },
  {
    id: '9',
    clientName: 'Outro Cliente SA',
    serviceDescription: '102-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'em-producao',
    phasePercentage: 14,
  },
  {
    id: '10',
    clientName: 'Outro Cliente SA',
    serviceDescription: '101-v1 - Descrição do serviço',
    approvedDate: '00/00/0000',
    dueDate: '00/00/0000',
    value: 5000.0,
    phase: 'entregue',
    phasePercentage: 14,
  },
]

// Export both mock data versions for different grouping modes
export const mockTableDataGrouped: SalesTableData = {
  grouped: true,
  groups: tableDataGrouped,
  totalCount: 230,
}

export const mockTableDataFlat: SalesTableData = {
  grouped: false,
  records: tableDataFlat,
  totalCount: 230,
}

export const mockSalesReportData: SalesReportData = {
  summary: {
    approvedTotal: 4898125,
    approvedCount: 230,
    rejectedTotal: 786405,
    rejectedCount: 100,
    noResponseTotal: 786405,
    averageTicket: 15080,
    commission: 278242,
    approvalTime: '48h35',
  },
  evolution: evolutionData,
  approvedRejected: approvedRejectedData,
  quotationsOrigin,
  ordersOrigin,
  topProducts,
  topClients,
  tableData: mockTableDataGrouped, // Default to grouped view
  pagination: {
    page: 1,
    totalPages: 18,
    totalRecords: 230,
  },
}

// Origins mock data
export const mockOrigins = [
  { id: 'all', name: 'Todas' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'site', name: 'Site' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'balcao', name: 'Balcão' },
]

// Period options
export const periodOptions = [
  { id: 'current_month', name: 'Mês atual' },
  { id: 'last_6_months', name: 'Últimos 6 meses' },
  { id: 'last_12_months', name: 'Últimos 12 meses' },
  { id: 'last_24_months', name: 'Últimos 24 meses' },
  { id: 'last_36_months', name: 'Últimos 36 meses' },
  { id: 'custom', name: 'Personalizado' },
]
