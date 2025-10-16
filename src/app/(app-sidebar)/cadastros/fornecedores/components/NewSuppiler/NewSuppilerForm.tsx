import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import { IconUser, IconBuilding } from '@tabler/icons-react'

import { useFormContext } from 'react-hook-form'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import {
  NewClientFormType,
  defaultCompanyValues,
  defaultPersonValues,
} from '../../../clientes/components/NewClient/schema'
import { GeneralInfoTab } from '../../../clientes/components/NewClient/tabs/GeneralInfoTab'
import { AddressTab } from '../../../clientes/components/NewClient/tabs/AddressTab'
import { ResponsibilitiesTab } from '../../../clientes/components/NewClient/tabs/ResponsibilitiesTab'
import { NewSupplierFormType } from './schema'
import { toast } from 'sonner'

interface Props {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function NewSupplierForm({ activeTab, setActiveTab }: Props) {
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
    const fields = activeTab as keyof NewSupplierFormType

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
          <TabsTrigger value="address" className="w-full">
            Endereço
          </TabsTrigger>
          <TabsTrigger value="responsibilities" className="w-full">
            Responsáveis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralInfoTab type={clientType} context="supplier" />
        </TabsContent>
        <TabsContent value="address">
          <AddressTab />
        </TabsContent>
        <TabsContent value="responsibilities">
          <ResponsibilitiesTab />
        </TabsContent>
      </Tabs>
    </>
  )
}
