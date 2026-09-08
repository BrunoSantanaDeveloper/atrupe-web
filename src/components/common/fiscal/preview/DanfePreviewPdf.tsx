'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

import type { NfePreview } from '@/types/fiscal/nfe-preview'

/**
 * DANFE de pré-visualização — SEM VALOR FISCAL.
 *
 * Reproduz os quadros do DANFE (emitente, destinatário, cálculo do imposto,
 * itens, transporte, dados adicionais) a partir do payload que seria enviado
 * ao provedor, para o usuário conferir a nota antes de autorizar. Não tem
 * chave de acesso, protocolo nem código de barras: não é um documento fiscal
 * e não deve poder ser confundido com um.
 */

const cores = {
  borda: '#94a3b8',
  texto: '#0f172a',
  rotulo: '#475569',
  faixa: '#f1f5f9',
  alerta: '#b91c1c',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: cores.texto,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    backgroundColor: '#fff',
  },
  marcaDagua: {
    position: 'absolute',
    top: 300,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 40,
    color: '#e2e8f0',
    transform: 'rotate(-20deg)',
  },
  tarja: {
    borderWidth: 1,
    borderColor: cores.alerta,
    color: cores.alerta,
    padding: 5,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  subtarja: {
    textAlign: 'center',
    fontSize: 7,
    color: cores.rotulo,
    marginBottom: 8,
  },
  quadro: {
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: 5,
  },
  quadroTitulo: {
    backgroundColor: cores.faixa,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  linha: { flexDirection: 'row' },
  celula: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: cores.borda,
    flexGrow: 1,
  },
  celulaFim: { paddingVertical: 3, paddingHorizontal: 4, flexGrow: 1 },
  rotulo: { fontSize: 5.5, color: cores.rotulo, marginBottom: 1 },
  valor: { fontSize: 7.5 },
  thead: {
    flexDirection: 'row',
    backgroundColor: cores.faixa,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  th: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 3,
    color: cores.rotulo,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  td: { fontSize: 6.5, paddingVertical: 3, paddingHorizontal: 3 },
  bloqueio: {
    borderWidth: 1,
    borderColor: cores.alerta,
    backgroundColor: '#fef2f2',
    padding: 5,
    marginBottom: 6,
  },
  bloqueioTitulo: {
    fontFamily: 'Helvetica-Bold',
    color: cores.alerta,
    marginBottom: 2,
  },
  aviso: { fontSize: 6.5, color: cores.rotulo, marginBottom: 1 },
  rodape: {
    marginTop: 8,
    fontSize: 6,
    color: cores.rotulo,
    textAlign: 'center',
  },
})

/**
 * Os valores do payload já vêm em reais (o layout do provedor usa decimais),
 * então não dá para reaproveitar o formatCurrencyToBrl do app, que recebe
 * centavos.
 */
const brl = (valor?: string | number | null) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor ?? 0) || 0)

/** Larguras da tabela de itens, em porcentagem, somando 100. */
const COLUNAS = [
  { titulo: 'CÓD.', largura: '8%' },
  { titulo: 'DESCRIÇÃO', largura: '27%' },
  { titulo: 'NCM', largura: '8%' },
  { titulo: 'CFOP', largura: '6%' },
  { titulo: 'CST', largura: '6%' },
  { titulo: 'UN', largura: '5%' },
  { titulo: 'QTD', largura: '8%' },
  { titulo: 'V. UNIT.', largura: '10%' },
  { titulo: 'V. TOTAL', largura: '10%' },
  { titulo: 'V. ICMS', largura: '12%' },
]

function Campo({
  rotulo,
  valor,
  largura,
  ultimo,
}: {
  rotulo: string
  valor?: string | number | null
  largura?: string
  ultimo?: boolean
}) {
  return (
    <View
      style={[
        ultimo ? styles.celulaFim : styles.celula,
        largura ? { width: largura, flexGrow: 0 } : {},
      ]}
    >
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>
        {valor === null || valor === undefined || valor === '' ? '—' : valor}
      </Text>
    </View>
  )
}

function Quadro({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.quadro}>
      <Text style={styles.quadroTitulo}>{titulo}</Text>
      {children}
    </View>
  )
}

const TIPO_NOTA: Record<number, string> = { 0: 'Entrada', 1: 'Saída' }
const FINALIDADE: Record<number, string> = {
  1: 'Normal',
  2: 'Complementar',
  3: 'Ajuste',
  4: 'Devolução',
}

export function DanfePreviewPdf({ previa }: { previa: NfePreview }) {
  const doc = previa.documento
  const emit = previa.emitente ?? {}
  const dest = previa.destinatario ?? {}
  const endEmit = emit.enderEmit ?? {}
  const endDest = dest.enderDest ?? {}
  const totais = previa.totais?.ICMStot ?? {}
  const homologacao = doc?.ambiente === 'HOMOLOGACAO'

  return (
    <Document title="Pré-visualização da NF-e">
      <Page size="A4" style={styles.page}>
        <Text style={styles.marcaDagua} fixed>
          SEM VALOR FISCAL
        </Text>

        <Text style={styles.tarja}>
          PRÉ-VISUALIZAÇÃO — DOCUMENTO SEM VALOR FISCAL
          {homologacao ? ' — AMBIENTE DE HOMOLOGAÇÃO' : ''}
        </Text>
        <Text style={styles.subtarja}>
          Conferência antes da emissão. A nota ainda não foi transmitida à SEFAZ
          e não tem chave de acesso nem protocolo.
        </Text>

        {previa.bloqueios.length > 0 && (
          <View style={styles.bloqueio}>
            <Text style={styles.bloqueioTitulo}>
              A nota não pode ser emitida assim:
            </Text>
            {previa.bloqueios.map((bloqueio, i) => (
              <Text key={i} style={styles.aviso}>
                • {bloqueio}
              </Text>
            ))}
          </View>
        )}

        {doc && (
          <Quadro titulo="IDENTIFICAÇÃO">
            <View style={styles.linha}>
              <Campo
                rotulo="Nº PREVISTO"
                valor={doc.numeroPrevisto}
                largura="14%"
              />
              <Campo rotulo="SÉRIE" valor={doc.serie} largura="9%" />
              <Campo rotulo="MODELO" valor={doc.modelo} largura="9%" />
              <Campo
                rotulo="TIPO"
                valor={TIPO_NOTA[doc.tipo] ?? doc.tipo}
                largura="12%"
              />
              <Campo
                rotulo="FINALIDADE"
                valor={FINALIDADE[doc.finalidade] ?? doc.finalidade}
                largura="16%"
              />
              <Campo
                rotulo="EMISSÃO PREVISTA"
                valor={new Date(doc.dataEmissaoPrevista).toLocaleString(
                  'pt-BR',
                )}
                ultimo
              />
            </View>
            <View
              style={[
                styles.linha,
                { borderTopWidth: 1, borderTopColor: cores.borda },
              ]}
            >
              <Campo
                rotulo="NATUREZA DA OPERAÇÃO"
                valor={doc.naturezaOperacao}
              />
              <Campo
                rotulo="AMBIENTE"
                valor={homologacao ? 'Homologação' : 'Produção'}
                largura="20%"
                ultimo
              />
            </View>
          </Quadro>
        )}

        <Quadro titulo="EMITENTE">
          <View style={styles.linha}>
            <Campo rotulo="RAZÃO SOCIAL" valor={emit.xNome} />
            <Campo rotulo="CNPJ" valor={emit.CNPJ_emit} largura="20%" />
            <Campo rotulo="IE" valor={emit.IE} largura="18%" ultimo />
          </View>
          <View
            style={[
              styles.linha,
              { borderTopWidth: 1, borderTopColor: cores.borda },
            ]}
          >
            <Campo
              rotulo="ENDEREÇO"
              valor={`${endEmit.xLgr ?? ''}, ${endEmit.nro ?? ''} — ${endEmit.xBairro ?? ''}`}
            />
            <Campo rotulo="MUNICÍPIO" valor={endEmit.xMun} largura="22%" />
            <Campo rotulo="UF" valor={endEmit.UF} largura="8%" ultimo />
          </View>
        </Quadro>

        <Quadro titulo="DESTINATÁRIO / REMETENTE">
          <View style={styles.linha}>
            <Campo rotulo="NOME" valor={dest.xNome_dest} />
            <Campo
              rotulo="CNPJ / CPF"
              valor={dest.CNPJ_dest ?? dest.CPF_dest ?? dest.idEstrangeiro}
              largura="22%"
              ultimo
            />
          </View>
          <View
            style={[
              styles.linha,
              { borderTopWidth: 1, borderTopColor: cores.borda },
            ]}
          >
            <Campo
              rotulo="ENDEREÇO"
              valor={`${endDest.xLgr_dest ?? ''}, ${endDest.nro_dest ?? ''} — ${endDest.xBairro_dest ?? ''}`}
            />
            <Campo rotulo="MUNICÍPIO" valor={endDest.xMun_dest} largura="22%" />
            <Campo rotulo="UF" valor={endDest.UF_dest} largura="8%" ultimo />
          </View>
        </Quadro>

        <Quadro titulo="CÁLCULO DO IMPOSTO">
          <View style={styles.linha}>
            <Campo rotulo="BASE ICMS" valor={brl(totais.vBC_ttlnfe)} />
            <Campo rotulo="VALOR ICMS" valor={brl(totais.vICMS_ttlnfe)} />
            <Campo rotulo="BASE ICMS ST" valor={brl(totais.vBCST_ttlnfe)} />
            <Campo rotulo="VALOR IPI" valor={brl(totais.vIPI_ttlnfe)} ultimo />
          </View>
          <View
            style={[
              styles.linha,
              { borderTopWidth: 1, borderTopColor: cores.borda },
            ]}
          >
            <Campo
              rotulo="VALOR DOS PRODUTOS"
              valor={brl(totais.vProd_ttlnfe)}
            />
            <Campo rotulo="DESCONTO" valor={brl(totais.vDesc_ttlnfe)} />
            <Campo rotulo="PIS" valor={brl(totais.vPIS_ttlnfe)} />
            <Campo rotulo="COFINS" valor={brl(totais.vCOFINS_ttlnfe)} />
            <Campo rotulo="TOTAL DA NOTA" valor={brl(totais.vNF)} ultimo />
          </View>
        </Quadro>

        <Quadro titulo="DADOS DOS PRODUTOS / SERVIÇOS">
          <View style={styles.thead}>
            {COLUNAS.map((coluna) => (
              <Text
                key={coluna.titulo}
                style={[styles.th, { width: coluna.largura }]}
              >
                {coluna.titulo}
              </Text>
            ))}
          </View>
          {(previa.itens ?? []).map((item) => {
            const icms = item.tributos?.ICMS ?? {}
            return (
              <View key={item.sequencia} style={styles.tr}>
                <Text style={[styles.td, { width: COLUNAS[0].largura }]}>
                  {item.cProd}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[1].largura }]}>
                  {item.xProd}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[2].largura }]}>
                  {item.NCM}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[3].largura }]}>
                  {item.CFOP}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[4].largura }]}>
                  {icms.CST ?? '—'}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[5].largura }]}>
                  {item.uCOM}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[6].largura }]}>
                  {Number(item.qCOM ?? 0).toLocaleString('pt-BR')}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[7].largura }]}>
                  {brl(item.vUnCom)}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[8].largura }]}>
                  {brl(item.vProd)}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[9].largura }]}>
                  {icms.vICMS_icms !== undefined ? brl(icms.vICMS_icms) : '—'}
                </Text>
              </View>
            )
          })}
        </Quadro>

        <Quadro titulo="TRANSPORTE E PAGAMENTO">
          <View style={styles.linha}>
            <Campo
              rotulo="MODALIDADE DO FRETE"
              valor={previa.transporte?.modFrete}
            />
            <Campo rotulo="FORMA DE PAGAMENTO" valor={previa.pagamento?.tPag} />
            <Campo
              rotulo="VALOR PAGO"
              valor={brl(previa.pagamento?.vPag)}
              ultimo
            />
          </View>
          {(previa.duplicatas ?? []).length > 0 && (
            <View
              style={[
                styles.linha,
                { borderTopWidth: 1, borderTopColor: cores.borda },
              ]}
            >
              <Campo
                rotulo="DUPLICATAS"
                valor={(previa.duplicatas ?? [])
                  .map((d) => `${d.nDup} ${d.dVenc} ${brl(d.vDup)}`)
                  .join('   |   ')}
                ultimo
              />
            </View>
          )}
        </Quadro>

        <Quadro titulo="DADOS ADICIONAIS">
          <View style={styles.linha}>
            <Campo
              rotulo="INFORMAÇÕES COMPLEMENTARES"
              valor={previa.informacoesComplementares}
              ultimo
            />
          </View>
          {previa.avisos.length > 0 && (
            <View
              style={[
                styles.celulaFim,
                { borderTopWidth: 1, borderTopColor: cores.borda },
              ]}
            >
              <Text style={styles.rotulo}>OBSERVAÇÕES DA CONFERÊNCIA</Text>
              {previa.avisos.map((aviso, i) => (
                <Text key={i} style={styles.aviso}>
                  • {aviso}
                </Text>
              ))}
            </View>
          )}
        </Quadro>

        <Text style={styles.rodape} fixed>
          Pré-visualização gerada pelo Atrupe. Não é documento fiscal e não
          substitui a DANFE, que só existe depois da autorização da SEFAZ.
        </Text>
      </Page>
    </Document>
  )
}
