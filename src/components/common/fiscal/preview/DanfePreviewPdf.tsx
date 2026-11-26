'use client'

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image as PDFImage,
} from '@react-pdf/renderer'

import type {
  NfePreview,
  NfePreviewDuplicata,
  NfePreviewItem,
} from '@/types/fiscal/nfe-preview'
import { getPdfImageSrc } from '@/lib/image-proxy'

/**
 * DANFE de pré-visualização — SEM VALOR FISCAL.
 *
 * Segue o DANFE que o sistema legado imprime (padrão NFePHP), que é o que os
 * clientes já conhecem: fonte serifada, canhoto com destinatário e valor
 * total, quadro do emitente com logo, destinatário e cálculo do imposto com
 * as mesmas colunas, bloco de volumes, quadro de produtos ocupando o resto da
 * folha e marca d'água vermelha em diagonal. As larguras foram medidas no
 * DANFE do legado.
 *
 * Chave de acesso, código de barras e protocolo ficam em branco porque só
 * existem depois da autorização. Como no legado, é a marca d'água que impede
 * a folha de passar por um DANFE válido.
 */

const BORDA = 0.6
const PRETO = '#000000'
const VERMELHO = '#dc2626'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: PRETO,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#fff',
  },
  // Largura folgada de propósito: numa caixa estreita o react-pdf quebra a
  // frase em duas linhas e hifeniza ("SEM VALOR FIS-" / "CAL").
  marcaDagua: {
    position: 'absolute',
    top: 540,
    left: -60,
    width: 760,
    textAlign: 'center',
    fontFamily: 'Times-Bold',
    fontSize: 66,
    color: VERMELHO,
    opacity: 0.55,
    transform: 'rotate(-35deg)',
  },

  quadro: { borderWidth: BORDA, borderColor: PRETO },
  linha: { flexDirection: 'row' },
  linhaTopo: {
    flexDirection: 'row',
    borderTopWidth: BORDA,
    borderTopColor: PRETO,
  },
  campo: {
    paddingHorizontal: 2,
    paddingTop: 1,
    paddingBottom: 1.5,
    borderRightWidth: BORDA,
    borderRightColor: PRETO,
  },
  campoFim: { paddingHorizontal: 2, paddingTop: 1, paddingBottom: 1.5 },
  rotulo: { fontFamily: 'Times-Bold', fontSize: 5.4 },
  valor: { fontSize: 7.5, marginTop: 1 },
  valorForte: { fontFamily: 'Times-Bold', fontSize: 7.5, marginTop: 1 },
  titulo: { fontFamily: 'Times-Bold', fontSize: 6.5, marginTop: 2 },
  direita: { textAlign: 'right' },
  centro: { textAlign: 'center' },

  // Canhoto
  corte: {
    borderTopWidth: BORDA,
    borderTopColor: PRETO,
    borderTopStyle: 'dashed',
    marginVertical: 5,
  },

  // Cabeçalho
  nomeEmitente: { fontFamily: 'Times-Bold', fontSize: 12.5, marginTop: 1 },
  enderecoEmitente: { fontFamily: 'Times-Bold', fontSize: 6.2, marginTop: 1 },
  danfeTitulo: { fontFamily: 'Times-Bold', fontSize: 12 },
  danfeTipo: { fontFamily: 'Times-Bold', fontSize: 7 },
  caixaTipo: {
    borderWidth: BORDA,
    borderColor: PRETO,
    width: 13,
    height: 12,
    marginLeft: 5,
    paddingTop: 1.5,
    textAlign: 'center',
    fontFamily: 'Times-Bold',
    fontSize: 8,
  },
  danfeNumero: { fontFamily: 'Times-Bold', fontSize: 8, marginTop: 1 },
  consulta: {
    fontFamily: 'Times-Bold',
    fontSize: 7.5,
    textAlign: 'center',
    lineHeight: 1.3,
  },

  // Quadro de produtos
  th: {
    fontFamily: 'Times-Bold',
    fontSize: 5.2,
    paddingHorizontal: 1.5,
    paddingVertical: 1.5,
    borderRightWidth: BORDA,
    borderRightColor: PRETO,
  },
  td: {
    fontSize: 6,
    paddingHorizontal: 1.5,
    paddingVertical: 1,
    borderRightWidth: BORDA,
    borderRightColor: PRETO,
  },

  bloqueio: {
    borderWidth: BORDA,
    borderColor: VERMELHO,
    padding: 4,
    marginBottom: 4,
  },
  bloqueioTitulo: {
    fontFamily: 'Times-Bold',
    color: VERMELHO,
    fontSize: 7.5,
    marginBottom: 1,
  },
  bloqueioTexto: { fontSize: 6.5, color: VERMELHO },
})

// ─── Formatação ──────────────────────────────────────────────────────────────

const decimal = (valor: string | number | null | undefined, casas: number) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(Number(valor ?? 0) || 0)

/** Os valores do payload já vêm em reais, com ponto decimal. */
const brl = (valor?: string | number | null) => decimal(valor, 2)

/**
 * Unitário com duas casas, como no legado, a não ser que isso esconda o valor
 * real — um unitário de 0,0357 sairia como 0,04 e a conta não fecharia.
 */
const unitario = (valor?: string | number | null) => {
  const n = Number(valor ?? 0) || 0
  return decimal(n, Number(n.toFixed(2)) === Number(n.toFixed(4)) ? 2 : 4)
}

/**
 * Sem hifenização automática: o hifenizador do react-pdf segue padrões do
 * inglês e partia nomes ("HOMOLO-GACAO"). Com ele desligado, nomes e endereços
 * só quebram nos espaços, como no DANFE do legado.
 */
const semHifen = (palavra: string) => [palavra]

/**
 * Código do produto em linhas curtas, cortando de preferência logo depois de
 * um hífen. O código costuma ser longo e sem espaços ("08-d1deca-4c34-...");
 * deixado ao react-pdf, ele quebrava com hífen duplo ("08--") e a segunda
 * linha invadia a coluna da descrição. A quebra de linha explícita não
 * acrescenta hífen nenhum.
 */
const quebrarCodigo = (codigo: string, maximo = 16) => {
  const pedacos = codigo.split(/(?<=-)/)
  const linhas: string[] = []
  let atual = ''
  for (const pedaco of pedacos) {
    if ((atual + pedaco).length <= maximo) {
      atual += pedaco
      continue
    }
    if (atual) linhas.push(atual)
    // Pedaço maior que a linha inteira: corta no tamanho, sem hífen.
    let resto = pedaco
    while (resto.length > maximo) {
      linhas.push(resto.slice(0, maximo))
      resto = resto.slice(maximo)
    }
    atual = resto
  }
  if (atual) linhas.push(atual)
  return linhas.join(String.fromCharCode(10))
}

const FUSO = 'America/Sao_Paulo'

const dataBr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO }) : ''

const horaBr = (iso?: string, comSegundos = false) =>
  iso
    ? new Date(iso).toLocaleTimeString('pt-BR', {
        timeZone: FUSO,
        hour: '2-digit',
        minute: '2-digit',
        ...(comSegundos ? { second: '2-digit' } : {}),
      })
    : ''

const documento = (valor?: string) => {
  const d = (valor ?? '').replace(/\D/g, '')
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  if (d.length === 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  return valor ?? ''
}

const cep = (valor?: number) => {
  if (!valor) return ''
  const d = String(valor).padStart(8, '0')
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

const FRETE: Record<string, string> = {
  '0': '0-Por conta do emitente',
  '1': '1-Por conta do destinatário',
  '2': '2-Por conta de terceiros',
  '3': '3-Próprio por conta do remetente',
  '4': '4-Próprio por conta do destinatário',
  '9': '9-Sem ocorrência de transporte',
}

// ─── Blocos ──────────────────────────────────────────────────────────────────

/** Campo do DANFE: rótulo em negrito miúdo em cima, valor embaixo. */
function Campo({
  rotulo,
  valor,
  largura,
  ultimo,
  alinhamento,
  forte,
  alturaMinima,
}: {
  rotulo: string
  valor?: string | number | null
  largura: string
  ultimo?: boolean
  alinhamento?: 'direita' | 'centro'
  forte?: boolean
  alturaMinima?: number
}) {
  return (
    <View
      style={[
        ultimo ? styles.campoFim : styles.campo,
        { width: largura },
        alturaMinima ? { minHeight: alturaMinima } : {},
      ]}
    >
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text
        hyphenationCallback={semHifen}
        style={[
          forte ? styles.valorForte : styles.valor,
          alinhamento === 'direita' ? styles.direita : {},
          alinhamento === 'centro' ? styles.centro : {},
        ]}
      >
        {valor === null || valor === undefined || valor === '' ? ' ' : valor}
      </Text>
    </View>
  )
}

/** Uma linha de campos com as larguras do legado; a primeira não tem borda em cima. */
function Linha({
  primeira,
  children,
}: {
  primeira?: boolean
  children: React.ReactNode
}) {
  return (
    <View style={primeira ? styles.linha : styles.linhaTopo}>{children}</View>
  )
}

type Coluna = {
  titulo: string
  largura: string
  alinhamento?: 'direita' | 'centro'
  valor: (item: NfePreviewItem) => string
}

/** Colunas do quadro de produtos, com as larguras medidas no legado. */
function colunasProdutos(simplesNacional: boolean): Coluna[] {
  return [
    {
      titulo: 'CÓD. PROD.',
      largura: '10.4%',
      valor: (i) => quebrarCodigo(i.cProd ?? ''),
    },
    {
      titulo: 'DESCRIÇÃO DO PRODUTO / SERVIÇO',
      largura: '24.4%',
      valor: (i) => i.xProd ?? '',
    },
    {
      titulo: 'NCM/SH',
      largura: '5.2%',
      alinhamento: 'centro',
      valor: (i) => i.NCM ?? '',
    },
    {
      // O legado mostra CSOSN para o Simples e CST para o Regime Normal,
      // sempre com a origem na frente.
      titulo: simplesNacional ? 'CSOSN' : 'CST',
      largura: '3.6%',
      alinhamento: 'centro',
      valor: (i) =>
        `${i.tributos?.ICMS?.orig ?? ''}${i.tributos?.ICMS?.CST ?? ''}`,
    },
    {
      titulo: 'CFOP',
      largura: '3.7%',
      alinhamento: 'centro',
      valor: (i) => String(i.CFOP ?? ''),
    },
    {
      titulo: 'UN',
      largura: '5.3%',
      alinhamento: 'centro',
      valor: (i) => i.uCOM ?? '',
    },
    {
      titulo: 'QTD',
      largura: '6.3%',
      alinhamento: 'direita',
      valor: (i) => decimal(i.qCOM, 4),
    },
    {
      titulo: 'V. UNITÁRIO',
      largura: '7.2%',
      alinhamento: 'direita',
      valor: (i) => unitario(i.vUnCom),
    },
    {
      titulo: 'V. TOTAL',
      largura: '6.7%',
      alinhamento: 'direita',
      valor: (i) => brl(i.vProd),
    },
    {
      titulo: 'BC ICMS',
      largura: '7.2%',
      alinhamento: 'direita',
      valor: (i) => brl(i.tributos?.ICMS?.vBC),
    },
    {
      titulo: 'V. ICMS',
      largura: '6.2%',
      alinhamento: 'direita',
      valor: (i) => brl(i.tributos?.ICMS?.vICMS_icms),
    },
    {
      titulo: 'V. IPI',
      largura: '6.0%',
      alinhamento: 'direita',
      valor: (i) => brl(i.tributos?.IPI?.CSTIPI?.vIPI),
    },
    {
      titulo: 'ALÍQ. ICMS',
      largura: '3.7%',
      alinhamento: 'direita',
      valor: (i) => brl(i.tributos?.ICMS?.pICMS),
    },
    {
      titulo: 'ALÍQ. IPI',
      largura: '4.1%',
      alinhamento: 'direita',
      valor: (i) => brl(i.tributos?.IPI?.CSTIPI?.pIPI),
    },
  ]
}

// ─── Documento ───────────────────────────────────────────────────────────────

export function DanfePreviewPdf({ previa }: { previa: NfePreview }) {
  const doc = previa.documento
  const emit = previa.emitente ?? {}
  const end = emit.enderEmit ?? {}
  const contato = previa.emitenteContato ?? {}
  const dest = previa.destinatario ?? {}
  const endDest = dest.enderDest ?? {}
  const t = previa.totais?.ICMStot ?? {}
  const itens = previa.itens ?? []
  const colunas = colunasProdutos(emit.CRT === 1)
  // Fatura/duplicatas: o quadro existe na DANFE oficial entre o destinatário
  // e o cálculo do imposto. Faltava aqui, e quem conferia a prévia concluía
  // que a nota sairia sem cobrança — ela sai, a prévia é que não mostrava.
  const duplicatas = previa.duplicatas ?? []
  const duplicatasPorLinha: NfePreviewDuplicata[][] = []
  for (let i = 0; i < duplicatas.length; i += 4) {
    duplicatasPorLinha.push(duplicatas.slice(i, i + 4))
  }

  const numero = String(doc?.numeroPrevisto ?? '').padStart(9, '0')
  const serie = doc?.serie ?? ''

  const linhasEndereco = [
    [end.xLgr, end.nro].filter(Boolean).join(' '),
    end.xBairro,
    [end.xMun, end.UF].filter(Boolean).join('-'),
    end.CEP ? `CEP: ${cep(end.CEP)}` : '',
    contato.fone ? `Fone: ${contato.fone}` : '',
    contato.email ?? '',
  ].filter(Boolean)

  return (
    <Document title="Pré-visualização da NF-e (DANFE sem valor fiscal)">
      <Page size="A4" style={styles.page}>
        <Text style={styles.marcaDagua} fixed>
          SEM VALOR FISCAL
        </Text>

        {previa.bloqueios.length > 0 && (
          <View style={styles.bloqueio}>
            <Text style={styles.bloqueioTitulo}>
              A nota não pode ser emitida assim:
            </Text>
            {previa.bloqueios.map((bloqueio, i) => (
              <Text key={i} style={styles.bloqueioTexto}>
                • {bloqueio}
              </Text>
            ))}
          </View>
        )}

        {/* ── CANHOTO ─────────────────────────────────────────────── */}
        <View style={[styles.quadro, styles.linha]}>
          <View
            style={{
              width: '86.7%',
              borderRightWidth: BORDA,
              borderRightColor: PRETO,
            }}
          >
            <View
              style={[
                styles.linha,
                {
                  justifyContent: 'space-between',
                  paddingHorizontal: 2,
                  paddingVertical: 2,
                },
              ]}
            >
              <Text style={styles.rotulo}>RECEBEMOS DE {emit.xNome ?? ''}</Text>
              <Text style={styles.rotulo}>
                OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO
              </Text>
            </View>
            <Linha>
              <Campo
                rotulo="DATA DE RECEBIMENTO"
                largura="15.7%"
                alturaMinima={20}
              />
              <Campo
                rotulo="IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR"
                largura="36.4%"
              />
              <Campo
                rotulo="DESTINATÁRIO"
                valor={dest.xNome_dest}
                largura="34.3%"
              />
              <Campo
                rotulo="VLR TOTAL NOTA"
                valor={brl(t.vNF)}
                largura="13.6%"
                alinhamento="direita"
                ultimo
              />
            </Linha>
          </View>
          <View
            style={{ width: '13.3%', paddingHorizontal: 4, paddingVertical: 2 }}
          >
            <Text style={[styles.valorForte, styles.centro, { fontSize: 9 }]}>
              NF-e
            </Text>
            <Text style={styles.valorForte}>Nº {numero}</Text>
            <Text style={styles.valorForte}>Série {serie}</Text>
          </View>
        </View>

        <View style={styles.corte} />

        {/* ── CABEÇALHO ───────────────────────────────────────────── */}
        <View style={styles.quadro}>
          <View style={styles.linha}>
            {/* Emitente */}
            <View style={[styles.campo, { width: '45.6%', minHeight: 110 }]}>
              <Text style={styles.rotulo}>IDENTIFICAÇÃO DO EMITENTE</Text>
              <Text style={styles.nomeEmitente}>{emit.xNome ?? ''}</Text>
              <View
                style={[styles.linha, { marginTop: 3, alignItems: 'center' }]}
              >
                {contato.logoUrl ? (
                  <View style={{ width: '44%', paddingRight: 4 }}>
                    <PDFImage
                      src={getPdfImageSrc(contato.logoUrl)}
                      style={{
                        width: '100%',
                        height: 58,
                        objectFit: 'contain',
                      }}
                    />
                  </View>
                ) : null}
                <View style={{ flex: 1 }}>
                  {linhasEndereco.map((texto, i) => (
                    <Text key={i} style={styles.enderecoEmitente}>
                      {texto}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* DANFE */}
            <View
              style={[styles.campo, { width: '15.7%', alignItems: 'center' }]}
            >
              <Text style={styles.danfeTitulo}>DANFE</Text>
              <Text style={[styles.rotulo, styles.centro, { fontSize: 6.2 }]}>
                Documento Auxiliar da Nota Fiscal Eletrônica
              </Text>
              <View
                style={[styles.linha, { marginTop: 5, alignItems: 'center' }]}
              >
                <View>
                  <Text style={styles.danfeTipo}>0 - ENTRADA</Text>
                  <Text style={styles.danfeTipo}>1 - SAÍDA</Text>
                </View>
                <Text style={styles.caixaTipo}>{doc?.tipo ?? ''}</Text>
              </View>
              <View style={{ alignSelf: 'stretch', marginTop: 4 }}>
                <Text style={styles.danfeNumero}>Nº {numero}</Text>
                <Text style={styles.danfeNumero}>SÉRIE {serie}</Text>
                <Text style={styles.danfeNumero}>FL 1 / 1</Text>
              </View>
            </View>

            {/* Chave de acesso: em branco até a autorização */}
            <View style={{ width: '38.7%' }}>
              <View style={{ height: 38 }} />
              <View
                style={[
                  styles.linhaTopo,
                  { borderBottomWidth: BORDA, borderBottomColor: PRETO },
                ]}
              >
                <Campo rotulo="CHAVE DE ACESSO" largura="100%" ultimo />
              </View>
              <View
                style={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                }}
              >
                <Text style={styles.consulta}>
                  Consulta de autenticidade no portal nacional da NF-e
                  www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora
                </Text>
              </View>
            </View>
          </View>

          <Linha>
            <Campo
              rotulo="NATUREZA DA OPERAÇÃO"
              valor={doc?.naturezaOperacao?.toUpperCase()}
              largura="61.3%"
            />
            <Campo
              rotulo="PROTOCOLO DE AUTORIZAÇÃO DE USO"
              largura="38.7%"
              ultimo
            />
          </Linha>
          <Linha>
            <Campo
              rotulo="INSCRIÇÃO ESTADUAL"
              valor={emit.IE}
              largura="29.2%"
            />
            <Campo
              rotulo="INSC. ESTADUAL DO SUBST. TRIBUTÁRIO"
              largura="32.1%"
            />
            <Campo
              rotulo="CPF/CNPJ"
              valor={documento(emit.CNPJ_emit)}
              largura="38.7%"
              ultimo
            />
          </Linha>
        </View>

        {/* ── DESTINATÁRIO / REMETENTE ────────────────────────────── */}
        <Text style={styles.titulo}>DESTINATÁRIO / REMETENTE</Text>
        <View style={styles.quadro}>
          <Linha primeira>
            <Campo
              rotulo="NOME / RAZÃO SOCIAL"
              valor={dest.xNome_dest}
              largura="61.3%"
            />
            <Campo
              rotulo="CNPJ / CPF / ID Estrangeiro"
              valor={documento(
                dest.CNPJ_dest ?? dest.CPF_dest ?? dest.idEstrangeiro,
              )}
              largura="23%"
              forte
            />
            <Campo
              rotulo="DATA DA EMISSÃO"
              valor={`${dataBr(doc?.dataEmissaoPrevista)} ${horaBr(
                doc?.dataEmissaoPrevista,
              )}`}
              largura="15.7%"
              forte
              ultimo
            />
          </Linha>
          <Linha>
            <Campo
              rotulo="ENDEREÇO"
              valor={[endDest.xLgr_dest, endDest.nro_dest]
                .filter(Boolean)
                .join(' ')}
              largura="43.8%"
            />
            <Campo
              rotulo="BAIRRO / DISTRITO"
              valor={endDest.xBairro_dest}
              largura="26.6%"
            />
            <Campo
              rotulo="COMPLEMENTO"
              valor={endDest.xCpl_dest}
              largura="13.9%"
            />
            <Campo
              rotulo="DATA DA ENTRADA/SAÍDA"
              valor={dataBr(doc?.dataSaidaEntrada)}
              largura="15.7%"
              forte
              ultimo
            />
          </Linha>
          <Linha>
            <Campo
              rotulo="MUNICÍPIO"
              valor={endDest.xMun_dest}
              largura="43.5%"
              alturaMinima={18}
            />
            <Campo
              rotulo="FONE / FAX"
              valor={endDest.fone_dest}
              largura="13.8%"
            />
            <Campo rotulo="UF" valor={endDest.UF_dest} largura="4.1%" />
            <Campo
              rotulo="INSCRIÇÃO ESTADUAL"
              valor={dest.IE_dest}
              largura="13.8%"
            />
            <Campo rotulo="CEP" valor={cep(endDest.CEP_dest)} largura="9.1%" />
            <Campo
              rotulo="HORA DE ENTRADA/SAÍDA"
              valor={horaBr(doc?.dataSaidaEntrada, true)}
              largura="15.7%"
              forte
              ultimo
            />
          </Linha>
        </View>

        {/* ── FATURA / DUPLICATAS ─────────────────────────────────── */}
        {duplicatasPorLinha.length > 0 && (
          <>
            <Text style={styles.titulo}>FATURA / DUPLICATAS</Text>
            <View style={styles.quadro}>
              {duplicatasPorLinha.map((grupo, indiceLinha) => (
                <Linha key={indiceLinha} primeira={indiceLinha === 0}>
                  {grupo.map((dup, indice) => (
                    <Campo
                      key={`${dup.nDup ?? indice}`}
                      rotulo={`DUPLICATA ${dup.nDup ?? ''} - VENC. ${dataBr(
                        dup.dVenc,
                      )}`}
                      valor={brl(dup.vDup)}
                      largura="25%"
                      alinhamento="direita"
                      ultimo={indice === grupo.length - 1}
                    />
                  ))}
                </Linha>
              ))}
            </View>
          </>
        )}

        {/* ── CÁLCULO DO IMPOSTO ──────────────────────────────────── */}
        <Text style={styles.titulo}>CÁLCULO DO IMPOSTO</Text>
        <View style={styles.quadro}>
          <Linha primeira>
            <Campo
              rotulo="BC ICMS"
              valor={brl(t.vBC_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR ICMS"
              valor={brl(t.vICMS_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="BC ICMS SUBSTITUIÇÃO"
              valor={brl(t.vBCST_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR ICMS SUBS"
              valor={brl(t.vST_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR IMP. IMPORTAÇÃO"
              valor={brl(t.vII_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR TOTAL DOS PRODUTOS"
              valor={brl(t.vProd_ttlnfe)}
              largura="16.7%"
              alinhamento="direita"
              ultimo
            />
          </Linha>
          <Linha>
            <Campo
              rotulo="VALOR FRETE"
              valor={brl(t.vFrete_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR SEGURO"
              valor={brl(t.vSeg_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR DESCONTO"
              valor={brl(t.vDesc_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="OUTRAS DESPESAS ACESSÓRIAS"
              valor={brl(t.vOutro)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR IPI"
              valor={brl(t.vIPI_ttlnfe)}
              largura="16.66%"
              alinhamento="direita"
            />
            <Campo
              rotulo="VALOR TOTAL DA NOTA"
              valor={brl(t.vNF)}
              largura="16.7%"
              alinhamento="direita"
              forte
              ultimo
            />
          </Linha>
        </View>

        {/* ── TRANSPORTADOR / VOLUMES ─────────────────────────────── */}
        <Text style={styles.titulo}>TRANSPORTADOR / VOLUMES TRANSPORTADOS</Text>
        <View style={styles.quadro}>
          <Linha primeira>
            <Campo rotulo="RAZÃO SOCIAL" largura="38.9%" />
            <Campo
              rotulo="FRETE POR CONTA"
              valor={FRETE[previa.transporte?.modFrete ?? '9']}
              largura="19.1%"
            />
            <Campo rotulo="CÓDIGO ANTT" largura="13.7%" />
            <Campo rotulo="PLACA" largura="5.8%" />
            <Campo rotulo="UF" largura="3.7%" />
            <Campo rotulo="CNPJ/CPF" largura="18.8%" ultimo />
          </Linha>
          <Linha>
            <Campo rotulo="ENDEREÇO" largura="38.9%" />
            <Campo rotulo="MUNICÍPIO" largura="38.6%" />
            <Campo rotulo="UF" largura="3.7%" />
            <Campo rotulo="INSCRIÇÃO ESTADUAL" largura="18.8%" ultimo />
          </Linha>
        </View>
        <Text style={styles.titulo}>VOLUMES</Text>
        <View style={styles.quadro}>
          <Linha primeira>
            <Campo rotulo="QUANTIDADE" largura="12.1%" />
            <Campo rotulo="ESPÉCIE" largura="14.4%" />
            <Campo rotulo="MARCA" largura="24.4%" />
            <Campo rotulo="NUMERAÇÃO" largura="21%" />
            <Campo rotulo="PESO BRUTO" largura="12.6%" />
            <Campo rotulo="PESO LÍQUIDO" largura="15.5%" ultimo />
          </Linha>
        </View>

        {/* ── DADOS DO PRODUTO / SERVIÇO ──────────────────────────── */}
        <Text style={styles.titulo}>DADOS DO PRODUTO / SERVIÇO</Text>
        {/* Ocupa o resto da folha, com as linhas das colunas descendo até o
            fim, como no DANFE impresso. */}
        <View style={[styles.quadro, { flexGrow: 1 }]}>
          <View
            style={[
              styles.linha,
              { borderBottomWidth: BORDA, borderBottomColor: PRETO },
            ]}
          >
            {colunas.map((coluna, i) => (
              <Text
                key={coluna.titulo}
                style={[
                  styles.th,
                  { width: coluna.largura },
                  i === colunas.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                {coluna.titulo}
              </Text>
            ))}
          </View>

          {itens.map((item) => (
            <View key={item.sequencia} style={styles.linha} wrap={false}>
              {colunas.map((coluna, i) => (
                <Text
                  key={coluna.titulo}
                  hyphenationCallback={semHifen}
                  style={[
                    styles.td,
                    { width: coluna.largura },
                    coluna.alinhamento === 'direita' ? styles.direita : {},
                    coluna.alinhamento === 'centro' ? styles.centro : {},
                    i === colunas.length - 1 ? { borderRightWidth: 0 } : {},
                  ]}
                >
                  {coluna.valor(item)}
                </Text>
              ))}
            </View>
          ))}

          <View style={[styles.linha, { flexGrow: 1 }]}>
            {colunas.map((coluna, i) => (
              <View
                key={coluna.titulo}
                style={{
                  width: coluna.largura,
                  borderRightWidth: i === colunas.length - 1 ? 0 : BORDA,
                  borderRightColor: PRETO,
                }}
              />
            ))}
          </View>
        </View>

        {/* ── DADOS ADICIONAIS ────────────────────────────────────── */}
        <Text style={styles.titulo}>DADOS ADICIONAIS</Text>
        <View style={[styles.quadro, styles.linha, { height: 72 }]}>
          <View style={[styles.campo, { width: '65%' }]}>
            <Text style={styles.rotulo}>INFORMAÇÕES COMPLEMENTARES</Text>
            <Text style={styles.valor}>
              {previa.informacoesComplementares ?? ''}
            </Text>
          </View>
          <View style={[styles.campoFim, { width: '35%' }]}>
            <Text style={styles.rotulo}>RESERVADO AO FISCO</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
