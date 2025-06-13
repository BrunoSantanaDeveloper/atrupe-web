// Components
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'

import { OpenCashAlertDialog } from './Actions/OpenCashAction'
import { useState } from 'react'
import { SearchParamsType } from '@/types/coreTypes'

import { cn } from '@/lib/utils'
import { bankIcons } from '@/consts/cashControl'
import { BankAccountsType } from '@/types/financial/bank'
import { useBankAccount } from '@/hooks/queries/useBankAccount'
import { IconAtrupeLogo } from '@/assets/icons/CustomIcons'

interface Props extends SearchParamsType {}

export default function CashControlActions(props: Props) {
  const { searchParams } = props

  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<BankAccountsType>()

  const bankAccounts = useBankAccount({
    filters: { cashControl: true },
  })

  return (
    <>
      <PermissionGate permissions={['financial:cash_control:create']}>
        <div className="flex flex-wrap gap-2">
          {bankAccounts?.data?.map((item, index) => {
            const cashOpen = item?.cashRegister.length > 0

            return (
              <CustomButton
                key={item?.id + index}
                icon={bankIcons[item?.bank?.icon] || IconAtrupeLogo}
                caption={item?.bank?.code + ' - ' + item?.bank?.name}
                title={item?.name}
                iconVariant={cashOpen ? 'successLight' : undefined}
                className={cn(cashOpen && 'bg-success-50 border-success-200')}
                onClick={() => {
                  if (cashOpen) return

                  setRowData(item)
                  setOpenDialog('openAlert')
                }}
              />
            )
          })}
        </div>
      </PermissionGate>
      <OpenCashAlertDialog
        open={openDialog === 'openAlert'}
        setOpen={setOpenDialog}
        rowData={rowData}
        searchParams={searchParams}
      />
    </>
  )
}
