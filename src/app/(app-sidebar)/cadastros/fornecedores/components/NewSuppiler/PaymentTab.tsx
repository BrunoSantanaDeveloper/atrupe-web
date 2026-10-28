'use client'

// Dados de pagamento do fornecedor (decisão do produto, 26/10/2026): como
// pagar as contas a pagar dele — inclusive as que o terceirizado gera ao
// aprovar a venda. Tudo opcional; é informação para quem paga.

import { FormInput } from '@/components/common/form/FormInput'
import type { NewSupplierFormType } from './schema'

export function PaymentTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray">
        Como este fornecedor costuma receber. Aparece nas contas a pagar dele
        para quem for pagar.
      </p>
      <div className="flex flex-wrap gap-4">
        <FormInput<NewSupplierFormType>
          name="payment.pixKey"
          label="Chave Pix"
          placeholder="CPF/CNPJ, e-mail, telefone ou chave aleatória"
          width="w-full"
        />
        <FormInput<NewSupplierFormType>
          name="payment.bankName"
          label="Banco"
          width="flex-[1_0_220px]"
        />
        <FormInput<NewSupplierFormType>
          name="payment.bankAgency"
          label="Agência"
          width="flex-[1_0_120px]"
        />
        <FormInput<NewSupplierFormType>
          name="payment.bankAccount"
          label="Conta"
          width="flex-[1_0_160px]"
        />
        <FormInput<NewSupplierFormType>
          name="payment.accountHolder"
          label="Titular da conta"
          width="w-full"
        />
        <FormInput<NewSupplierFormType>
          name="payment.paymentTerms"
          label="Prazo e forma habitual"
          placeholder="Ex.: 30 dias, boleto"
          width="w-full"
        />
      </div>
    </div>
  )
}
