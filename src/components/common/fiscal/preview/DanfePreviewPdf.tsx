'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

import type { NfePreview, NfePreviewItem } from '@/types/fiscal/nfe-preview'

/**
 * DANFE de pré-visualização — SEM VALOR FISCAL.
 *
 * Reproduz o layout do DANFE em retrato (Manual de Orientação do Contribuinte,
 * Anexo I): canhoto, cabeçalho com o quadro do emitente e o da chave de
 * acesso, destinatário, fatura, cálculo do imposto, transportador, quadro de
 * produtos e dados adicionais — na mesma ordem e com os mesmos rótulos do
 * documento impresso, para a conferência ser feita onde o usuário já procura.
 *
 * O que não existe antes da autorização fica explícito no lugar em que
 * apareceria: chave de acesso, código de barras e protocolo. Sem eles, a
 * folha não pode ser confundida com um DANFE válido.
 */

const cores = {
  borda: '#111827',
  texto: '#111827',
  rotulo: '#4b5563',
  faixa: '#f3f4f6',
  alerta: '#b91c1c',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 6.5,
    color: cores.texto,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    backgroundColor: '#fff',
  },
  marcaDagua: {
    position: 'absolute',
    top: 360,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 46,
    color: '#e5e7eb',
    transform: 'rotate(-24deg)',
  },

  // Estrutura de quadros do DANFE
  quadro: { borderWidth: 0.7, borderColor: cores.borda },
  quadroEspaco: { marginTop: 3 },
  tituloSecao: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    marginTop: 3,
    marginBottom: 1,
  },
  linha: { flexDirection: 'row' },
  linhaDivisor: { borderTopWidth: 0.7, borderTopColor: cores.borda },
  campo: {
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderRightWidth: 0.7,
    borderRightColor: cores.borda,
    justifyContent: 'flex-start',
  },
  campoFim: { paddingVertical: 2, paddingHorizontal: 3 },
  rotulo: { fontSize: 4.8, color: cores.rotulo },
  valor: { fontSize: 7 },
  valorForte: { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
  centro: { textAlign: 'center' },
  direita: { textAlign: 'right' },

  // Canhoto
  corte: {
    borderTopWidth: 0.7,
    borderTopColor: cores.borda,
    borderTopStyle: 'dashed',
    marginVertical: 4,
  },
  canhotoTexto: { fontSize: 5.5, paddingVertical: 3, paddingHorizontal: 3 },

  // Cabeçalho
  danfeTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    textAlign: 'center',
  },
  danfeSub: { fontSize: 5.2, textAlign: 'center', color: cores.rotulo },
  entradaSaida: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  quadradoTipo: {
    borderWidth: 0.7,
    borderColor: cores.borda,
    width: 12,
    height: 11,
    marginLeft: 4,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingTop: 1,
  },
  numeroNota: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
  },
  chaveVazia: {
    borderWidth: 0.7,
    borderColor: cores.alerta,
    borderStyle: 'dashed',
    paddingVertical: 6,
    marginBottom: 2,
    textAlign: 'center',
    fontSize: 6,
    color: cores.alerta,
  },

  // Tabela de produtos
  thead: {
    flexDirection: 'row',
    backgroundColor: cores.faixa,
    borderBottomWidth: 0.7,
    borderBottomColor: cores.borda,
  },
  th: {
    fontSize: 4.6,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 2,
    paddingHorizontal: 2,
    color: cores.rotulo,
    borderRightWidth: 0.5,
    borderRightColor: cores.borda,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 0.4,
    borderBottomColor: '#9ca3af',
  },
  td: {
    fontSize: 5.8,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRightWidth: 0.4,
    borderRightColor: '#d1d5db',
  },

  // Avisos
  tarja: {
    borderWidth: 0.7,
    borderColor: cores.alerta,
    color: cores.alerta,
    paddingVertical: 3,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  bloqueio: {
    borderWidth: 0.7,
    borderColor: cores.alerta,
    backgroundColor: '#fef2f2',
    padding: 4,
    marginBottom: 4,
  },
  bloqueioTitulo: {
    fontFamily: 'Helvetica-Bold',
    color: cores.alerta,
    fontSize: 6.5,
    marginBottom: 1,
  },
  aviso: { fontSize: 5.6, color: cores.rotulo, marginBottom: 0.5 },
  rodape: {
    marginTop: 5,
    fontSize: 5.2,
    color: cores.rotulo,
    textAlign: 'center',
  },
})

/** Os valores do payload já vêm em reais; o app formata centavos em outro lugar. */
const brl = (valor?: string | number | null) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor ?? 0) || 0)

const num = (valor?: string | number | null, casas = 4) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(Number(valor ?? 0) || 0)

const dataHora = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : ''

const cep = (valor?: number) => {
  const digitos = String(valor ?? '').padStart(8, '0')
  return valor ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : ''
}

const documento = (valor?: string) => valor ?? ''

const MOD_FRETE: Record<string, string> = {
  '0': '0-Emitente',
  '1': '1-Destinatário',
  '2': '2-Terceiros',
  '3': '3-Próprio/Rem.',
  '4': '4-Próprio/Dest.',
  '9': '9-Sem frete',
}

/** Campo rotulado do DANFE: rótulo miúdo em cima, valor embaixo. */
function Campo({
  rotulo,
  valor,
  largura,
  ultimo,
  alinhamento,
  forte,
}: {
  rotulo?: string
  valor?: string | number | null
  largura: string
  ultimo?: boolean
  alinhamento?: 'centro' | 'direita'
  forte?: boolean
}) {
  const estiloValor = [
    forte ? styles.valorForte : styles.valor,
    alinhamento === 'centro' ? styles.centro : {},
    alinhamento === 'direita' ? styles.direita : {},
  ]
  return (
    <View
      style={[
        ultimo ? styles.campoFim : styles.campo,
        { width: largura, flexGrow: 0 },
      ]}
    >
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
      <Text style={estiloValor}>
        {valor === null || valor === undefined || valor === '' ? ' ' : valor}
      </Text>
    </View>
  )
}

/** Colunas do quadro "DADOS DO PRODUTO / SERVIÇO", somando 100%. */
const COLUNAS: Array<{
  titulo: string
  largura: string
  alinhamento?: 'centro' | 'direita'
  valor: (item: NfePreviewItem) => string
}> = [
  { titulo: 'CÓDIGO', largura: '7%', valor: (i) => i.cProd ?? '' },
  {
    titulo: 'DESCRIÇÃO DO PRODUTO / SERVIÇO',
    largura: '24%',
    valor: (i) => i.xProd ?? '',
  },
  {
    titulo: 'NCM/SH',
    largura: '7%',
    alinhamento: 'centro',
    valor: (i) => i.NCM ?? '',
  },
  {
    titulo: 'CST',
    largura: '4%',
    alinhamento: 'centro',
    valor: (i) =>
      `${i.tributos?.ICMS?.orig ?? ''}${i.tributos?.ICMS?.CST ?? ''}`,
  },
  {
    titulo: 'CFOP',
    largura: '4%',
    alinhamento: 'centro',
    valor: (i) => String(i.CFOP ?? ''),
  },
  {
    titulo: 'UNID',
    largura: '4%',
    alinhamento: 'centro',
    valor: (i) => i.uCOM ?? '',
  },
  {
    titulo: 'QUANT',
    largura: '6%',
    alinhamento: 'direita',
    valor: (i) => num(i.qCOM, 2),
  },
  {
    titulo: 'VALOR UNIT',
    largura: '8%',
    alinhamento: 'direita',
    valor: (i) => brl(i.vUnCom),
  },
  {
    titulo: 'VALOR TOTAL',
    largura: '8%',
    alinhamento: 'direita',
    valor: (i) => brl(i.vProd),
  },
  {
    titulo: 'B.CÁLC ICMS',
    largura: '7%',
    alinhamento: 'direita',
    valor: (i) => brl(i.tributos?.ICMS?.vBC),
  },
  {
    titulo: 'VALOR ICMS',
    largura: '6%',
    alinhamento: 'direita',
    valor: (i) => brl(i.tributos?.ICMS?.vICMS_icms),
  },
  {
    titulo: 'VALOR IPI',
    largura: '6%',
    alinhamento: 'direita',
    valor: (i) => brl(i.tributos?.IPI?.CSTIPI?.vIPI),
  },
  {
    titulo: 'ALÍQ ICMS',
    largura: '4.5%',
    alinhamento: 'direita',
    valor: (i) => num(i.tributos?.ICMS?.pICMS, 2),
  },
  {
    titulo: 'ALÍQ IPI',
    largura: '4.5%',
    alinhamento: 'direita',
    valor: (i) => num(i.tributos?.IPI?.CSTIPI?.pIPI, 2),
  },
]

export function DanfePreviewPdf({ previa }: { previa: NfePreview }) {
  const doc = previa.documento
  const emit = previa.emitente ?? {}
  const dest = previa.destinatario ?? {}
  const endEmit = emit.enderEmit ?? {}
  const endDest = dest.enderDest ?? {}
  const t = previa.totais?.ICMStot ?? {}
  const homologacao = doc?.ambiente === 'HOMOLOGACAO'
  const itens = previa.itens ?? []
  const duplicatas = previa.duplicatas ?? []

  const numeroSerie = `Nº ${String(doc?.numeroPrevisto ?? '').padStart(9, '0')}
SÉRIE ${doc?.serie ?? ''}`

  const enderecoEmit = [
    [endEmit.xLgr, endEmit.nro].filter(Boolean).join(', '),
    endEmit.xBairro,
    [endEmit.xMun, endEmit.UF].filter(Boolean).join(' / '),
    cep(endEmit.CEP),
  ]
    .filter(Boolean)
    .join(' - ')

  return (
    <Document title="Pré-visualização da NF-e (DANFE sem valor fiscal)">
      <Page size="A4" style={styles.page}>
        <Text style={styles.marcaDagua} fixed>
          SEM VALOR FISCAL
        </Text>

        <Text style={styles.tarja}>
          PRÉ-VISUALIZAÇÃO — DOCUMENTO SEM VALOR FISCAL
          {homologacao ? ' — AMBIENTE DE HOMOLOGAÇÃO' : ''}
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

        {/* ── CANHOTO ──────────────────────────────────────────────── */}
        <View style={styles.quadro}>
          <View style={styles.linha}>
            <View style={[styles.campo, { width: '78%', flexGrow: 0 }]}>
              <Text style={styles.canhotoTexto}>
                RECEBEMOS DE {emit.xNome ?? ''} OS PRODUTOS CONSTANTES DA NOTA
                FISCAL INDICADA AO LADO
              </Text>
            </View>
            <View style={[styles.campoFim, { width: '22%', flexGrow: 0 }]}>
              <Text style={[styles.centro, { fontSize: 6 }]}>NF-e</Text>
              <Text style={[styles.numeroNota, { marginTop: 1 }]}>
                {numeroSerie}
              </Text>
            </View>
          </View>
          <View style={[styles.linha, styles.linhaDivisor]}>
            <Campo rotulo="DATA DE RECEBIMENTO" valor=" " largura="26%" />
            <Campo
              rotulo="IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR"
              valor=" "
              largura="52%"
            />
            <Campo rotulo=" " valor=" " largura="22%" ultimo />
          </View>
        </View>

        <View style={styles.corte} />

        {/* ── CABEÇALHO ────────────────────────────────────────────── */}
        <View style={styles.quadro}>
          <View style={styles.linha}>
            {/* Emitente */}
            <View style={[styles.campo, { width: '38%', flexGrow: 0 }]}>
              <Text style={styles.rotulo}>IDENTIFICAÇÃO DO EMITENTE</Text>
              <Text style={[styles.valorForte, { marginTop: 3 }]}>
                {emit.xNome ?? '—'}
              </Text>
              <Text style={[styles.valor, { marginTop: 2 }]}>
                {enderecoEmit}
              </Text>
              {endEmit.fone ? (
                <Text style={styles.valor}>Fone: {endEmit.fone}</Text>
              ) : null}
              <Text style={[styles.valor, { marginTop: 2 }]}>
                CNPJ: {documento(emit.CNPJ_emit)}
              </Text>
            </View>

            {/* DANFE */}
            <View style={[styles.campo, { width: '27%', flexGrow: 0 }]}>
              <Text style={styles.danfeTitulo}>DANFE</Text>
              <Text style={styles.danfeSub}>
                Documento Auxiliar da{'\n'}Nota Fiscal Eletrônica
              </Text>
              <View style={styles.entradaSaida}>
                <Text style={{ fontSize: 5.5 }}>
                  0 - ENTRADA{'\n'}1 - SAÍDA
                </Text>
                <Text style={styles.quadradoTipo}>{doc?.tipo ?? ''}</Text>
              </View>
              <Text style={styles.numeroNota}>{numeroSerie}</Text>
              <Text style={[styles.danfeSub, { marginTop: 2 }]}>FOLHA 1/1</Text>
            </View>

            {/* Chave de acesso */}
            <View style={[styles.campoFim, { width: '35%', flexGrow: 0 }]}>
              <View style={styles.chaveVazia}>
                <Text>CÓDIGO DE BARRAS E CHAVE DE ACESSO</Text>
                <Text style={{ marginTop: 2 }}>
                  Gerados pela SEFAZ na autorização
                </Text>
              </View>
              <Text style={styles.rotulo}>
                CONSULTA DE AUTENTICIDADE NO PORTAL NACIONAL DA NF-e
              </Text>
              <Text style={{ fontSize: 5.5 }}>
                www.nfe.fazenda.gov.br/portal
              </Text>
            </View>
          </View>

          <View style={[styles.linha, styles.linhaDivisor]}>
            <Campo
              rotulo="NATUREZA DA OPERAÇÃO"
              valor={doc?.naturezaOperacao}
              largura="65%"
            />
            <Campo
              rotulo="PROTOCOLO DE AUTORIZAÇÃO DE USO"
              valor="Emitido na autorização"
              largura="35%"
              ultimo
            />
          </View>

          <View style={[styles.linha, styles.linhaDivisor]}>
            <Campo rotulo="INSCRIÇÃO ESTADUAL" valor={emit.IE} largura="33%" />
            <Campo
              rotulo="INSC. ESTADUAL DO SUBST. TRIBUTÁRIO"
              valor=" "
              largura="34%"
            />
            <Campo
              rotulo="CNPJ"
              valor={documento(emit.CNPJ_emit)}
              largura="33%"
              ultimo
            />
          </View>
        </View>

        {/* ── DESTINATÁRIO / REMETENTE ─────────────────────────────── */}
        <Text style={styles.tituloSecao}>DESTINATÁRIO / REMETENTE</Text>
        <View style={styles.quadro}>
          <View style={styles.linha}>
            <Campo
              rotulo="NOME / RAZÃO SOCIAL"
              valor={dest.xNome_dest}
              largura="58%"
            />
            <Campo
              rotulo="CNPJ / CPF"
              valor={
                dest.CNPJ_dest ?? dest.CPF_dest ?? dest.idEstrangeiro ?? ''
              }
              largura="24%"
            />
            <Campo
              rotulo="DATA DA EMISSÃO"
              valor={dataHora(doc?.dataEmissaoPrevista)}
              largura="18%"
              ultimo
            />
          </View>
          <View style={[styles.linha, styles.linhaDivisor]}>
            <Campo
              rotulo="ENDEREÇO"
              valor={[endDest.xLgr_dest, endDest.nro_dest]
                .filter(Boolean)
                .join(', ')}
              largura="44%"
            />
            <Campo
              rotulo="BAIRRO / DISTRITO"
              valor={endDest.xBairro_dest}
              largura="24%"
            />
            <Campo rotulo="CEP" valor={cep(endDest.CEP_dest)} largura="14%" />
            <Campo
              rotulo="DATA DA SAÍDA / ENTRADA"
              valor={dataHora(doc?.dataSaidaEntrada)}
              largura="18%"
              ultimo
            />
          </View>
          <View style={[styles.linha, styles.linhaDivisor]}>
            <Campo rotulo="MUNICÍPIO" valor={endDest.xMun_dest} largura="34%" />
            <Campo
              rotulo="FONE / FAX"
              valor={endDest.fone_dest}
              largura="16%"
            />
            <Campo
              rotulo="UF"
              valor={endDest.UF_dest}
              largura="8%"
              alinhamento="centro"
            />
            <Campo
              rotulo="INSCRIÇÃO ESTADUAL"
              valor={dest.IE_dest}
              largura="24%"
            />
            <Campo rotulo="HORA DA SAÍDA" valor=" " largura="18%" ultimo />
          </View>
        </View>

        {/* ── FATURA / DUPLICATAS ──────────────────────────────────── */}
        {duplicatas.length > 0 && (
          <>
            <Text style={styles.tituloSecao}>FATURA / DUPLICATAS</Text>
            <View style={styles.quadro}>
              <View style={styles.linha}>
                {duplicatas.slice(0, 4).map((dup, i, lista) => (
                  <Campo
                    key={i}
                    rotulo={`DUPLICATA ${dup.nDup ?? i + 1}`}
                    valor={`Venc. ${dup.dVenc ?? ''}  ${brl(dup.vDup)}`}
                    largura={`${100 / lista.length}%`}
                    ultimo={i === lista.length - 1}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── CÁLCULO DO IMPOSTO ───────────────────────────────────── */}
        <Text style={styles.tituloSecao}>CÁLCULO DO IMPOSTO</Text>
        <View style={styles.quadro}>
          <View style={styles.linha}>
            <Campo
              rotulo="BASE DE CÁLCULO DO ICMS"
              valor={brl(t.vBC_ttlnfe)}
              largura="20%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR DO ICMS"
              valor={brl(t.vICMS_ttlnfe)}
              largura="20%"
              alinhamento="direita"
            />
            <Campo
              rotulo="BASE DE CÁLC. ICMS ST"
              valor={brl(t.vBCST_ttlnfe)}
              largura="20%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR DO ICMS ST"
              valor={brl(t.vST_ttlnfe)}
              largura="20%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR TOTAL DOS PRODUTOS"
              valor={brl(t.vProd_ttlnfe)}
              largura="20%"
              alinhamento="direita"
              ultimo
            />
          </View>
          <View style={[styles.linha, styles.linhaDivisor]}>
            <Campo
              rotulo="VALOR DO FRETE"
              valor={brl(t.vFrete_ttlnfe)}
              largura="16.6%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR DO SEGURO"
              valor={brl(t.vSeg_ttlnfe)}
              largura="16.6%"
              alinhamento="direita"
            />
            <Campo
              rotulo="DESCONTO"
              valor={brl(t.vDesc_ttlnfe)}
              largura="16.6%"
              alinhamento="direita"
            />
            <Campo
              rotulo="OUTRAS DESPESAS"
              valor={brl(t.vOutro)}
              largura="16.6%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR TOTAL DO IPI"
              valor={brl(t.vIPI_ttlnfe)}
              largura="16.6%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR TOTAL DA NOTA"
              valor={brl(t.vNF)}
              largura="17%"
              alinhamento="direita"
              forte
              ultimo
            />
          </View>
        </View>

        {/* ── TRANSPORTADOR / VOLUMES ──────────────────────────────── */}
        <Text style={styles.tituloSecao}>
          TRANSPORTADOR / VOLUMES TRANSPORTADOS
        </Text>
        <View style={styles.quadro}>
          <View style={styles.linha}>
            <Campo rotulo="RAZÃO SOCIAL" valor=" " largura="40%" />
            <Campo
              rotulo="FRETE POR CONTA"
              valor={MOD_FRETE[previa.transporte?.modFrete ?? '9'] ?? ''}
              largura="20%"
            />
            <Campo rotulo="PLACA DO VEÍCULO" valor=" " largura="14%" />
            <Campo rotulo="UF" valor=" " largura="8%" alinhamento="centro" />
            <Campo rotulo="CNPJ / CPF" valor=" " largura="18%" ultimo />
          </View>
        </View>

        {/* ── DADOS DO PRODUTO / SERVIÇO ───────────────────────────── */}
        <Text style={styles.tituloSecao}>DADOS DO PRODUTO / SERVIÇO</Text>
        <View style={styles.quadro}>
          <View style={styles.thead}>
            {COLUNAS.map((coluna, i) => (
              <Text
                key={coluna.titulo}
                style={[
                  styles.th,
                  { width: coluna.largura },
                  i === COLUNAS.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                {coluna.titulo}
              </Text>
            ))}
          </View>
          {itens.map((item) => (
            <View key={item.sequencia} style={styles.tr} wrap={false}>
              {COLUNAS.map((coluna, i) => (
                <Text
                  key={coluna.titulo}
                  style={[
                    styles.td,
                    { width: coluna.largura },
                    coluna.alinhamento === 'centro' ? styles.centro : {},
                    coluna.alinhamento === 'direita' ? styles.direita : {},
                    i === COLUNAS.length - 1 ? { borderRightWidth: 0 } : {},
                  ]}
                >
                  {coluna.valor(item)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* ── DADOS ADICIONAIS ─────────────────────────────────────── */}
        <Text style={styles.tituloSecao}>DADOS ADICIONAIS</Text>
        <View style={[styles.quadro, { minHeight: 54 }]}>
          <View style={styles.linha}>
            <View style={[styles.campo, { width: '65%', flexGrow: 0 }]}>
              <Text style={styles.rotulo}>INFORMAÇÕES COMPLEMENTARES</Text>
              <Text style={[styles.valor, { marginTop: 1 }]}>
                {previa.informacoesComplementares ?? ' '}
              </Text>
              {previa.avisos.length > 0 && (
                <>
                  <Text style={[styles.rotulo, { marginTop: 4 }]}>
                    OBSERVAÇÕES DA CONFERÊNCIA (não vão na nota)
                  </Text>
                  {previa.avisos.map((aviso, i) => (
                    <Text key={i} style={styles.aviso}>
                      • {aviso}
                    </Text>
                  ))}
                </>
              )}
            </View>
            <View style={[styles.campoFim, { width: '35%', flexGrow: 0 }]}>
              <Text style={styles.rotulo}>RESERVADO AO FISCO</Text>
            </View>
          </View>
        </View>

        <Text style={styles.rodape} fixed>
          Pré-visualização gerada pelo Atrupe. Não é documento fiscal e não
          substitui a DANFE, que só existe depois da autorização da SEFAZ.
        </Text>
      </Page>
    </Document>
  )
}
