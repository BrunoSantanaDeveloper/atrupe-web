'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

import type { NfsePreview } from '@/types/fiscal/nfse-preview'

/**
 * DANFSe de pré-visualização — SEM VALOR FISCAL.
 *
 * Mostra o RPS que seria enviado à prefeitura: prestador, tomador, serviço,
 * itens e valores. Não tem número de NFS-e nem código de verificação, porque
 * os dois só existem depois que a prefeitura aceita o RPS.
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
    fontSize: 7.5,
    color: cores.texto,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    backgroundColor: '#fff',
  },
  marcaDagua: {
    position: 'absolute',
    top: 320,
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
  quadro: { borderWidth: 1, borderColor: cores.borda, marginBottom: 5 },
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
  linhaTopo: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
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
  discriminacao: { fontSize: 7.5, lineHeight: 1.4 },
  rodape: {
    marginTop: 8,
    fontSize: 6,
    color: cores.rotulo,
    textAlign: 'center',
  },
})

const brl = (valor?: string | number | null) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor ?? 0) || 0)

const pct = (valor?: number | null) =>
  valor === null || valor === undefined
    ? 'Não informada'
    : `${Number(valor).toLocaleString('pt-BR')}%`

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

const COLUNAS = [
  { titulo: 'ITEM', largura: '7%' },
  { titulo: 'DESCRIÇÃO', largura: '43%' },
  { titulo: 'QTD', largura: '10%' },
  { titulo: 'V. UNIT.', largura: '13%' },
  { titulo: 'BASE', largura: '13%' },
  { titulo: 'ISS', largura: '14%' },
]

export function DanfsePreviewPdf({ previa }: { previa: NfsePreview }) {
  const doc = previa.documento
  const prest = previa.prestador ?? {}
  const toma = previa.tomador ?? {}
  const serv = previa.servico ?? {}
  const val = previa.valores ?? {}
  const homologacao = doc?.ambiente === 'HOMOLOGACAO'

  return (
    <Document title="Pré-visualização da NFS-e">
      <Page size="A4" style={styles.page}>
        <Text style={styles.marcaDagua} fixed>
          SEM VALOR FISCAL
        </Text>

        <Text style={styles.tarja}>
          PRÉ-VISUALIZAÇÃO — DOCUMENTO SEM VALOR FISCAL
          {homologacao ? ' — AMBIENTE DE HOMOLOGAÇÃO' : ''}
        </Text>
        <Text style={styles.subtarja}>
          Conferência antes da emissão. O RPS ainda não foi enviado à
          prefeitura, e o número da NFS-e e o código de verificação só existem
          depois que ela o aceita.
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
                rotulo="RPS PREVISTO"
                valor={doc.rpsPrevisto}
                largura="14%"
              />
              <Campo rotulo="SÉRIE" valor={doc.rpsSerie} largura="10%" />
              <Campo
                rotulo="Nº DA NFS-E"
                valor="Definido pela prefeitura"
                largura="24%"
              />
              <Campo
                rotulo="EMISSÃO PREVISTA"
                valor={
                  doc.dataEmissaoPrevista
                    ? new Date(doc.dataEmissaoPrevista).toLocaleString('pt-BR')
                    : undefined
                }
              />
              <Campo
                rotulo="AMBIENTE"
                valor={homologacao ? 'Homologação' : 'Produção'}
                largura="18%"
                ultimo
              />
            </View>
            <View style={styles.linhaTopo}>
              <Campo
                rotulo="COMPETÊNCIA"
                valor={
                  doc.dataCompetencia
                    ? new Date(doc.dataCompetencia).toLocaleDateString('pt-BR')
                    : undefined
                }
              />
              <Campo
                rotulo="LOCAL DA PRESTAÇÃO"
                valor={
                  doc.localPrestacao === 2
                    ? 'Fora do município do prestador'
                    : 'No município do prestador'
                }
              />
              <Campo
                rotulo="SIMPLES NACIONAL"
                valor={doc.optanteSimples === 1 ? 'Optante' : 'Não optante'}
              />
              <Campo
                rotulo="IND. DE OPERAÇÃO"
                valor={doc.cIndOp}
                largura="18%"
                ultimo
              />
            </View>
          </Quadro>
        )}

        <Quadro titulo="PRESTADOR DE SERVIÇOS">
          <View style={styles.linha}>
            <Campo rotulo="RAZÃO SOCIAL" valor={prest.xNome} />
            <Campo rotulo="CNPJ" valor={prest.CNPJ_prest} largura="22%" />
            <Campo
              rotulo="INSCRIÇÃO MUNICIPAL"
              valor={prest.IM}
              largura="18%"
              ultimo
            />
          </View>
          <View style={styles.linhaTopo}>
            <Campo
              rotulo="ENDEREÇO"
              valor={`${prest.xLgr ?? ''}, ${prest.nro ?? ''} — ${prest.xBairro ?? ''}`}
            />
            <Campo rotulo="MUNICÍPIO" valor={prest.xMun} largura="22%" />
            <Campo rotulo="UF" valor={prest.UF} largura="8%" ultimo />
          </View>
        </Quadro>

        <Quadro titulo="TOMADOR DE SERVIÇOS">
          <View style={styles.linha}>
            <Campo rotulo="RAZÃO SOCIAL" valor={toma.TomaRazaoSocial} />
            <Campo
              rotulo="CNPJ / CPF"
              valor={toma.TomaCNPJ ?? toma.TomaCPF}
              largura="22%"
              ultimo
            />
          </View>
          <View style={styles.linhaTopo}>
            <Campo
              rotulo="ENDEREÇO"
              valor={`${toma.TomaEndereco ?? ''}, ${toma.TomaNumero ?? ''} — ${toma.TomaBairro ?? ''}`}
            />
            <Campo rotulo="MUNICÍPIO" valor={toma.TomaxMun} largura="22%" />
            <Campo rotulo="UF" valor={toma.TomaUF} largura="8%" ultimo />
          </View>
        </Quadro>

        <Quadro titulo="DISCRIMINAÇÃO DOS SERVIÇOS">
          <View style={styles.linha}>
            <View style={styles.celulaFim}>
              <Text style={styles.discriminacao}>
                {serv.discriminacao || '—'}
              </Text>
            </View>
          </View>
          <View style={styles.linhaTopo}>
            <Campo
              rotulo="CÓDIGO DO SERVIÇO (LC 116)"
              valor={serv.codigoServico}
            />
            <Campo
              rotulo="MUNICÍPIO DE INCIDÊNCIA"
              valor={serv.codigoMunicipio}
            />
            <Campo rotulo="CNAE" valor={serv.cnae} />
            <Campo rotulo="NBS" valor={serv.nbs} ultimo />
          </View>
          <View style={styles.linhaTopo}>
            <Campo rotulo="TRIB. NACIONAL" valor={serv.codTribNacional} />
            <Campo rotulo="TRIB. MUNICÍPIO" valor={serv.codTribMunicipio} />
            <Campo rotulo="CST IBS/CBS" valor={serv.cstIbsCbs} />
            <Campo
              rotulo="CLASSIF. IBS/CBS"
              valor={serv.codClassificacao}
              ultimo
            />
          </View>
        </Quadro>

        {(previa.itens ?? []).length > 0 && (
          <Quadro titulo="ITENS">
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
            {(previa.itens ?? []).map((item, index) => (
              <View key={item.ItemSeq ?? index} style={styles.tr}>
                <Text style={[styles.td, { width: COLUNAS[0].largura }]}>
                  {item.ItemSeq ?? index + 1}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[1].largura }]}>
                  {item.ItemDescricao}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[2].largura }]}>
                  {Number(item.ItemQuantidade ?? 0).toLocaleString('pt-BR')}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[3].largura }]}>
                  {brl(item.ItemValorUnitario)}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[4].largura }]}>
                  {brl(item.ItemBaseCalculo)}
                </Text>
                <Text style={[styles.td, { width: COLUNAS[5].largura }]}>
                  {brl(item.ItemvIss)}
                </Text>
              </View>
            ))}
          </Quadro>
        )}

        <Quadro titulo="VALORES">
          <View style={styles.linha}>
            <Campo rotulo="VALOR DOS SERVIÇOS" valor={brl(val.valorServicos)} />
            <Campo rotulo="DEDUÇÕES" valor={brl(val.valorDeducoes)} />
            <Campo rotulo="BASE DE CÁLCULO" valor={brl(val.baseCalculo)} />
            <Campo rotulo="ALÍQUOTA ISS" valor={pct(val.aliquotaIss)} />
            <Campo rotulo="VALOR DO ISS" valor={brl(val.valorIss)} ultimo />
          </View>
          <View style={styles.linhaTopo}>
            <Campo
              rotulo="ISS RETIDO PELO TOMADOR"
              valor={val.issRetido ? 'Sim' : 'Não'}
            />
            <Campo
              rotulo="IBS / CBS"
              valor={val.ibsCbs ? 'Valores enviados' : 'Somente códigos'}
              ultimo
            />
          </View>
        </Quadro>

        {previa.avisos.length > 0 && (
          <Quadro titulo="OBSERVAÇÕES DA CONFERÊNCIA">
            <View style={styles.celulaFim}>
              {previa.avisos.map((aviso, i) => (
                <Text key={i} style={styles.aviso}>
                  • {aviso}
                </Text>
              ))}
            </View>
          </Quadro>
        )}

        <Text style={styles.rodape} fixed>
          Pré-visualização gerada pelo Atrupe. Não é documento fiscal e não
          substitui a NFS-e, que só existe depois de aceita pela prefeitura.
        </Text>
      </Page>
    </Document>
  )
}
