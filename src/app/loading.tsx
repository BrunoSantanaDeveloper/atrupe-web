// Icon Imports
import { Logo } from '@/components/Logo'

// Carga inicial: o logo entra com atraso (espera curta não pisca) e pulsa
// suave, no lugar do quique (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 5)
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="min-h-screen flex justify-center items-center bg-gray-100"
    >
      <Logo width={60} className="animate-skeleton" />
    </div>
  )
}
