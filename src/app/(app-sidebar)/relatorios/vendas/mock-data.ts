// Mock data for development
// Replace with API calls when backend is ready

import type {
  SalesReportData,
  SalesEvolutionData,
  ApprovedRejectedData,
  OriginChartData,
  TopProductData,
  TopClientData,
  SalesTableSection,
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
  { name: 'WhatsApp', value: 45, color: '#25D366' },
  { name: 'Site', value: 30, color: '#3B82F6' },
  { name: 'Instagram', value: 15, color: '#E1306C' },
  { name: 'Outros', value: 10, color: '#9CA3AF' },
]

const ordersOrigin: OriginChartData[] = [
  { name: 'WhatsApp', value: 50, color: '#25D366' },
  { name: 'Balcão', value: 25, color: '#F59E0B' },
  { name: 'Site', value: 15, color: '#3B82F6' },
  { name: 'Outros', value: 10, color: '#9CA3AF' },
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

const tableSections: SalesTableSection[] = [
  {
    title: 'Aberto',
    count: 80,
    total: 6500.0,
    records: [
      {
        id: '1',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: null,
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'em-producao',
        phasePercentage: 4,
      },
    ],
  },
  {
    title: 'Orçado',
    count: 40,
    total: 4500.0,
    records: [
      {
        id: '2',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: '02/16/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 4,
      },
      {
        id: '3',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: '02/16/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 4,
      },
      {
        id: '4',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: '02/16/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'em-producao',
        phasePercentage: 4,
      },
      {
        id: '5',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: '02/16/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 4,
      },
      {
        id: '6',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: '02/16/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'em-producao',
        phasePercentage: 4,
      },
      {
        id: '7',
        clientName: 'Nome do Cliente Ltda',
        serviceDescription: 'Descrição do serviço',
        approvedDate: '02/16/0000',
        dueDate: '00/00/0000',
        value: 5000.0,
        phase: 'entregue',
        phasePercentage: 4,
      },
    ],
  },
]

export const mockSalesReportData: SalesReportData = {
  summary: {
    approvedTotal: 48981.25,
    approvedCount: 159,
    rejectedTotal: 7864.05,
    rejectedCount: 10,
    noResponseTotal: 7864.05,
    averageTicket: 150.8,
    commission: 2782.42,
    approvalTime: '48h35',
  },
  evolution: evolutionData,
  approvedRejected: approvedRejectedData,
  quotationsOrigin,
  ordersOrigin,
  topProducts,
  topClients,
  tableSections,
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
  { id: 'last_month', name: 'Mês passado' },
  { id: 'last_3_months', name: 'Últimos 3 meses' },
  { id: 'last_6_months', name: 'Últimos 6 meses' },
  { id: 'custom', name: 'Personalizado' },
]
