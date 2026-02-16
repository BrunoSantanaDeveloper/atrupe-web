'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type { DfcReportPdfData, DfcPdfTableRow } from '../../pdf-types'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  data: DfcReportPdfData
}

export function DfcReportPdf({ data }: Props) {
  const { table, summary } = data
  const columnCount = table.headers.length
  const categoryWidth = '35%'
  const valueColWidth = `${65 / columnCount}%`

  const styles = StyleSheet.create({
    page: {
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Helvetica',
      fontSize: 8,
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
      marginBottom: 10,
    },
    // Summary
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
    summaryValueNegative: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#D92D20',
    },
    // Table Header
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 5,
      borderTopWidth: 1,
      borderTopColor: '#344054',
      borderBottomWidth: 1,
      borderBottomColor: '#D0D5DD',
    },
    tableHeaderCell: {
      fontSize: 6,
      fontWeight: 'bold',
      color: '#667085',
      textTransform: 'uppercase',
    },
    // Table Row
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#EAECF0',
    },
    tableRowLevel0: {
      flexDirection: 'row',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#D0D5DD',
      backgroundColor: '#F9FAFB',
    },
    cellText: {
      fontSize: 8,
      color: '#1D2939',
    },
    cellTextBold: {
      fontSize: 8,
      color: '#1D2939',
      fontWeight: 'bold',
    },
    cellValue: {
      fontSize: 8,
      color: '#1D2939',
      textAlign: 'right',
    },
    cellValueNegative: {
      fontSize: 8,
      color: '#D92D20',
      textAlign: 'right',
    },
    cellValueBold: {
      fontSize: 8,
      color: '#1D2939',
      textAlign: 'right',
      fontWeight: 'bold',
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

  const renderRow = (row: DfcPdfTableRow) => {
    const isLevel0 = row.level === 0
    const rowStyle = isLevel0 ? styles.tableRowLevel0 : styles.tableRow
    const textStyle = isLevel0 ? styles.cellTextBold : styles.cellText
    const indent = row.level * 8

    return (
      <View key={row.id} style={rowStyle} wrap={false}>
        <View style={{ width: categoryWidth, paddingLeft: indent }}>
          <Text style={textStyle}>
            {row.code ? `${row.code} - ` : ''}
            {row.name}
          </Text>
        </View>
        {table.headers.map((header) => {
          const value = row.values[header] || 0
          const isNegative = value < 0
          const valueStyle = isLevel0
            ? styles.cellValueBold
            : isNegative
              ? styles.cellValueNegative
              : styles.cellValue

          return (
            <View key={header} style={{ width: valueColWidth }}>
              <Text style={valueStyle}>
                {isNegative ? '-' : ''}
                {formatCurrencyToBrl(Math.abs(value))}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PdfHeader company={data.company} />

        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Relatório</Text>
          <Text style={styles.subtitle}>
            Demonstração de Fluxo de Caixa (DFC)
          </Text>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Receitas Totais</Text>
              <Text style={styles.summaryValue}>
                {formatCurrencyToBrl(summary.totalRevenue)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Despesas Totais</Text>
              <Text style={styles.summaryValueNegative}>
                {formatCurrencyToBrl(summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Fluxo de Caixa Final</Text>
              <Text
                style={
                  summary.finalCashFlow < 0
                    ? styles.summaryValueNegative
                    : styles.summaryValue
                }
              >
                {formatCurrencyToBrl(summary.finalCashFlow)}
              </Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={{ width: categoryWidth }}>
              <Text style={styles.tableHeaderCell}>CATEGORIA</Text>
            </View>
            {table.headers.map((header) => (
              <View key={header} style={{ width: valueColWidth }}>
                <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>
                  {header}
                </Text>
              </View>
            ))}
          </View>

          {/* Table Rows */}
          {table.rows.map(renderRow)}
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
