'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

import type { NfcePreview } from '@/types/fiscal/nfce-preview'

/**
 * Cupom de pré-visualização da NFC-e — SEM VALOR FISCAL.
 *
 * Formato de bobina de 80 mm, como o cupom que sai na impressora térmica,
 * para a conferência ser feita no mesmo formato em que o documento será
 * entregue ao consumidor. Não tem chave de acesso, protocolo nem QR Code:
 * os três só existem depois da autorização da SEFAZ.
 */

const LARGURA_BOBINA = 226 // 80 mm em pontos

const cores = {
  texto: '#0f172a',
  fraco: '#475569',
  alerta: '#b91c1c',
  linha: '#cbd5e1',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Courier',
    fontSize: 7,
    color: cores.texto,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  centro: { textAlign: 'center' },
  tarja: {
    borderWidth: 1,
    borderColor: cores.alerta,
    color: cores.alerta,
    padding: 4,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Courier-Bold',
  },
  titulo: {
    fontFamily: 'Courier-Bold',
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 2,
  },
  fraco: { color: cores.fraco, fontSize: 6.5 },
  divisor: {
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
    borderBottomStyle: 'dashed',
    marginVertical: 5,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  itemCabecalho: { fontFamily: 'Courier-Bold', fontSize: 6.5, marginBottom: 2 },
  itemNome: { fontSize: 7 },
  itemDetalhe: { fontSize: 6.5, color: cores.fraco },
  totalForte: { fontFamily: 'Courier-Bold', fontSize: 9 },
  bloqueio: {
    borderWidth: 1,
    borderColor: cores.alerta,
    padding: 4,
    marginBottom: 6,
  },
  bloqueioTitulo: {
    fontFamily: 'Courier-Bold',
    color: cores.alerta,
    fontSize: 7,
    marginBottom: 2,
  },
  aviso: { fontSize: 6, color: cores.fraco, marginBottom: 1 },
})

const brl = (valor?: string | number | null) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor ?? 0) || 0)

/** Formas de pagamento da tabela do layout fiscal. */
const FORMAS: Record<string, string> = {
  '01': 'Dinheiro',
  '02': 'Cheque',
  '03': 'Cartão de crédito',
  '04': 'Cartão de débito',
  '05': 'Crédito na loja',
  '10': 'Vale alimentação',
  '11': 'Vale refeição',
  '12': 'Vale presente',
  '13': 'Vale combustível',
  '15': 'Boleto',
  '16': 'Depósito',
  '17': 'PIX',
  '18': 'Transferência',
  '90': 'Sem pagamento',
  '99': 'Outros',
}

function Divisor() {
  return <View style={styles.divisor} />
}

export function CupomPreviewPdf({ previa }: { previa: NfcePreview }) {
  const doc = previa.documento
  const emit = previa.emitente ?? {}
  const end = emit.enderEmit ?? {}
  const totais = previa.totais ?? {}
  const homologacao = doc?.ambiente !== 'PRODUCAO'

  return (
    <Document title="Pré-visualização da NFC-e">
      {/* Altura generosa: a bobina é contínua, então o corte real fica por
          conta da impressora. */}
      <Page size={[LARGURA_BOBINA, 800]} style={styles.page}>
        <Text style={styles.tarja}>
          PRÉ-VISUALIZAÇÃO{'\n'}SEM VALOR FISCAL
          {homologacao ? '\nAMBIENTE DE HOMOLOGAÇÃO' : ''}
        </Text>

        {previa.bloqueios.length > 0 && (
          <View style={styles.bloqueio}>
            <Text style={styles.bloqueioTitulo}>NÃO PODE SER EMITIDA:</Text>
            {previa.bloqueios.map((bloqueio, i) => (
              <Text key={i} style={styles.aviso}>
                - {bloqueio}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.titulo}>{emit.xNome ?? '—'}</Text>
        <Text style={[styles.centro, styles.fraco]}>
          CNPJ {emit.CNPJ_emit ?? '—'}
          {emit.IE ? ` · IE ${emit.IE}` : ''}
        </Text>
        <Text style={[styles.centro, styles.fraco]}>
          {end.xLgr ?? ''}, {end.nro ?? ''} - {end.xBairro ?? ''}
        </Text>
        <Text style={[styles.centro, styles.fraco]}>
          {end.xMun ?? ''} / {end.UF ?? ''}
        </Text>

        <Divisor />

        <Text style={styles.centro}>
          DANFE NFC-e — Documento Auxiliar da Nota Fiscal de Consumidor
          Eletrônica
        </Text>
        <Text style={[styles.centro, styles.fraco]}>
          Nº previsto {doc?.numeroPrevisto ?? '—'} · Série {doc?.serie ?? '—'}
        </Text>
        {doc?.contingencia && (
          <Text style={[styles.centro, styles.fraco]}>
            EMISSÃO EM CONTINGÊNCIA
          </Text>
        )}

        <Divisor />

        <View style={styles.linha}>
          <Text style={styles.itemCabecalho}>ITEM / DESCRIÇÃO</Text>
          <Text style={styles.itemCabecalho}>VALOR</Text>
        </View>

        {(previa.itens ?? []).map((item) => (
          <View key={item.sequencia} wrap={false}>
            <View style={styles.linha}>
              <Text style={styles.itemNome}>
                {item.sequencia} {item.xProd}
              </Text>
              <Text style={styles.itemNome}>{brl(item.vProd)}</Text>
            </View>
            <Text style={styles.itemDetalhe}>
              {Number(item.qCOM ?? 0).toLocaleString('pt-BR')} {item.uCOM} x{' '}
              {brl(item.vUnCom)} · NCM {item.NCM} · CFOP {item.CFOP}
              {item.tributos?.ICMS?.CST
                ? ` · CST ${item.tributos.ICMS.CST}`
                : ''}
            </Text>
          </View>
        ))}

        <Divisor />

        <View style={styles.linha}>
          <Text>Subtotal</Text>
          <Text>{brl(totais.ICMStot?.vProd_ttlnfe)}</Text>
        </View>
        <View style={styles.linha}>
          <Text>Desconto</Text>
          <Text>{brl(totais.ICMStot?.vDesc_ttlnfe)}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.totalForte}>TOTAL</Text>
          <Text style={styles.totalForte}>{brl(totais.ICMStot?.vNF)}</Text>
        </View>

        <Divisor />

        <Text style={styles.itemCabecalho}>FORMA DE PAGAMENTO</Text>
        {(previa.pagamentos ?? []).map((pag, i) => (
          <View key={i} style={styles.linha}>
            <Text>{FORMAS[pag.tPag ?? ''] ?? pag.tPag}</Text>
            <Text>{brl(pag.vPag)}</Text>
          </View>
        ))}
        {!!totais.valorTroco && (
          <View style={styles.linha}>
            <Text>Troco</Text>
            <Text>{brl(totais.valorTroco)}</Text>
          </View>
        )}

        <Divisor />

        <Text style={styles.centro}>
          {previa.consumidor
            ? `CONSUMIDOR: ${previa.consumidor.xNome_dest ?? ''} ${
                previa.consumidor.CPF_dest ?? previa.consumidor.CNPJ_dest ?? ''
              }`
            : 'CONSUMIDOR NÃO IDENTIFICADO'}
        </Text>

        <Divisor />

        <Text style={[styles.centro, styles.fraco]}>
          Sem chave de acesso, protocolo ou QR Code: os três só existem depois
          da autorização da SEFAZ.
        </Text>

        {previa.avisos.length > 0 && (
          <>
            <Divisor />
            {previa.avisos.map((aviso, i) => (
              <Text key={i} style={styles.aviso}>
                - {aviso}
              </Text>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
