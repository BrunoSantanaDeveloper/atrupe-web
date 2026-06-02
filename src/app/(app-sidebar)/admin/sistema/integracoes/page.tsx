import { AsaasForm } from './components/AsaasForm'
import { AiAccessForm } from './components/AiAccessForm'
import { getItem } from '@/actions/_cruds'
import { Topbar } from '@/components/common/Topbar'

export function metadata() {
  return {
    title: 'Integrações - Sistema',
  }
}

export default async function IntegracoesPage() {
  // O endpoint /system-settings/asaas retorna os dados
  const res = await getItem({ route: '/system-settings/asaas' })
  const config = res.success ? res.data : null
  const aiAccessRes = await getItem({ route: '/system-settings/ai-access' })
  const aiAccessEnabled = aiAccessRes.success
    ? aiAccessRes.data.enabled !== false
    : true

  return (
    <div className="space-y-5">
      <Topbar
        title="Integrações do Sistema"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <div className="space-y-5">
        <AiAccessForm initialEnabled={aiAccessEnabled} />
        <AsaasForm initialData={config} />
      </div>
    </div>
  )
}
