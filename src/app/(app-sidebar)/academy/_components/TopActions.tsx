'use client'

// Lib
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Components
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CustomButton } from '@/components/common/CustomButton'

// Icons
import { IconFileFilled } from '@tabler/icons-react'

// Assets
import atrupeAcademy from '@/assets/images/academy-logo.png'

export default function TopActions() {
  const pathname = usePathname()
  const currentPlan = pathname.split('/').pop() || 'start'
  const [isAcademyEnabled, setIsAcademyEnabled] = useState(true)

  useEffect(() => {
    const isAcademyEnabled = localStorage.getItem('academy') === 'true'
    setIsAcademyEnabled(isAcademyEnabled)
  }, [])

  const handleOpenManual = () => {
    window.open(`/docs/atrupe-manual-completo-${currentPlan}.pdf`, '_blank')
  }

  const handleToggleAcademy = (value: boolean) => {
    localStorage.setItem('academy', value ? 'true' : 'false')
    setIsAcademyEnabled(value)
  }

  return (
    <>
      <CustomButton
        icon={IconFileFilled}
        iconVariant="errorGhost"
        title={`Manual completo ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}`}
        className="h-14"
        onClick={handleOpenManual}
      />
      <Label htmlFor="atrupe-academy">
        <div className="flex items-center gap-3 justify-start shadow bg-white px-6 py-4 rounded-lg border h-14">
          <Switch
            id="atrupe-academy"
            onCheckedChange={handleToggleAcademy}
            checked={isAcademyEnabled}
          />
          <Image src={atrupeAcademy} alt="Atrupe Academy" />
        </div>
      </Label>
    </>
  )
}
