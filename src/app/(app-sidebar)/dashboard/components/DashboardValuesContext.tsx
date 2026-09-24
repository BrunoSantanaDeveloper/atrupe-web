'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { formatCurrencyToBrl } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'

const STORAGE_KEY = 'dashboard:show-values'
const MASK = '••••••'

interface DashboardValuesContextValue {
  showValues: boolean
  // EC-24: sem a permissão "Valores", o dashboard não mostra número nenhum e
  // o botão de olho nem aparece
  canSeeValues: boolean
  toggleValues: () => void
  formatValue: (value: number) => string
  maskText: (text: string) => string
}

const DashboardValuesContext = createContext<DashboardValuesContextValue>({
  showValues: false,
  canSeeValues: false,
  toggleValues: () => {},
  formatValue: () => MASK,
  maskText: () => MASK,
})

export function DashboardValuesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [showValues, setShowValues] = useState(false)
  const { hasPermission } = usePermissions()

  // A permissão manda: sem ela, não há o que alternar (EC-24)
  const canSeeValues = hasPermission('values:values:view')
  const visible = canSeeValues && showValues

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === 'true') {
      setShowValues(true)
    }
  }, [])

  const toggleValues = useCallback(() => {
    setShowValues((previous) => {
      window.localStorage.setItem(STORAGE_KEY, String(!previous))
      return !previous
    })
  }, [])

  const value = useMemo<DashboardValuesContextValue>(
    () => ({
      showValues: visible,
      canSeeValues,
      toggleValues,
      formatValue: (amount: number) =>
        visible ? formatCurrencyToBrl(amount) : MASK,
      maskText: (text: string) => (visible ? text : MASK),
    }),
    [visible, canSeeValues, toggleValues],
  )

  return (
    <DashboardValuesContext.Provider value={value}>
      {children}
    </DashboardValuesContext.Provider>
  )
}

export function useDashboardValues() {
  return useContext(DashboardValuesContext)
}
