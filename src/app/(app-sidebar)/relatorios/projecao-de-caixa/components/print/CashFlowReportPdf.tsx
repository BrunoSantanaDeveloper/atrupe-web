'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type { CashFlowPdfData, CashFlowPdfRecord } from '../../pdf-types'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

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
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  summaryItem: {
    flexDirection: 'column',
  },
  summaryLabel: {
    fontSize: 7,
    color: '#667085',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D2939',
  },
  summaryRevenue: { color: '#12B76A' },
  summaryExpense: { color: '#F04438' },
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
  colClient: { width: '25%' },
  colDate: { width: '15%' },
  colValue: { width: '15%', textAlign: 'right' },
  colPercent: { width: '10%', textAlign: 'right' },
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
  cellValue: {
    fontSize: 8,
    color: '#1D2939',
    textAlign: 'right',
  },
  cellValuePositive: {
    fontSize: 8,
    color: '#12B76A',
    textAlign: 'right',
  },
  cellValueNegative: {
    fontSize: 8,
    color: '#F04438',
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
  data: CashFlowPdfData
}

export function CashFlowReportPdf({ data }: Props) {
  const renderRecord = (record: CashFlowPdfRecord) => (
    <View key={record.id} style={styles.tableRow} wrap={false}>
      <View style={styles.colDescription}>
        <Text style={styles.cellText}>{record.description}</Text>
      </View>
      <View style={styles.colClient}>
        <Text style={styles.cellText}>{record.clientName}</Text>
      </View>
      <View style={styles.colDate}>
        <Text style={styles.cellText}>{record.dueDate}</Text>
      </View>
      <View style={styles.colValue}>
        <Text
          style={
            record.value >= 0
              ? styles.cellValuePositive
              : styles.cellValueNegative
          }
        >
          {record.value >= 0 ? '' : '-'}
          {formatCurrencyToBrl(Math.abs(record.value))}
        </Text>
      </View>
      <View style={styles.colPercent}>
        <Text style={styles.cellPercent}>{record.percentage}%</Text>
      </View>
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader company={data.company} />

        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Relatório</Text>
          <Text style={styles.subtitle}>Projeção de Caixa</Text>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Receitas Previstas</Text>
              <Text style={[styles.summaryValue, styles.summaryRevenue]}>
                {formatCurrencyToBrl(data.totalRevenue)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Despesas Previstas</Text>
              <Text style={[styles.summaryValue, styles.summaryExpense]}>
                {formatCurrencyToBrl(data.totalExpenses)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Saldo Previsto</Text>
              <Text style={styles.summaryValue}>
                {formatCurrencyToBrl(data.totalBalance)}
              </Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={styles.colDescription}>
              <Text style={styles.tableHeaderCell}>DESCRIÇÃO</Text>
            </View>
            <View style={styles.colClient}>
              <Text style={styles.tableHeaderCell}>CONTRAPARTE</Text>
            </View>
            <View style={styles.colDate}>
              <Text style={styles.tableHeaderCell}>VENCIMENTO</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.tableHeaderCell}>VALOR</Text>
            </View>
            <View style={styles.colPercent}>
              <Text style={styles.tableHeaderCell}>%</Text>
            </View>
          </View>

          {/* Groups */}
          {data.groups.map((group) => (
            <View key={group.date}>
              {/* Group Header */}
              <View style={styles.groupHeader} wrap={false}>
                <View style={styles.colDescription}>
                  <Text style={styles.groupName}>{group.date}</Text>
                </View>
                <View style={styles.colClient} />
                <View style={styles.colDate} />
                <View style={styles.colValue}>
                  <Text style={styles.groupValue}>
                    {formatCurrencyToBrl(group.total)}
                  </Text>
                </View>
                <View style={styles.colPercent} />
              </View>
              {/* Group Records */}
              {group.records.map(renderRecord)}
            </View>
          ))}
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
