import { NextResponse } from 'next/server'
import apiInstance from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Estado da empresa (plano, bloqueio e cobrança) para o SessionActivityHandler
 * levar à sessão a cada carga de página e a cada 5 minutos. É rota de API, e
 * não server action, porque uma action disparada ao montar a página concorre
 * com a navegação do redirect de "/" (o Router do Next quebrava com o erro
 * #310) e, com 401, devolvia redirect para /logout no meio de qualquer tela.
 */
export async function GET() {
  try {
    const api = await apiInstance()
    const res = await api.get('/subscriptions/session')

    return NextResponse.json(res.data)
  } catch (error: unknown) {
    // O interceptor de lib/api transforma 401 (e falha de conexão) em
    // redirect('/logout'). Numa consulta de fundo isso vira só o status.
    const digest = (error as { digest?: unknown })?.digest
    if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
      return NextResponse.json(null, { status: 401 })
    }

    const status = (error as { response?: { status?: number } })?.response
      ?.status

    return NextResponse.json(null, { status: status ?? 500 })
  }
}
