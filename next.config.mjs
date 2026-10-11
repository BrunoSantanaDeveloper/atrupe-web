/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // EC-3: @react-pdf/renderer quebra a renderização no servidor ("Element
    // type is invalid" em desenvolvimento, React #419 em produção) nas 12
    // páginas que importam algum botão de PDF. Declarada como externa, a
    // biblioteca deixa de ser processada no servidor.
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    // noindex em TODAS as respostas deste projeto (app.atrupe.com.br e a URL de
    // homolog na Vercel). O site institucional www.atrupe.com.br é outro projeto
    // e não é afetado. Sem gate por ambiente: nenhum domínio deste projeto deve
    // ser indexado.
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
}

export default nextConfig
