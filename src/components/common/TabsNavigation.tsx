// Next Imports
import Link from 'next/link'

// UI component Imports
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icon Imports
import { LucideIcon } from '@/components/LucideIcon'

// Type Imports
import type { LucideIconType } from '@/components/LucideIcon'

export type TabNavType = {
  value: string
  label: string
  icon?: LucideIconType
}

interface Props {
  tabs: TabNavType[]
  activeTab: string
  link: string
}

export function TabsNavigation({ tabs, activeTab, link }: Props) {
  return (
    <Tabs value={activeTab}>
      <TabsList className="mb-4 rounded-lg overflow-hidden">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link href={`${link}${tab.value}`}>
              {tab.icon && <LucideIcon icon={tab.icon} size={16} />}
              <span>{tab.label}</span>
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
