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

const STORAGE_KEY = 'dashboard:show-values'
const MASK = '••••••'

interface DashboardValuesContextValue {
  showValues: boolean
  toggleValues: () => void
  formatValue: (value: number) => string
  maskText: (text: string) => string
}

const DashboardValuesContext = createContext<DashboardValuesContextValue>({
  showValues: false,
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
      showValues,
      toggleValues,
      formatValue: (amount: number) =>
        showValues ? formatCurrencyToBrl(amount) : MASK,
      maskText: (text: string) => (showValues ? text : MASK),
    }),
    [showValues, toggleValues],
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
