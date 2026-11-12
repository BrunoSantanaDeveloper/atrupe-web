import { NextResponse, type NextRequest } from 'next/server'
import apiInstance from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Repasse das telas do atendimento no WhatsApp (src/components/atendimento,
 * kit whatsapp-support) para a API, com o token da sessão. As telas do kit
 * chamam /api/atendimento/* na própria origem; aqui só passam as rotas delas.
 * As rotas do robô (/atendimento/robo) não passam: o robô fala direto com a
 * API, com assinatura.
 */
const ROTAS = ['entrar', 'config', 'sugestoes', 'lacunas', 'whatsapp', 'grupos']

type Context = { params: { rota: string[] } }

async function repassar(request: NextRequest, { params }: Context) {
  const rota = params.rota ?? []
  if (!ROTAS.includes(rota[0])) {
    return NextResponse.json(
      { code: 'not_found', message: 'Rota do atendimento não existe.' },
      { status: 404 },
    )
  }
  const path = `/atendimento/${rota.map(encodeURIComponent).join('/')}${request.nextUrl.search}`
  const body =
    request.method === 'GET' ? undefined : await request.text().catch(() => '')

  try {
    const api = await apiInstance()
    // Sem lançar erro em 4xx: o interceptor de lib/api levaria a /logout, e
    // as telas precisam do código e da mensagem.
    const res = await api.request({
      method: request.method,
      url: path,
      data: body || undefined,
      validateStatus: () => true,
      transformResponse: (raw) => raw,
    })
    return answer(res.status, res.data)
  } catch (error) {
    const digest = (error as { digest?: unknown })?.digest
    if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
      return answer(401, null)
    }
    return NextResponse.json(
      {
        code: 'unavailable',
        message: 'Não deu para falar com o atendimento agora.',
      },
      { status: 502 },
    )
  }
}

/** Devolve { code, message } também quando o erro vem do filtro global da API. */
function answer(status: number, raw: unknown) {
  let json: Record<string, unknown> | null = null
  try {
    json = typeof raw === 'string' && raw ? JSON.parse(raw) : null
  } catch {
    json = null
  }
  if (status === 401) {
    return NextResponse.json(
      {
        code: 'unauthenticated',
        message: 'Sua sessão terminou. Entre de novo no Atrupe.',
      },
      { status },
    )
  }
  if (status >= 400 && json && !('code' in json) && 'userMessage' in json) {
    const userMessage = json.userMessage as
      | string
      | { message?: string | string[] }
    const message =
      typeof userMessage === 'string'
        ? userMessage
        : [userMessage?.message].flat().filter(Boolean).join(' ')
    json = {
      code: status === 403 ? 'forbidden' : `http_${status}`,
      message:
        status === 403
          ? 'Só o superadmin acessa o atendimento.'
          : message || 'Não deu certo. Tente de novo em instantes.',
    }
  }
  return NextResponse.json(json, {
    status,
    headers: { 'cache-control': 'no-store' },
  })
}

export const GET = repassar
export const POST = repassar
export const PUT = repassar
// Arquivar um grupo da equipe (DELETE /atendimento/grupos?chave=).
export const DELETE = repassar
