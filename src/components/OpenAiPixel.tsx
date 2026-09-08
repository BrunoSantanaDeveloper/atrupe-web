'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// Config / Analytics
import { TRACKING } from '@/config/tracking'
import { isTrackingAllowed } from '@/lib/analytics'

// Loader do OpenAI Pixel (peça #5 / §4 do documento de medição).
//
// Inerte por padrão: só injeta o script quando (a) habilitado por ambiente
// (NEXT_PUBLIC_OPENAI_PIXEL_ENABLED=true) E (b) o hostname é de produção
// (isTrackingAllowed — nunca preview/homolog/localhost/Vercel, §9.1/§10 do
// relatório de 03/09). O IIFE oficial guarda `if (w.oaiq) return`, garantindo
// uma única inicialização por carregamento mesmo com re-render/troca de rota.
//
// isTrackingAllowed() lê window.location (client-only), então avaliamos após a
// montagem: servidor e primeira renderização retornam null; depois o script é
// injetado se permitido, evitando mismatch de hidratação.
export function OpenAiPixel() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(TRACKING.openAiPixelEnabled && isTrackingAllowed())
  }, [])

  if (!enabled) return null

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
