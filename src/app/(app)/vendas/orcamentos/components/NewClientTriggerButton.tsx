import { IconCirclePlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useNewClientStore } from '../store/useNewClientStore'

const NewClientTriggerButton = () => {
  const { onToggleModalVisibility } = useNewClientStore()
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggleModalVisibility}
      LeftIcon={IconCirclePlus}
    >
      Pré-cadastro de cliente
    </Button>
  )
}
export default NewClientTriggerButton
