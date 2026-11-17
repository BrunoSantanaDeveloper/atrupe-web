import { FormTextarea } from '@/components/common/form/FormTextarea'

type ProposalTextsForm = {
  textBeforeItems?: string
  textAfterItems?: string
}

/**
 * Textos da proposta comercial próprios da série, como no legado. A série sem
 * texto usa o da empresa (Configuração da empresa › Personalização).
 */
export function ProposalTextsFields() {
  return (
    <div className="w-full space-y-3">
      <div>
        <p className="text-md font-semibold text-gray-700">
          Textos da proposta comercial
        </p>
        <p className="text-sm text-gray-500">
          Saem na proposta dos orçamentos desta série. Em branco, valem os
          textos de Configuração da empresa › Personalização.
        </p>
      </div>
      <FormTextarea<ProposalTextsForm>
        name="textBeforeItems"
        label="Texto antes dos itens"
        placeholder="Em branco, usa o texto da empresa"
        rows={4}
      />
      <FormTextarea<ProposalTextsForm>
        name="textAfterItems"
        label="Texto depois dos itens"
        placeholder="Em branco, usa o texto da empresa"
        rows={5}
      />
    </div>
  )
}
