// Lib
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Components
import { Toaster } from '@/components/ui/sonner'
// import { TailwindIndicator } from '@/components/TailwindIndicator'
import { DevEnvAlert } from '@/components/DevEnvAlert'
import { GlobalAlertDialog } from '@/components/common/GlobalAlertDialog'

// Styles
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth()

  const companyFavicon = session?.company?.favicon || '/logo/logo.png'

  return {
    title: {
      default: 'Atrupe',
      template: '%s | Atrupe',
    },
    description: 'Sistema de gestão para comunicação visual',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || ''),
    openGraph: {
      images: '/img/og.jpg',
    },
    icons: {
      icon: companyFavicon,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers session={session}>
          <DevEnvAlert />
          {children}
          <Toaster />
          <GlobalAlertDialog />
          {/* <TailwindIndicator /> */}
        </Providers>
      </body>
    </html>
  )
}
