import { test, type Page } from '@playwright/test'

/**
 * As telas de nota fiscal ficam atrás do módulo Nota Fiscal, contratado à
 * parte, e do emissor ativo (FiscalModuleGate). A conta do e2e pode não ter
 * um ou outro: o portão é lido uma vez, numa tela que só mostra ele ou o
 * formulário, e o teste que precisa da tela é pulado com o motivo, em vez de
 * falhar procurando o que o portão esconde.
 */
export type FiscalGate =
  | 'sem-modulo'
  | 'sem-emissor'
  | 'em-ativacao'
  | 'liberado'

const GATES: { text: string; gate: Exclude<FiscalGate, 'liberado'> }[] = [
  { text: 'Módulo Nota Fiscal não contratado', gate: 'sem-modulo' },
  { text: 'Configure seu módulo fiscal', gate: 'sem-emissor' },
  { text: 'Módulo em ativação', gate: 'em-ativacao' },
]

const REASONS: Record<Exclude<FiscalGate, 'liberado'>, string> = {
  'sem-modulo': 'A conta do e2e não tem o módulo Nota Fiscal.',
  'sem-emissor': 'A conta do e2e não tem o emissor fiscal configurado.',
  'em-ativacao': 'O emissor fiscal da conta do e2e está em ativação.',
}

// Uma leitura por execução: os testes fiscais usam todos a sessão padrão
let reading: Promise<FiscalGate> | undefined

async function read(page: Page): Promise<FiscalGate> {
  await page.goto('/nota-fiscal/emitir/avulsa/nfe')
  const gate = page
    .getByText(new RegExp(GATES.map((item) => item.text).join('|')))
    .first()
  // O portão mostra um esqueleto enquanto lê o status; o formulário liberado
  // não tem nenhum dos textos
  const shown = await gate.waitFor({ timeout: 20_000 }).then(
    () => true,
    () => false,
  )
  if (!shown) return 'liberado'
  const text = await gate.innerText()
  return GATES.find((item) => text.includes(item.text))?.gate ?? 'liberado'
}

export function readFiscalGate(page: Page): Promise<FiscalGate> {
  reading ??= read(page).catch((error) => {
    reading = undefined
    throw error
  })
  return reading
}

/** Pula o teste quando o portão fiscal esconde as telas de nota */
export async function skipUnlessFiscalReady(page: Page) {
  const gate = await readFiscalGate(page)
  test.skip(gate !== 'liberado', gate === 'liberado' ? '' : REASONS[gate])
}
