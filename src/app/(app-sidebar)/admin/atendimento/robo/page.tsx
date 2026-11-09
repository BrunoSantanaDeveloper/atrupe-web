import { Topbar } from '@/components/common/Topbar'
import { RoboAtendimento } from '../_components/RoboAtendimento'

export function metadata() {
  return {
    title: 'Atendimento - Robô',
  }
}

// O contexto do robô do suporte (camada da plataforma): só o superadmin lê e
// grava, e a API confere de novo. ?pergunta= vem do relatório das lacunas.
export default function RoboPage({
  searchParams,
}: {
  searchParams: { pergunta?: string }
}) {
  return (
    <div className="space-y-5">
      <Topbar
        title="Robô de atendimento"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <RoboAtendimento
        escopo="plataforma"
        perguntaNova={searchParams?.pergunta}
      />
    </div>
  )
}
