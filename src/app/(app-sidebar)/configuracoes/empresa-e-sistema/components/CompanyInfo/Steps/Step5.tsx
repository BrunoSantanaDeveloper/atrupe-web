'use client'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import { IconTrash } from '@tabler/icons-react'

// UI Components
import { Button } from '@/components/ui/button'

import { Separator } from '@/components/ui/separator'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

const toggleOptions = [
  {
    label: 'Certificado A1',
    value: 'A1',
  },
  {
    label: 'Certificado A3',
    value: 'A3',
  },
]

export function Step5() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormInput name="fiscal.cnae" label="CNAE" placeholder="Digite aqui" />
        <FormInput
          name="fiscal.accessKey"
          label="Chave de acesso (AccessKey)"
          placeholder="Digite aqui"
        />
      </div>

      <Separator className="bg-gray-300" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-gray-700">
            Certificado Digital
          </h3>
          <Button
            type="button"
            variant="neutralGhost"
            size="icon"
            RightIcon={IconTrash}
          />
        </div>

        <div className="mb-4">
          <FormToggleCard
            name="fiscal.certificateType"
            options={toggleOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FormInput
            name="fiscal.certificateDescription"
            label="Descrição"
            placeholder="Ex: Teste de Nota"
          />
          <FormInput
            name="fiscal.certificatePassword"
            label="Senha"
            type="password"
            placeholder="Digite aqui"
          />
        </div>
      </div>
    </div>
  )
}
