import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { Button } from '@/components/ui/button'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'
import { NewClientFormType } from '../schema'
import { MaskPhoneNumber } from '@/lib/utils'
import { FeaturedIcon } from '@/components/ui/featured-icon'

export function ResponsibilitiesTab() {
  const { control, setValue } = useFormContext<NewClientFormType>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'responsibilities',
  })

  const handleAddResponsible = () => {
    append({
      name: '',
      sector: '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
    })
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="relative space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="type-card-title">Responsável {index + 1}</h3>
            {index > 0 && (
              <Button
                type="button"
                size="iconSm"
                variant="neutralGhost"
                className="absolute top-1 right-1"
                onClick={() => remove(index)}
              >
                <IconTrash aria-hidden size={ICON_SIZE.sm} />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput<NewClientFormType>
              name={`responsibilities.${index}.name`}
              label="Nome"
              placeholder="Digite aqui"
            />

            <FormInput<NewClientFormType>
              name={`responsibilities.${index}.sector`}
              label="Setor"
              placeholder="Digite aqui"
            />

            <FormInput<NewClientFormType>
              name={`responsibilities.${index}.email`}
              label="E-mail"
              type="email"
              placeholder="Digite aqui"
            />

            <FormInput<NewClientFormType>
              name={`responsibilities.${index}.phone`}
              label="Telefone"
              inputMode="tel"
              placeholder="Digite aqui"
              additionalOnChange={(value) => {
                setValue(
                  `responsibilities.${index}.phone`,
                  MaskPhoneNumber(value),
                )
              }}
              maxLength={15}
            />

            <FormInput<NewClientFormType>
              name={`responsibilities.${index}.mobile`}
              label="Celular"
              inputMode="tel"
              placeholder="Digite aqui"
              additionalOnChange={(value) => {
                setValue(
                  `responsibilities.${index}.mobile`,
                  MaskPhoneNumber(value) ?? '',
                )
              }}
              maxLength={15}
            />

            <div className="col-span-2">
              <FormTextarea<NewClientFormType>
                name={`responsibilities.${index}.notes`}
                label="Observações"
                placeholder="Digite aqui"
              />
            </div>
          </div>
        </div>
      ))}
      <div className="w-full flex justify-center">
        <Button type="button" variant="ghost" onClick={handleAddResponsible}>
          <FeaturedIcon variant="light" Icon={IconPlus} rounded />
          Adicionar responsável
        </Button>
      </div>
    </div>
  )
}
