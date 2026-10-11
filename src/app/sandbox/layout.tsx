// Next
import { notFound } from 'next/navigation'

// Libs
import { DEMO_DATA } from '@/lib/demo'

// As vitrines (componentes, tema, tipografia e as telas de exemplo da
// composição, do fluxo e do orçamento) só existem com a flag de demonstração
// (src/lib/demo.ts). No build de produção, qualquer /sandbox responde
// "página não encontrada"
export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!DEMO_DATA) notFound()

  return <>{children}</>
}
