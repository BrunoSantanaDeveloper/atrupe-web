'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type { ProductsReportPdfData } from '../../pdf-types'
import type { ProductSold } from '../../types'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatQuantity, formatUnit } from '../../utils'

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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
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
  },
  period: {
    fontSize: 9,
    color: '#667085',
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
  colProduct: { width: '46%', paddingRight: 4 },
  colQuantity: { width: '18%', textAlign: 'right', paddingRight: 8 },
  colUnit: { width: '16%' },
  colValue: { width: '20%', textAlign: 'right' },
  // Table Row
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
  cellMuted: {
    fontSize: 9,
    color: '#667085',
  },
  // Total row
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
  data: ProductsReportPdfData
}

export function ProductsReportPdf({ data }: Props) {
  const renderProduct = (product: ProductSold) => (
    <View
      key={`${product.productId ?? product.name}-${product.unit}`}
      style={styles.tableRow}
      wrap={false}
    >
      <View style={styles.colProduct}>
        <Text style={styles.cellText}>{product.name}</Text>
      </View>
      <View style={styles.colQuantity}>
        <Text style={styles.cellText}>{formatQuantity(product.quantity)}</Text>
      </View>
      <View style={styles.colUnit}>
        <Text style={styles.cellMuted}>{formatUnit(product.unit)}</Text>
      </View>
      <View style={styles.colValue}>
        <Text style={styles.cellText}>
          {formatCurrencyToBrl(product.value)}
        </Text>
      </View>
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader company={data.company} />

        <View style={styles.container}>
          {/* Title */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Relatório</Text>
              <Text style={styles.subtitle}>Produtos vendidos</Text>
            </View>
            <Text style={styles.period}>
              Período: {data.period.start} a {data.period.end}
            </Text>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={styles.colProduct}>
              <Text style={styles.tableHeaderCell}>Produto</Text>
            </View>
            <View style={styles.colQuantity}>
              <Text style={styles.tableHeaderCell}>Qtd. vendida</Text>
            </View>
            <View style={styles.colUnit}>
              <Text style={styles.tableHeaderCell}>Un. comercial</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.tableHeaderCell}>Valor total</Text>
            </View>
          </View>

          {/* Products */}
          {data.products.map(renderProduct)}

          {/* Total */}
          <View style={styles.totalRow} wrap={false}>
            <View style={styles.colProduct}>
              <Text style={styles.totalText}>
                Total dos produtos no período
              </Text>
            </View>
            <View style={styles.colQuantity} />
            <View style={styles.colUnit} />
            <View style={styles.colValue}>
              <Text style={styles.totalText}>
                {formatCurrencyToBrl(data.totalValue)}
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
