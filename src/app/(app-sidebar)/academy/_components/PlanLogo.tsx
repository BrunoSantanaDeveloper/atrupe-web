'use client'

// Next
import Image, { StaticImageData } from 'next/image'
import { usePathname } from 'next/navigation'

// Logos
import start from '@/assets/images/start-logo.png'
import lite from '@/assets/images/lite-logo.png'
import pro from '@/assets/images/pro-logo.png'
import elite from '@/assets/images/elite-logo.png'
import full from '@/assets/images/full-logo.png'

const plans: Record<string, StaticImageData> = {
  start,
  lite,
  pro,
  elite,
  full,
}

export function PlanLogo() {
  const pathname = usePathname()
  const currentPlan = pathname.split('/').pop() || 'start'

  const logo = plans[currentPlan] || start

  return <Image src={logo} alt="logo atrupe" priority />
}
