import { NextResponse } from 'next/server'
import apiInstance from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * Proxy para buscar dados do usuário autenticado
 * Usado pelo client-side para atualizar dados da sessão
 */
export async function GET() {
  try {
    const api = await apiInstance()
    const response = await api.get('/user/me')

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('Erro ao buscar dados do usuário:', error)

    // Se for erro de redirecionamento do Next.js (do interceptor), propaga para o Next.js tratar
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof (error as { digest: string }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error
    }

    const responseStatus = (error as { response?: { status?: number } })
      .response?.status
    const errorMessage = (error as Error)?.message || 'Erro desconhecido'
    const errorCode = (error as { code?: string })?.code || 'UNKNOWN'
    const errorConfig = (
      error as { config?: { baseURL?: string; url?: string } }
    )?.config
    const requestedUrl = errorConfig
      ? `${errorConfig.baseURL || ''}${errorConfig.url || ''}`
      : null

    // Se for erro 401, retorna unauthorized
    if (responseStatus === 401) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: errorMessage,
        code: errorCode,
        url: requestedUrl,
        apiUrl: process.env.API_URL || 'não definida',
      },
      { status: 500 },
    )
  }
}
