// Components
import { DashboardRevenues } from './Revenues'
import { DashboardExpenses } from './Expenses'
import { DashboardQuotations } from './Quotations'
// import { DashboardTopClients } from './TopClients'
// import { DashboardQuickAccess } from './QuickAccess'
// import { DashboardSalesBySeller } from './SalesBySeller'
// import { DashboardSalesEvolution } from './SalesEvolution'

export function Dashboard() {
  return (
    <div className="space-y-4 mt-1 w-full">
      <div className="flex flex-wrap gap-4">
        <DashboardRevenues />
        <DashboardExpenses />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-4 flex-[1_1_900px]">
          <DashboardQuotations />
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
