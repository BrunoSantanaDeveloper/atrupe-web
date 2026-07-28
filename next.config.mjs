/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
