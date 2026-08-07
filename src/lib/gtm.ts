// Helper tipado e SSR-safe para empurrar eventos ao dataLayer do GTM.
// O container (GTM-WV53Q7X7) é carregado em src/app/layout.tsx; aqui só
// enviamos eventos. Nunca inclua dados pessoais (nome, e-mail, telefone,
// CNPJ/CPF, endereço) — apenas o evento e parâmetros não sensíveis.

type DataLayerEvent = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
  }
}

export function pushToDataLayer(event: DataLayerEvent) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
}
