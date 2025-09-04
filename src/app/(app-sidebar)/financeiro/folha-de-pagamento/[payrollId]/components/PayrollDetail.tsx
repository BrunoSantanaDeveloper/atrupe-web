'use client'

// Next
import { notFound } from 'next/navigation'

// UI
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { PayrollItems } from './PayrollItems'
import { PayrollMovement } from './PayrollMovement'
import { PayrollActions } from './PayrollActions'
import { Topbar } from '@/components/common/Topbar'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Lib
import { cn } from '@/lib/utils'
import { getItem } from '@/actions/_cruds'

// Third-party
import { useIsMutating, useIsFetching, useQuery } from '@tanstack/react-query'

// Hooks
import { usePreviousUrl } from '@/hooks/usePreviousUrl'

// Consts
import { payrollStatusObj } from '@/consts/payroll'
import { PayrollDetailType } from '@/types/financial/payroll'

interface Props {
  payrollId: string
}

export function PayrollDetail({ payrollId }: Props) {
  const isMutating = useIsMutating()
  const isFetching = useIsFetching()
  const previousUrl = usePreviousUrl('/financeiro/folha-de-pagamento')

  const { data, isLoading, error } = useQuery({
    staleTime: Infinity,
    queryKey: ['payroll-data', payrollId],
    queryFn: () => getItem({ route: `/financial/salary-sheets/${payrollId}` }),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Topbar title="Folha de pagamento" previousPage={previousUrl} />
        <div className="pt-2">
          <div className="inline-flex items-center h-[70px] w-42 px-6 gap-3 shadow justify-start bg-white rounded-lg border border-gray-200 ">
            <Skeleton className="size-[38px] rounded-full" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[38px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <TableSkeleton cols={6} rows={3} />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Skeleton className="size-[40px]" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <TableSkeleton cols={5} rows={2} />
          </CardContent>
        </Card>
      </div>
    )
  }

  const payrollData: PayrollDetailType = data?.data

  if (error) throw new Error(error.message)

  if (!payrollData) notFound()

  return (
    <PermissionGate permissions={['financial:payroll:view']}>
      <div
        className={cn(
          'relative space-y-5',
          (isMutating > 0 || isFetching > 0) &&
            'pointer-events-none opacity-50',
        )}
      >
        <Topbar
          title={`Folha de pagamento ${(payrollData?.month + 1).toString().padStart(2, '0')}/${payrollData?.year.toString().slice(-2)}`}
          supportText={payrollData?.employee?.name || ''}
          previousPage={previousUrl}
          badge={{
            text: payrollStatusObj[payrollData?.status]?.text,
            variant: payrollStatusObj[payrollData?.status]?.variant,
          }}
        />
        <div className="space-y-3">
          <PayrollActions data={payrollData} />
          <PayrollItems data={payrollData} />
          <PayrollMovement data={payrollData} />
        </div>
        {isMutating > 0 || isFetching > 0 ? (
          <Spinner classname="absolute top-1/2 left-1/2 size-10 -ml-5" />
        ) : null}
      </div>
    </PermissionGate>
  )
}
