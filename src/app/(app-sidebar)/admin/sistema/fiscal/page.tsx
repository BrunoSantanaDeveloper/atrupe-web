import { IcmsAliquotasForm } from './components/IcmsAliquotasForm'
import { getItem } from '@/actions/_cruds'
import { Topbar } from '@/components/common/Topbar'
import type { IcmsAliquotaInterna } from '@/actions/systemSettings'

export function metadata() {
  return {
    title: 'Fiscal - Sistema',
  }
}

export default async function FiscalPage() {
  const res = await getItem({
    route: '/system-settings/icms-aliquotas-internas',
  })
  const aliquotas: IcmsAliquotaInterna[] = res.success
    ? ((res.data as IcmsAliquotaInterna[]) ?? [])
    : []

  return (
    <div className="space-y-5">
      <Topbar
        title="Parâmetros Fiscais"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <div className="space-y-5">
        {res.success ? (
          <IcmsAliquotasForm initialData={aliquotas} />
        ) : (
          <p className="text-sm text-red-600">
            Não foi possível carregar as alíquotas internas de ICMS.
          </p>
        )}
      </div>
    </div>
  )
}
