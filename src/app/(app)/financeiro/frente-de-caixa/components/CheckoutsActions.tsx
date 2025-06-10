// Components
import { CustomButton } from '@/components/common/CustomButton'

export function CheckoutsActions() {
  return (
    <div className="flex flex-wrap gap-4">
      <CustomButton caption="Caixa empresa" title="Frente de caixa 1" />
      <CustomButton caption="Caixa empresa" title="Frente de caixa 2" />
      <CustomButton caption="Stripe" title="Frente de caixa 3" />
    </div>
  )
}
