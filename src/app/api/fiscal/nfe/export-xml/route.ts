import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

/**
 * Proxy da exportação de XMLs de NF-e.
 *
 * O botão baixava direto de `process.env.NEXT_PUBLIC_API_URL`, variável que
 * não existe em nenhum .env deste projeto e era usada só ali. No navegador ela
 * virava `undefined`, a URL passava a ser relativa, a requisição caía no
 * próprio Next e voltava a página 404 em HTML. Como HTML não é JSON, o
 * diálogo mostrava a mensagem genérica e a chamada nunca chegava à API.
 *
 * Passando por aqui, a exportação usa a mesma `API_URL` e a mesma sessão do
 * resto do app, como a rota do cupom térmico da NFC-e já fazia.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return NextResponse.json(
      { userMessage: { message: 'Informe o período inicial e final.' } },
      { status: 400 },
    )
  }

  const session = await auth()
  const token = session?.accessToken
  const apiUrl = process.env.API_URL

  if (!token || !apiUrl) {
    return NextResponse.json(
      { userMessage: { message: 'Sessão expirada. Entre novamente.' } },
      { status: 401 },
    )
  }

  const parametros = new URLSearchParams({ startDate, endDate })
  const response = await fetch(
    `${apiUrl}/fiscal/nfe/export-xml/zip?${parametros.toString()}`,
    {
      headers: {
        Authorization: token,
        'x-session-id': session?.sessionId || '',
        'ngrok-skip-browser-warning': 'any',
      },
      cache: 'no-store',
    },
  )

  // O erro do backend passa adiante como veio: é ele que distingue "nenhuma
  // nota autorizada no período" de "notas sem XML no provedor".
  if (!response.ok) {
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') || 'application/json',
      },
    })
  }

  return new NextResponse(await response.arrayBuffer(), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition':
        response.headers.get('content-disposition') ||
        'attachment; filename="NFe_XMLs.zip"',
      // Contagens que o diálogo usa para avisar quando o ZIP saiu parcial.
      'X-Nfe-Total': response.headers.get('x-nfe-total') || '0',
      'X-Nfe-Missing-Xml': response.headers.get('x-nfe-missing-xml') || '0',
      'Cache-Control': 'no-store',
    },
  })
}
