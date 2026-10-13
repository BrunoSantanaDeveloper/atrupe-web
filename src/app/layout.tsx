// Lib
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

// Components
import { Toaster } from '@/components/ui/sonner'
// import { TailwindIndicator } from '@/components/TailwindIndicator'
import { DevEnvAlert } from '@/components/DevEnvAlert'
import { GlobalAlertDialog } from '@/components/common/GlobalAlertDialog'

// Config
import { TRACKING } from '@/config/tracking'

// Styles
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

// Google Tag Manager ID (config central — peça #4)
const GTM_ID = TRACKING.gtmId

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth()

  const companyFavicon = session?.company?.favicon || '/logo/logo.png'

  return {
    title: {
      default: 'Atrupe',
      template: '%s · Atrupe',
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
    // suppressHydrationWarning: o next-themes põe a classe do tema no <html>
    // antes da hidratação (carregar sem piscar)
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
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
