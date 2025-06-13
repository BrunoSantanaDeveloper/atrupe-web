// Components
import { PlanLogo } from './_components/PlanLogo'
import TopActions from './_components/TopActions'

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex justify-between items-center gap-4 mb-4">
        <PlanLogo />
        <div className="flex items-center gap-4">
          <TopActions />
        </div>
      </div>
      {children}
    </>
  )
}
