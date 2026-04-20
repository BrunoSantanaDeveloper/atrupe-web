// Components
import { DashboardRevenues } from './Revenues'
import { DashboardExpenses } from './Expenses'
import { DashboardQuotations } from './Quotations'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FiscalOnboardingBanner } from './FiscalOnboardingBanner'
import { FiscalSetupModal } from './FiscalSetupModal'
// import { DashboardTopClients } from './TopClients'
// import { DashboardQuickAccess } from './QuickAccess'
// import { DashboardSalesBySeller } from './SalesBySeller'
// import { DashboardSalesEvolution } from './SalesEvolution'

export function Dashboard() {
  return (
    <div className="space-y-4 mt-1 w-full">
      <FiscalOnboardingBanner />
      <FiscalSetupModal />
      <div className="flex flex-wrap gap-4">
        <PermissionGate permissions={['financial:flow:view']}>
          <DashboardRevenues />
        </PermissionGate>
        <PermissionGate permissions={['financial:flow:view']}>
          <DashboardExpenses />
        </PermissionGate>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-4 flex-[1_1_900px]">
          <PermissionGate permissions={['sale:quotation:view']}>
            <DashboardQuotations />
          </PermissionGate>
          {/* <DashboardSalesEvolution /> */}
        </div>
        {/* <DashboardQuickAccess /> */}
      </div>
      {/* <div className="flex flex-wrap gap-4">
        <DashboardSalesBySeller />
        <DashboardTopClients />
      </div> */}
    </div>
  )
}
