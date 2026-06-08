import { NextRequest } from 'next/server'

import { auth } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  const token = session?.accessToken
  const sessionId = session?.sessionId
  const apiUrl = process.env.API_URL

  if (!token || !apiUrl) {
    return new Response('Nao autorizado', { status: 401 })
  }

  const response = await fetch(`${apiUrl}/fiscal/nfce/${params.id}/thermal`, {
    headers: {
      Authorization: token,
      'x-session-id': sessionId || '',
      'ngrok-skip-browser-warning': 'any',
    },
    cache: 'no-store',
  })

  const html = await response.text()

  return new Response(html, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('content-type') || 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
