'use client'

/**
 * RecipientFiscalFields
 *
 * Componente reutilizável para campos fiscais de destinatário/cliente:
 * - Inscrição Estadual (IE) com checkbox "ISENTO"
 * - Indicador IE (select)
 * - Inscrição Municipal (IM, opcional)
 *
 * Lógicas automáticas:
 * - ISENTO marcado → IE = "ISENTO" (disabled) + indicadorIE = "9" (disabled)
 * - ISENTO desmarcado → IE limpo (enabled) + indicadorIE = "1" (Contribuinte ICMS, enabled)
 * - indicadorIE = "9" selecionado → ISENTO marcado automaticamente
 * - indicadorIE = "1" ou "2" selecionado → ISENTO desmarcado
 */

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'

const INDICADOR_IE_OPTIONS = [
  { value: '1', label: '1 - Contribuinte ICMS' },
  { value: '2', label: '2 - Contribuinte Isento' },
  { value: '9', label: '9 - Não Contribuinte' },
]

interface RecipientFiscalFieldsProps {
  /**
   * Prefixo dos campos no form.
   * Ex: "general." para cadastro de cliente → aponta para general.stateRegistration
   * Ex: "" para dialog da NF → aponta para stateRegistration diretamente
   */
  namePrefix?: string
  /** Se true, exibe o campo Inscrição Municipal */
  showInscricaoMunicipal?: boolean
  /**
   * Largura aplicada a cada campo via prop `width` do DS.
   * Ex: "flex-[1_0_300px]" para layout flex, "col-span-1" para grid
   */
  fieldWidth?: string
}

export function RecipientFiscalFields({
  namePrefix = '',
  showInscricaoMunicipal = false,
  fieldWidth = 'flex-[1_0_300px]',
}: RecipientFiscalFieldsProps) {
  const { setValue, watch } = useFormContext()

  const ieFieldName = `${namePrefix}stateRegistration`
  const indicadorIEFieldName = `${namePrefix}indicadorIE`

  const ieValue = watch(ieFieldName) as string | undefined
  const indicadorIEValue = watch(indicadorIEFieldName)

  // Estado local do checkbox ISENTO
  const [isIsento, setIsIsento] = useState<boolean>(() => {
    const currentIe = String(ieValue ?? '')
    const currentIndicador = String(indicadorIEValue ?? '9')
    return currentIe.toUpperCase() === 'ISENTO' || currentIndicador === '9'
  })

  // Sincronizar quando os valores do form mudarem externamente (ex: reset, load de dados)
  useEffect(() => {
    const currentIe = String(ieValue ?? '')
    const currentIndicador = String(indicadorIEValue ?? '9')
    const shouldBeIsento =
      currentIe.toUpperCase() === 'ISENTO' || currentIndicador === '9'
    setIsIsento(shouldBeIsento)
  }, [ieValue, indicadorIEValue])

  /** Handler do checkbox ISENTO */
  const handleIsentoChange = (checked: boolean) => {
    setIsIsento(checked)
    if (checked) {
      // Marca ISENTO: preenche IE com "ISENTO" e indicadorIE com "9"
      setValue(ieFieldName, 'ISENTO', { shouldValidate: true })
      setValue(indicadorIEFieldName, '9', { shouldValidate: true })
    } else {
      // Desmarca ISENTO: limpa IE e seta indicadorIE para "1" (Contribuinte ICMS)
      setValue(ieFieldName, '', { shouldValidate: true })
      setValue(indicadorIEFieldName, '1', { shouldValidate: true })
    }
  }

  /** Callback quando o select indicadorIE muda — sincroniza o checkbox ISENTO */
  const handleIndicadorIEChange = (value: string) => {
    if (value === '9') {
      setIsIsento(true)
      setValue(ieFieldName, 'ISENTO', { shouldValidate: true })
    } else {
      if (isIsento) {
        setIsIsento(false)
        setValue(ieFieldName, '', { shouldValidate: true })
      }
    }
  }

  return (
    <>
      {/* Inscrição Estadual + checkbox ISENTO */}
      <div
        className={`flex items-end gap-2 ${fieldWidth}`}
        style={{ flex: '1 0 300px' }}
      >
        <FormInput
          name={ieFieldName}
          label="Inscrição Estadual"
          placeholder="Somente números"
          disabled={isIsento}
          maxLength={14}
          width="flex-1"
        />
        <div className="pb-[9px] shrink-0">
          <CheckboxBasic
            name={`${namePrefix}_isento_ctrl`}
            label="ISENTO"
            checked={isIsento}
            onCheckedChange={handleIsentoChange}
            className="flex items-center gap-1.5 whitespace-nowrap"
          />
        </div>
      </div>

      {/* Indicador IE */}
      <FormSelect
        name={indicadorIEFieldName}
        label="Indicador IE"
        options={INDICADOR_IE_OPTIONS}
        disabled={isIsento}
        additionalOnChange={handleIndicadorIEChange}
        width={fieldWidth}
      />

      {/* Inscrição Municipal (opcional) */}
      {showInscricaoMunicipal && (
        <FormInput
          name={`${namePrefix}municipalRegistration`}
          label="Inscrição Municipal"
          placeholder="Digite aqui"
          width={fieldWidth}
        />
      )}
    </>
  )
}
