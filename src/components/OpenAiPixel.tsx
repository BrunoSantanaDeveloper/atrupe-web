'use client'

import Script from 'next/script'

// Config / Analytics
import { TRACKING } from '@/config/tracking'
import { isTrackingAllowed } from '@/lib/analytics'

// Loader do OpenAI Pixel (peça #5 / §4 do documento de medição).
//
// Inerte por padrão: só injeta o script quando o pixel está habilitado por
// ambiente (NEXT_PUBLIC_OPENAI_PIXEL_ENABLED=true) E o consentimento permite.
// Assim nada carrega em produção até a decisão de consentimento (§4.2); em
// homolog, ligue a flag para a validação do §8.
//
// O IIFE oficial guarda `if (w.oaiq) return`, garantindo uma única
// inicialização por carregamento mesmo com re-render/troca de rota (§4.1).
// Montado no layout do funil (blank-layout-pages), cobrindo /cadastro/inicio
// até /validar-cadastro sem alcançar o app autenticado.
export function OpenAiPixel() {
  if (!TRACKING.openAiPixelEnabled || !isTrackingAllowed()) return null

  return (
    <Script
      id="openai-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function (w, d, s, u) {
            if (w.oaiq) return;
            var q = function () { q.q.push(arguments); };
            q.q = [];
            w.oaiq = q;
            var js = d.createElement(s);
            js.async = true;
            js.src = u;
            var f = d.getElementsByTagName(s)[0];
            f.parentNode.insertBefore(js, f);
          })(window, document, "script", "https://bzrcdn.openai.com/sdk/oaiq.min.js");

          oaiq("init", { pixelId: "${TRACKING.openAiPixelId}" });
        `,
      }}
    />
  )
}
