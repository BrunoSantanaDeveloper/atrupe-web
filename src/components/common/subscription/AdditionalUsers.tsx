'use client'

import { Card } from '@/components/ui/card'
import { FormInput } from '@/components/common/form/FormInput'
import { IconCoin } from '@tabler/icons-react'

interface AdditionalUsersProps {
  userCount: number
  onUserCountChange: (value: number) => void
  pricePerUser?: number
}

export function AdditionalUsers({
  userCount,
  onUserCountChange,
  pricePerUser = 25.0,
}: AdditionalUsersProps) {
  const calculateAdditionalCost = () => {
    return userCount * pricePerUser
  }

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-700 mb-1">Usuários adicionais</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Adicione quantos usuários quiser ao seu plano.
      </p>

      <Card className="mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <IconCoin className="w-6 h-6 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-base font-semibold">Usuários extras</span>
              <span className="text-sm text-muted-foreground">
                R${' '}
                {pricePerUser.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}{' '}
                por usuário/mês
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20">
              <FormInput
                name="additionalUsers"
                placeholder="0"
                type="number"
                min="0"
                max="100"
                value={userCount.toString()}
                additionalOnChange={(value) =>
                  onUserCountChange(Number(value) || 0)
                }
                className="text-center"
              />
            </div>
            <span className="text-xl font-bold text-emerald-900 min-w-[100px] text-right">
              R${' '}
              {calculateAdditionalCost().toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
              <span className="text-base font-normal text-muted-foreground block">
                /mês
              </span>
            </span>
          </div>
        </div>

        {userCount > 0 && (
          <div className="px-6 pb-4 border-t border-gray-100">
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>
                  {userCount} usuário{userCount !== 1 ? 's' : ''} adicional
                  {userCount !== 1 ? 'is' : ''}
                </strong>{' '}
                será{userCount !== 1 ? 'ão' : ''} adicionado
                {userCount !== 1 ? 's' : ''} ao seu plano.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
