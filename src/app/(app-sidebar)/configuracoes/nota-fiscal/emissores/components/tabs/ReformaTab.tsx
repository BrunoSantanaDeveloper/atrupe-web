'use client'

import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormSwitch } from '@/components/common/form/FormSwitch'

/**
 * Regime de apuração do IBS/CBS do optante do Simples (`regApIBSCBSSN`).
 * Decide, por tributo, se a apuração sai pelo Simples ou pelo regime regular —
 * no 2 a CBS vai pelo Simples e o IBS pelo regular.
 */
const regimeApuracaoOptions = [
  { value: 'none', label: 'Não informar' },
  { value: '1', label: '1 - IBS e CBS apurados pelo Simples Nacional' },
  { value: '2', label: '2 - CBS pelo Simples e IBS pelo regime regular' },
  { value: '3', label: '3 - IBS e CBS pelo regime regular' },
]

export function ReformaTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
        Durante a fase de teste de 2026 valem 0,1% de IBS e 0,9% de CBS, sem
        recolhimento para quem cumpre as obrigações acessórias. Deixe as
        alíquotas em branco para usar esses padrões nacionais.
      </div>

      <div className="space-y-4">
        <div>
          <FormSwitch
            name="reformaTributariaAtiva"
            label="Reforma Tributária ativa na NF-e e NFC-e"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quem ativa é a Invoicy, empresa a empresa. Ligar aqui sem que eles
            tenham ativado faz o grupo de IBS/CBS ser ignorado em silêncio — o
            layout de emissão atual não tem esses campos. Confirme com o suporte
            deles antes de marcar.
          </p>
        </div>

        <div>
          <FormSwitch
            name="ibsCbsEnviarValores"
            label="Enviar valores de IBS/CBS na NFS-e"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A NFS-e não depende de ativação: os códigos de CST e classificação
            já são enviados. Este campo controla o envio dos <em>valores</em>,
            que é opcional no layout e exigido por parte dos municípios.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <FormSelect
          name="regApIbsCbsSn"
          label="Regime de apuração do IBS/CBS (Simples Nacional)"
          options={regimeApuracaoOptions}
        />
        <p className="text-xs text-muted-foreground -mt-2">
          Só se aplica a optante do Simples. Fora dele, a apuração é sempre pelo
          regime regular.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="aliquotaIbsUf"
            label="Alíquota IBS estadual (%)"
            type="number"
            placeholder="0,1"
          />
          {/* Definida por cada município: por isso vive no emissor e não num
              padrão nacional. */}
          <FormInput
            name="aliquotaIbsMun"
            label="Alíquota IBS municipal (%)"
            type="number"
            placeholder="0,0"
          />
          <FormInput
            name="aliquotaCbs"
            label="Alíquota CBS (%)"
            type="number"
            placeholder="0,9"
          />
        </div>
      </div>
    </div>
  )
}
