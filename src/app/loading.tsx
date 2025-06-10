// Icon Imports
import { Logo } from '@/components/Logo'

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Logo width={60} className="animate-bounce" />
    </div>
  )
}
