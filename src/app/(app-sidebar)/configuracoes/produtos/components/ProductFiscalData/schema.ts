import { z } from 'zod'

export const productFiscalDataSchema = z.object({
  // Item
  productCode: z.string().optional(),
  commercialUnit: z.string().default('UN'),
  ncm: z.string().optional(),
  // cest: z.string().optional(),
  cean: z.string().optional(),

  // ICMS
  icmsOrigin: z.string().default('0'),
  icmsCst: z.string().default('102'),
  icmsRate: z.coerce.number().optional(),
  icmsReducao: z.coerce.number().optional(),
  icmsCreditRate: z.coerce.number().optional(),
  icmsBaseModality: z.string().default('3'),
  icmsStMva: z.coerce.number().optional(),
  icmsStReducao: z.coerce.number().optional(),
  icmsStRate: z.coerce.number().optional(),
  fcpRate: z.coerce.number().optional(),
  fcpStRate: z.coerce.number().optional(),

  // PIS/COFINS
  pisCst: z.string().default('07'),
  pisRate: z.coerce.number().optional(),
  cofinsCst: z.string().default('07'),
  cofinsRate: z.coerce.number().optional(),

  // IPI
  ipiFramework: z.string().default('0'),
  ipiCst: z.string().optional(),
  ipiRate: z.coerce.number().optional(),

  // CFOP (hidden but still needed for backend)
  cfopInState: z.string().optional().default('5102'),
  cfopOutState: z.string().optional().default('6102'),
  cfopExport: z.string().optional().default('7102'),
})

export type ProductFiscalDataFormType = z.infer<typeof productFiscalDataSchema>

export const defaultFiscalDataValues: ProductFiscalDataFormType = {
  productCode: '',
  commercialUnit: 'UN',
  ncm: '49111010', // 4911.10.10 - Impressos publicitários, catálogos e semelhantes
  // cest: '',
  cean: '',
  icmsOrigin: '0',
  icmsCst: '102',
  icmsRate: undefined,
  icmsReducao: undefined,
  icmsCreditRate: undefined,
  icmsBaseModality: '3',
  icmsStMva: undefined,
  icmsStReducao: undefined,
  icmsStRate: undefined,
  fcpRate: undefined,
  fcpStRate: undefined,
  pisCst: '07',
  pisRate: undefined,
  cofinsCst: '07',
  cofinsRate: undefined,
  ipiFramework: '0',
  ipiCst: '',
  ipiRate: undefined,
  cfopInState: '5102',
  cfopOutState: '6102',
  cfopExport: '7102',
}

const textoGravado = (valor: unknown, padrao: string): string =>
  valor === null || valor === undefined || valor === '' ? padrao : String(valor)

const numeroGravado = (valor: unknown): number | undefined =>
  valor === null || valor === undefined || valor === ''
    ? undefined
    : Number(valor)

/**
 * Cadastro fiscal gravado (GET /fiscal/product/:id) no formato deste
 * formulário. Os números vão com o zero preservado: alíquota ou redução 0 é
 * valor legítimo e, lida como vazia, o próximo save apagaria o que estava
 * gravado.
 */
export function fiscalDataToFormValues(
  data?: Record<string, unknown> | null,
): ProductFiscalDataFormType {
  if (!data) return { ...defaultFiscalDataValues }
  return {
    productCode: textoGravado(data.productCode, ''),
    commercialUnit: textoGravado(data.commercialUnit, 'UN'),
    ncm: textoGravado(data.ncm, ''),
    cean: textoGravado(data.cean, ''),
    icmsOrigin: textoGravado(data.icmsOrigin, '0'),
    icmsCst: textoGravado(data.icmsCst, '102'),
    icmsRate: numeroGravado(data.icmsRate),
    icmsReducao: numeroGravado(data.icmsReducao),
    icmsCreditRate: numeroGravado(data.icmsCreditRate),
    icmsBaseModality: textoGravado(data.icmsBaseModality, '3'),
    icmsStMva: numeroGravado(data.icmsStMva),
    icmsStReducao: numeroGravado(data.icmsStReducao),
    icmsStRate: numeroGravado(data.icmsStRate),
    fcpRate: numeroGravado(data.fcpRate),
    fcpStRate: numeroGravado(data.fcpStRate),
    pisCst: textoGravado(data.pisCst, '07'),
    pisRate: numeroGravado(data.pisRate),
    cofinsCst: textoGravado(data.cofinsCst, '07'),
    cofinsRate: numeroGravado(data.cofinsRate),
    ipiFramework: textoGravado(data.ipiFramework, '0'),
    ipiCst: textoGravado(data.ipiCst, ''),
    ipiRate: numeroGravado(data.ipiRate),
    cfopInState: textoGravado(data.cfopInState, '5102'),
    cfopOutState: textoGravado(data.cfopOutState, '6102'),
    cfopExport: textoGravado(data.cfopExport, '7102'),
  }
}

/**
 * Campos do cadastro fiscal que este formulário não mostra: CEST, os de
 * serviço (NFS-e) e os da Reforma Tributária. O upsert substitui o cadastro
 * inteiro, então quem salva pelo formulário tem de reenviá-los, senão voltam
 * a vazio.
 */
const CAMPOS_FISCAIS_FORA_DO_FORMULARIO = [
  'cest',
  'codigoServico',
  'aliquotaIss',
  'discriminacao',
  'codTribMunicipio',
  'cnae',
  'nbs',
  'codTribNacional',
  'cstIbsCbs',
  'codClassificacao',
] as const

export function camposFiscaisForaDoFormulario(
  data?: Record<string, unknown> | null,
): Record<string, unknown> {
  const campos: Record<string, unknown> = {}
  for (const campo of CAMPOS_FISCAIS_FORA_DO_FORMULARIO) {
    const valor = data?.[campo]
    if (valor !== null && valor !== undefined && valor !== '') {
      campos[campo] = valor
    }
  }
  return campos
}

// ICMS Origin options
export const icmsOriginOptions = [
  {
    value: '0',
    label: '0 - Nacional - Exceto as indicadas nos códigos 3, 4, 5 e 8',
  },
  { value: '1', label: '1 - Estrangeira - Importação direta' },
  { value: '2', label: '2 - Estrangeira - Adquirida no mercado interno' },
  {
    value: '3',
    label:
      '3 - Nacional - Com conteúdo de importação superior a 40% e inferior ou igual a 70%',
  },
  {
    value: '4',
    label: '4 - Nacional - Cuja produção tenha sido feita em conformidade',
  },
  {
    value: '5',
    label: '5 - Nacional - Com conteúdo de importação inferior ou igual a 40%',
  },
  {
    value: '6',
    label:
      '6 - Estrangeira - Importação direta sem similar nacional na lista da CAMEX',
  },
  {
    value: '7',
    label:
      '7 - Estrangeira - Adquirido interno sem similar nacional na lista da CAMEX',
  },
  {
    value: '8',
    label:
      '8 - Nacional - Mercadoria ou bem com conteúdo de importação superior a 70%',
  },
]

// ICMS CST options (Simples Nacional)
export const icmsCstOptions = [
  {
    value: '101',
    label:
      '101 - Tributada pelo Simples Nacional com permissão de crédito (v.2.0)',
  },
  {
    value: '102',
    label: '102 - Tributada pelo Simples Nacional sem permissão de crédito',
  },
  {
    value: '103',
    label:
      '103 - Isenção do ICMS no Simples Nacional para a faixa de receita bruta',
  },
  { value: '300', label: '300 - Imune' },
  { value: '400', label: '400 - Não tributada pelo Simples Nacional (v.2.0)' },
  {
    value: '500',
    label:
      '500 - ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação',
  },
]

// ICMS Base Modality options
export const icmsBaseModalityOptions = [
  { value: '0', label: '0 - Margem valor agregado (%)' },
  { value: '1', label: '1 - Pauta (valor)' },
  { value: '2', label: '2 - Preço tabelado máximo (valor)' },
  { value: '3', label: '3 - Valor da operação' },
]

// PIS/COFINS CST options
export const pisCstOptions = [
  {
    value: '04',
    label: '04 - Operação tributável (Tributação monofásica (Alíquota zero))',
  },
  { value: '06', label: '06 - Operação tributável (Alíquota zero)' },
  { value: '07', label: '07 - Operação isenta da contribuição' },
  { value: '08', label: '08 - Operação sem incidência da contribuição' },
  { value: '09', label: '09 - Operação com suspensão da contribuição' },
  { value: '49', label: '49 - Outras operações de saída' },
]

// IPI CST options
export const ipiCstOptions = [
  { value: '01', label: '01 - Entrada tributada com alíquota zero' },
  { value: '02', label: '02 - Entrada isenta' },
  { value: '03', label: '03 - Entrada não-tributada' },
  { value: '04', label: '04 - Entrada imune' },
  { value: '51', label: '51 - Saída tributada com alíquota zero' },
  { value: '52', label: '52 - Saída isenta' },
  { value: '53', label: '53 - Saída não-tributada' },
  { value: '54', label: '54 - Saída imune' },
  { value: '55', label: '55 - Saída com suspensão' },
  { value: '99', label: '99 - Outras saídas' },
]

// Commercial Unit options
export const commercialUnitOptions = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'PC', label: 'PC - Peça' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'M', label: 'M - Metro' },
  { value: 'M2', label: 'M2 - Metro quadrado' },
  { value: 'M3', label: 'M3 - Metro cúbico' },
  { value: 'L', label: 'L - Litro' },
  { value: 'KM', label: 'KM - Quilômetro' },
  { value: 'H', label: 'H - Hora' },
  { value: 'PAR', label: 'PAR - Par' },
  { value: 'JG', label: 'JG - Jogo' },
  { value: 'KIT', label: 'KIT - Kit' },
  { value: 'SERV', label: 'SERV - Serviço' },
]
