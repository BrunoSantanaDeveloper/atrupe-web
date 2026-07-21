'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type { SalesReportPdfCompany } from '../../pdf-types'

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
  colPosition: { width: '10%' },
  colName: { width: '60%' },
  colValue: { width: '30%', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  cellText: {
    fontSize: 9,
    color: '#1D2939',
  },
  cellValue: {
    fontSize: 9,
    color: '#1D2939',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#344054',
    marginTop: 2,
  },
  totalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D2939',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D2939',
    textAlign: 'right',
  },
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
  company?: SalesReportPdfCompany
  title: string
  nameLabel: string
  items: { name: string; value: number }[]
}

export function RankingReportPdf({ company, title, nameLabel, items }: Props) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader company={company} />

        <View style={styles.container}>
          <Text style={styles.title}>Relatório de vendas</Text>
          <Text style={styles.subtitle}>{title}</Text>

          <View style={styles.tableHeader} fixed>
            <View style={styles.colPosition}>
              <Text style={styles.tableHeaderCell}>#</Text>
            </View>
            <View style={styles.colName}>
              <Text style={styles.tableHeaderCell}>{nameLabel}</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.tableHeaderCell}>VALOR</Text>
            </View>
          </View>

          {items.map((item, index) => (
            <View
              key={`${item.name}-${index}`}
              style={styles.tableRow}
              wrap={false}
            >
              <View style={styles.colPosition}>
                <Text style={styles.cellText}>{index + 1}</Text>
              </View>
              <View style={styles.colName}>
                <Text style={styles.cellText}>{item.name}</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellValue}>
                  {formatCurrencyToBrl(item.value)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalRow} wrap={false}>
            <View style={styles.colPosition} />
            <View style={styles.colName}>
              <Text style={styles.totalText}>TOTAL</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.totalValue}>
                {formatCurrencyToBrl(total)}
              </Text>
            </View>
          </View>
        </View>

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
