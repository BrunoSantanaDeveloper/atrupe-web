'use client'

/**
 * ProductFiscalTab
 *
 * Conteúdo reutilizável de configuração fiscal de produto.
 * Utiliza `useFormContext` para integrar com qualquer formulário
 * react-hook-form que contenha os campos do `productFiscalDataSchema`.
 *
 * Usado em:
 * - ProductFiscalDataDialog (configuração fiscal standalone)
 * - NewProduct.tsx (aba "Dados Fiscais" dentro do modal de produto)
 * - InvoiceItemConfigDialog (configuração fiscal do item da NF)
 */

import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import {
  icmsOriginOptions,
  icmsCstOptions,
  icmsBaseModalityOptions,
  pisCstOptions,
  ipiCstOptions,
  commercialUnitOptions,
} from './schema'

export function ProductFiscalTab() {
  return (
    <div className="space-y-6">
      {/* Item */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">
          Identificação do Item
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="productCode"
            label="Código"
            placeholder="Digite aqui"
          />
          <FormSelect
            name="commercialUnit"
            label="Unidade comercial"
            options={commercialUnitOptions}
          />
          <FormInput
            name="ncm"
            label="NCM"
            placeholder="00000000"
            maxLength={8}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="cean"
            label="CEAN (EAN/GTIN)"
            placeholder="SEM GTIN"
          />
          <div className="grid grid-cols-3 gap-2">
            <FormInput
              name="cfopInState"
              label="CFOP Estadual"
              placeholder="5102"
            />
            <FormInput
              name="cfopOutState"
              label="CFOP Interest."
              placeholder="6102"
            />
            <FormInput
              name="cfopExport"
              label="CFOP Export."
              placeholder="7102"
            />
          </div>
        </div>
      </div>

      {/* ICMS */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">
          ICMS
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            name="icmsOrigin"
            label="Origem da mercadoria"
            options={icmsOriginOptions}
          />
          <FormSelect
            name="icmsCst"
            label="CST ICMS / CSOSN"
            options={icmsCstOptions}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="icmsRate"
            label="Alíquota ICMS (%)"
            type="number"
            placeholder="0.00"
          />
          <FormInput
            name="icmsCreditRate"
            label="Alíquota Crédito (%)"
            type="number"
            placeholder="0.00"
          />
          <FormSelect
            name="icmsBaseModality"
            label="Modalidade BC"
            options={icmsBaseModalityOptions}
          />
        </div>

        {/* A margem da ST vem de protocolo entre estados, por NCM, e a alíquota
            do FCP é de lei estadual: nenhum dos dois é derivável, por isso
            ficam no cadastro do produto. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="icmsStMva"
            label="MVA da ST (%)"
            type="number"
            placeholder="0.00"
          />
          <FormInput
            name="icmsStReducao"
            label="Redução BC da ST (%)"
            type="number"
            placeholder="0.00"
          />
          <FormInput
            name="icmsStRate"
            label="Alíquota ICMS-ST (%)"
            type="number"
            placeholder="0.00"
          />
          <FormInput
            name="fcpRate"
            label="Alíquota FCP (%)"
            type="number"
            placeholder="0.00"
          />
          <FormInput
            name="fcpStRate"
            label="Alíquota FCP-ST (%)"
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* PIS / COFINS */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">
          PIS / COFINS
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect name="pisCst" label="CST PIS" options={pisCstOptions} />
          <FormInput
            name="pisRate"
            label="Alíquota PIS (%)"
            type="number"
            placeholder="0.00"
          />
          <FormSelect
            name="cofinsCst"
            label="CST COFINS"
            options={pisCstOptions}
          />
          <FormInput
            name="cofinsRate"
            label="Alíquota COFINS (%)"
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* IPI */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">
          IPI
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="ipiFramework"
            label="Enquadramento"
            placeholder="0"
          />
          <FormSelect
            name="ipiCst"
            label="CST IPI"
            options={ipiCstOptions}
            placeholder="Selecione"
          />
          <FormInput
            name="ipiRate"
            label="Alíquota IPI (%)"
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  )
}
