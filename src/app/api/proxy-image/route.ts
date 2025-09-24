import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'URL da imagem é obrigatória' },
      { status: 400 },
    )
  }

  try {
    // Validar se é uma URL do S3 da Atrupe
    const s3Url = new URL(imageUrl)
    if (!s3Url.hostname.includes('files-atrupe.s3.us-east-1.amazonaws.com')) {
      return NextResponse.json({ error: 'URL não autorizada' }, { status: 403 })
    }

    // Buscar a imagem do S3
    const response = await fetch(imageUrl, {
      cache: 'force-cache', // Cache por 24h para otimizar performance
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha ao carregar a imagem' },
        { status: response.status },
      )
    }

    // Obter o conteúdo da imagem
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    // Retornar a imagem com headers CORS corretos
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400', // Cache por 24h
      },
    })
  } catch (error) {
    console.error('Erro no proxy de imagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
