'use client'

import { useEffect } from 'react'
import { useRouter } from '@/hooks/useRouter'

import Loading from '@/app/loading'
import logout from '@/actions/logout'
import { useQueryClient } from '@tanstack/react-query'

export default function Logout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    async function signOut() {
      await logout()
      queryClient.clear()
      router.replace('/login')
    }

    signOut()
  }, [router, queryClient])

  return <Loading />
}
