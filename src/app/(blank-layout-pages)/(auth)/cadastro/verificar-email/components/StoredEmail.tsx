'use client'

// Store
import { useSignupStore } from '@/store/signupStore'

export function StoredEmail() {
  const { signupData } = useSignupStore()

  return <>{signupData?.email || 'informado'}</>
}
