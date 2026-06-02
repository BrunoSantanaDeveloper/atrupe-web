// Next
import type { Metadata } from 'next'
import Script from 'next/script'

// UI
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

// Components
import { SignupForm } from './components/SignupForm'

export const metadata: Metadata = {
  title: 'Cadastro',
  description: 'Crie sua conta',
}

export default function SignupPage() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '4396568280659292');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=4396568280659292&ev=PageView&noscript=1" />`,
        }}
      />
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle className="text-xl font-bold">Vamos começar!</CardTitle>
        <CardDescription>
          Crie sua conta e experimente grátis por 7 dias!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </>
  )
}
