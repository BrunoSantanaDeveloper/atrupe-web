import { Topbar } from '@/components/common/Topbar'
import { SugestoesConhecimento } from '../_components/SugestoesConhecimento'

export function metadata() {
  return {
    title: 'Atendimento - Sugestões',
  }
}

// Perguntas e respostas que o robô tirou das conversas resolvidas pela
// equipe. Nada entra no conhecimento sem o superadmin aprovar.
export default function SugestoesPage() {
  return (
    <div className="space-y-5">
      <Topbar
        title="Sugestões de conhecimento"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <SugestoesConhecimento escopo="plataforma" />
    </div>
  )
}
