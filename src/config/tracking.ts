// Configuração central de tracking (peça #4 da fundação).
//
// Reúne os IDs de tag e a flag de debug antes espalhados (o GTM estava
// hardcoded em app/layout.tsx; a flag de debug, inline na camada de analytics).
// Cada ID pode ser sobrescrito por variável de ambiente NEXT_PUBLIC_*, mantendo
// o valor atual como padrão — portanto NÃO há mudança de comportamento hoje.
//
// Os IDs são os mesmos em todos os ambientes: a distinção homolog/produção é
// feita pelo modo Preview do próprio GTM, não por container separado.

export const TRACKING = {
  // Container GTM — carrega o GA4 e as demais tags.
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-WV53Q7X7',

  // GA4 — configurado DENTRO do GTM (não é usado diretamente no código).
  // Mantido aqui como fonte única de referência dos IDs de tracking.
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_ID ?? 'G-V8B7SDZ187',

  // OpenAI Pixel (§4 do documento de medição).
  openAiPixelId:
    process.env.NEXT_PUBLIC_OPENAI_PIXEL_ID ?? '5TZxCTcQhmzhW7DZ6ZHPFk',

  // Ativação do OpenAI Pixel. Default DESLIGADO: o pixel só carrega quando
  // NEXT_PUBLIC_OPENAI_PIXEL_ENABLED=true. Ligue primeiro em homolog para a
  // validação do §8; em produção, SOMENTE após a decisão de consentimento
  // (§4.2). Enquanto false, nada é carregado nem enviado.
  openAiPixelEnabled: process.env.NEXT_PUBLIC_OPENAI_PIXEL_ENABLED === 'true',

  // Debug de analytics: liga em não-produção para a validação do §8 ("debug
  // habilitado apenas durante o teste"); silencioso em produção.
  debug: process.env.NEXT_PUBLIC_ENV !== 'production',
} as const
