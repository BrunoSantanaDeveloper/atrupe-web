import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import { GeneralInfoTab } from './tabs/GeneralInfoTab'
import { IconUser, IconBuilding } from '@tabler/icons-react'
import {
  defaultPersonValues,
  defaultCompanyValues,
  NewClientFormType,
} from './schema'
// import { ClientTypeToggleButton } from '@/app/(app)/vendas/orcamentos/components/NewClient/ClientTypeToggleButton'
import { AddressTab } from './tabs/AddressTab'
import { ResponsibilitiesTab } from './tabs/ResponsibilitiesTab'
import { CreditLimitTab } from './tabs/CreditLimitTab'
import { useFormContext } from 'react-hook-form'
import FormToggleCard from '@/components/common/form/FormToggleCard'
import { toast } from 'sonner'

interface Props {
  activeTab: string
  setActiveTab: (tab: string) => void
  showCreditLimit?: boolean
}

export function NewClientForm({
  activeTab,
  setActiveTab,
  showCreditLimit = true,
}: Props) {
  const form = useFormContext<NewClientFormType>()
  const { reset, watch, trigger } = form

  const clientType = watch('type')

  const toggleOptions = [
    {
      label: 'Pessoa física',
      description: '',
      value: 'PERSON',
      icon: IconUser,
    },
    {
      label: 'Pessoa jurídica',
      description: '',
      value: 'COMPANY',
      icon: IconBuilding,
    },
  ]

  const handleTabChange = async (value: string) => {
    // Get tab fields
    const fields = activeTab as keyof NewClientFormType

    const isValid = await trigger(fields)

    if (isValid) {
      setActiveTab(value)
    } else {
      toast.error('Preencha todos os campos obrigatórios')
    }
  }

  return (
    <>
      <div className="w-full">
        <FormToggleCard
          options={toggleOptions}
          onChange={(value) =>
            reset(
              value === 'PERSON' ? defaultPersonValues : defaultCompanyValues,
            )
          }
        />
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full my-4">
          <TabsTrigger value="general" className="w-full">
            Informações gerais
          </TabsTrigger>
          <TabsTrigger value="addresses" className="w-full">
            Endereço
          </TabsTrigger>
          <TabsTrigger value="responsibilities" className="w-full">
            Responsáveis
          </TabsTrigger>
          {showCreditLimit && (
            <TabsTrigger value="creditLimit" className="w-full">
              Limite de crédito
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <GeneralInfoTab type={clientType} />
        </TabsContent>
        <TabsContent value="addresses">
          <AddressTab />
        </TabsContent>
        <TabsContent value="responsibilities">
          <ResponsibilitiesTab />
        </TabsContent>
        {showCreditLimit && (
          <TabsContent value="creditLimit">
            <CreditLimitTab />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
