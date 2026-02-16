'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type { SectorReportPdfData, SectorPdfSector } from '../../pdf-types'

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
  colSector: { width: '70%' },
  colValue: { width: '30%', textAlign: 'right' },
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
  cellValue: {
    fontSize: 9,
    color: '#1D2939',
    textAlign: 'right',
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
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D2939',
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
  data: SectorReportPdfData
}

export function SectorReportPdf({ data }: Props) {
  const renderSector = (sector: SectorPdfSector) => (
    <View key={sector.id} style={styles.tableRow} wrap={false}>
      <View style={styles.colSector}>
        <Text style={styles.cellText}>{sector.name}</Text>
      </View>
      <View style={styles.colValue}>
        <Text style={styles.cellValue}>
          {formatCurrencyToBrl(sector.value)}
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
          <Text style={styles.title}>Relatório</Text>
          <Text style={styles.subtitle}>Resultados por Setor</Text>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={styles.colSector}>
              <Text style={styles.tableHeaderCell}>SETOR</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.tableHeaderCell}>RESULTADO</Text>
            </View>
          </View>

          {/* Sector Rows */}
          {data.sectors.map(renderSector)}

          {/* Total Row */}
          <View style={styles.totalRow} wrap={false}>
            <View style={styles.colSector}>
              <Text style={styles.totalText}>TOTAL GERAL</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.totalValue}>
                {formatCurrencyToBrl(data.generalTotal)}
              </Text>
            </View>
          </View>
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
