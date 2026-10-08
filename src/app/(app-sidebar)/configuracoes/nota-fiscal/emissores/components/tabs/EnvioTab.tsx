'use client'

import { useFormContext } from 'react-hook-form'

import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'

export function EnvioTab() {
  const form = useFormContext()
  const sendFiscalAutomatically = form.watch('sendDanfeXmlAutomatically')

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="type-card-title pb-2 border-b border-gray-100">
          Informações Complementares
        </h3>
        <FormTextarea
          name="taxInfoText"
          label="Informações Fiscais Complementares"
          placeholder="Texto que será incluído nas notas fiscais"
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2 pb-2 border-b border-gray-100">
          <h3 className="type-card-title">Envio ao Cliente</h3>
          <p className="text-sm text-muted-foreground">
            Configure o envio automático dos documentos fiscais quando a NF-e
            for autorizada.
          </p>
        </div>

        <FormSwitch
          name="sendDanfeXmlAutomatically"
          label="Enviar DANFE/XML automaticamente ao cliente"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCheckbox
            name="sendDanfeAutomatically"
            label="Enviar DANFE"
            disabled={!sendFiscalAutomatically}
          />
          <FormCheckbox
            name="sendXmlAutomatically"
            label="Enviar XML"
            disabled={!sendFiscalAutomatically}
          />
        </div>

        <FormInput
          name="sendFiscalEmailCopyTo"
          label="E-mail para cópia"
          type="email"
          placeholder="financeiro@empresa.com"
        />
      </div>
    </div>
  )
}
