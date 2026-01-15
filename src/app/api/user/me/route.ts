import { NextResponse } from 'next/server'
import apiInstance from '@/lib/api'

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

    // Se for erro 401, retorna unauthorized
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
