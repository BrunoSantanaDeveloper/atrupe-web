'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type {
  FinancialPdfData,
  FinancialPdfGroup,
  FinancialPdfRecord,
} from '../../pdf-types'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  received: 'Recebidas',
  /* confirmed: 'Confirmadas', */
  to_receive: 'A receber',
  overdue: 'Vencidas',
}

const styles = StyleSheet.create({
  page: {
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingBottom: 30,
    paddingTop: 90,
    backgroundColor: '#fff',
  },
  container: {
    padding: 30,
    paddingTop: 0,
  },
  title: {
    fontSize: 10,
    color: '#667085',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D2939',
    marginBottom: 15,
  },
  // Table Header
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#344054',
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#667085',
    textTransform: 'uppercase',
  },
  colDescription: { width: '35%' },
  colClient: { width: '22%' },
  colDate: { width: '15%' },
  colStatus: { width: '10%' },
  colValue: { width: '12%', textAlign: 'right' },
  colPercent: { width: '6%', textAlign: 'right' },
  // Group Header Row
  groupHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
    backgroundColor: '#fff',
  },
  groupName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1D2939',
  },
  groupValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1D2939',
    textAlign: 'right',
  },
  groupPercent: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1D2939',
    textAlign: 'right',
  },
  // Table Row
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  cellText: {
    fontSize: 8,
    color: '#1D2939',
  },
  cellSubText: {
    fontSize: 7,
    color: '#667085',
  },
  cellStatus: {
    fontSize: 8,
    color: '#667085',
  },
  cellValue: {
    fontSize: 8,
    color: '#1D2939',
    textAlign: 'right',
  },
  cellPercent: {
    fontSize: 8,
    color: '#667085',
    textAlign: 'right',
  },
  // Page Number
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    fontSize: 8,
    textAlign: 'center',
    color: '#667085',
  },
})

interface Props {
  data: FinancialPdfData
}

export function FinancialReportPdf({ data }: Props) {
  const isReceitas = data.tab !== 'despesas'

  const renderRecord = (record: FinancialPdfRecord) => (
    <View key={record.id} style={styles.tableRow} wrap={false}>
      <View style={styles.colDescription}>
        <Text style={styles.cellText}>{record.description}</Text>
      </View>
      <View style={styles.colClient}>
        <Text style={styles.cellText}>{record.clientName}</Text>
      </View>
      <View style={styles.colDate}>
        <Text style={styles.cellText}>
          {record.receivedDate || record.dueDate || ''}
        </Text>
      </View>
      <View style={styles.colStatus}>
        <Text style={styles.cellStatus}>
          {STATUS_LABELS[record.status] || record.status}
        </Text>
      </View>
      <View style={styles.colValue}>
        <Text style={styles.cellValue}>
          {formatCurrencyToBrl(record.value)}
        </Text>
      </View>
      <View style={styles.colPercent}>
        <Text style={styles.cellPercent}>{record.percentage}%</Text>
      </View>
    </View>
  )

  const renderGroup = (group: FinancialPdfGroup) => (
    <View key={group.clientId} wrap={false}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <View style={styles.colDescription}>
          <Text style={styles.groupName}>{group.clientName}</Text>
        </View>
        <View style={styles.colClient} />
        <View style={styles.colDate} />
        <View style={styles.colStatus} />
        <View style={styles.colValue}>
          <Text style={styles.groupValue}>
            {formatCurrencyToBrl(group.total)}
          </Text>
        </View>
        <View style={styles.colPercent}>
          <Text style={styles.groupPercent}>{group.percentage}%</Text>
        </View>
      </View>
      {/* Group Records */}
      {group.records.map(renderRecord)}
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader company={data.company} />

        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Relatório</Text>
          <Text style={styles.subtitle}>
            {isReceitas ? 'Receitas' : 'Despesas'}
            {data.status
              ? ` — ${STATUS_LABELS[data.status] || data.status}`
              : ''}
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={styles.colDescription}>
              <Text style={styles.tableHeaderCell}>DESCRIÇÃO</Text>
            </View>
            <View style={styles.colClient}>
              <Text style={styles.tableHeaderCell}>
                {isReceitas ? 'CLIENTE' : 'FORNECEDOR'}
              </Text>
            </View>
            <View style={styles.colDate}>
              <Text style={styles.tableHeaderCell}>DATA</Text>
            </View>
            <View style={styles.colStatus}>
              <Text style={styles.tableHeaderCell}>STATUS</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.tableHeaderCell}>
                {formatCurrencyToBrl(data.totalValue)}
              </Text>
            </View>
            <View style={styles.colPercent}>
              <Text style={styles.tableHeaderCell}>
                {data.totalPercentage}%
              </Text>
            </View>
          </View>

          {/* Groups */}
          {data.groups.map(renderGroup)}
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </Page>
    </Document>
  )
}
