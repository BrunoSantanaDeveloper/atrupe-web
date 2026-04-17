import React from 'react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  IconLayoutDashboard,
  IconUsers,
  IconBuildingStore,
  IconReceipt,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

export default function TabsSandboxPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* UNDERLINE TABS EXAMPLES */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-medium text-[#252e3b] mb-4">
              Underline Tabs
            </h2>
            <p className="text-sm border-l-4 border-[#14b375] pl-3 mb-8 text-gray-500">
              Baseados na hierarquia "Brand / Success / Gray". A aba "Active"
              muda a borda de base e cores do texto baseadas no 'intent'
            </p>
          </div>

          <div className="flex gap-16">
            {/* Columns headers */}
            <div className="flex flex-col space-y-6 w-[200px]">
              <div className="h-6"></div>
              <p className="text-sm font-semibold text-gray-500 text-right h-[56px] flex items-center justify-end">
                Default
              </p>
              <p className="text-sm font-semibold text-gray-500 text-right h-[56px] flex items-center justify-end">
                With icon
              </p>
              <p className="text-sm font-semibold text-gray-500 text-right h-[56px] flex items-center justify-end">
                With notification
              </p>
              <p className="text-sm font-semibold text-gray-500 text-right h-[56px] flex items-center justify-end">
                Icon + notification
              </p>
            </div>

            {/* Inactive Column */}
            <div className="flex flex-col space-y-6 border border-dashed border-[#d2b8ea] p-6 rounded-lg bg-white relative">
              <span className="absolute -top-[28px] text-sm text-gray-500 left-0">
                Inactive
              </span>

              <Tabs defaultValue="empty" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger value="1">Tab Name</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="empty" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger value="1" icon={<IconLayoutDashboard />}>
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="empty" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger value="1" badge="1">
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="empty" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger
                    value="1"
                    icon={<IconLayoutDashboard />}
                    badge="1"
                  >
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Active Column */}
            <div className="flex flex-col space-y-6 border border-dashed border-[#d2b8ea] p-6 rounded-lg bg-white relative">
              <span className="absolute -top-[28px] text-sm text-gray-500 left-0">
                Active
              </span>

              <Tabs defaultValue="1" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger value="1">Tab Name</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="1" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger value="1" icon={<IconLayoutDashboard />}>
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="1" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger value="1" badge="1">
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="1" variant="underline" intent="success">
                <TabsList>
                  <TabsTrigger
                    value="1"
                    icon={<IconLayoutDashboard />}
                    badge="1"
                  >
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Active Dark Intent Column */}
            <div className="flex flex-col space-y-6 border border-dashed border-[#14b375] p-6 rounded-lg bg-white relative">
              <span className="absolute -top-[28px] text-sm text-[#084C36] left-0">
                Active (Dark intent)
              </span>

              <Tabs defaultValue="1" variant="underline" intent="dark">
                <TabsList>
                  <TabsTrigger value="1">Tab Name</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="1" variant="underline" intent="dark">
                <TabsList>
                  <TabsTrigger value="1" icon={<IconLayoutDashboard />}>
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="1" variant="underline" intent="dark">
                <TabsList>
                  <TabsTrigger value="1" badge="1">
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="1" variant="underline" intent="dark">
                <TabsList>
                  <TabsTrigger
                    value="1"
                    icon={<IconLayoutDashboard />}
                    badge="1"
                  >
                    Tab Name
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* PILL TABS EXAMPLES */}
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-medium text-[#252e3b] mb-4">
              Examples
            </h2>
            <p className="text-sm font-semibold text-gray-500 mb-6">
              Tab list without icons
            </p>
          </div>

          <div className="space-y-10 border border-dashed border-[#d2b8ea] bg-white p-8 rounded-lg">
            {/* Underline Examples (Horizontal) */}
            <Tabs defaultValue="dashboard" variant="underline" intent="success">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
                <TabsTrigger value="payout">Payout</TabsTrigger>
                <TabsTrigger value="consumers">Consumers</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs defaultValue="dashboard" variant="underline" intent="success">
              <TabsList>
                <TabsTrigger value="dashboard" badge="1">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
                <TabsTrigger value="payout" badge="234">
                  Payout
                </TabsTrigger>
                <TabsTrigger value="consumers">Consumers</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500 mb-6">
              Tab list with icons
            </p>
          </div>

          <div className="space-y-10 border border-dashed border-[#d2b8ea] bg-white p-8 rounded-lg">
            {/* Underline Examples (With Icons) */}
            <Tabs defaultValue="dashboard" variant="underline" intent="success">
              <TabsList>
                <TabsTrigger value="dashboard" icon={<IconLayoutDashboard />}>
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="admin" icon={<IconUsers />}>
                  Admin
                </TabsTrigger>
                <TabsTrigger value="providers" icon={<IconBuildingStore />}>
                  Providers
                </TabsTrigger>
                <TabsTrigger value="payout" icon={<IconReceipt />}>
                  Payout
                </TabsTrigger>
                <TabsTrigger value="consumers" icon={<IconUser />}>
                  Consumers
                </TabsTrigger>
                <TabsTrigger value="settings" icon={<IconSettings />}>
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs defaultValue="dashboard" variant="underline" intent="success">
              <TabsList>
                <TabsTrigger value="dashboard" icon={<IconLayoutDashboard />}>
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="admin" icon={<IconUsers />}>
                  Admin
                </TabsTrigger>
                <TabsTrigger
                  value="providers"
                  badge="25"
                  icon={<IconBuildingStore />}
                >
                  Providers
                </TabsTrigger>
                <TabsTrigger value="payout" icon={<IconReceipt />} badge="12">
                  Payout
                </TabsTrigger>
                <TabsTrigger value="consumers" icon={<IconUser />}>
                  Consumers
                </TabsTrigger>
                <TabsTrigger value="settings" icon={<IconSettings />}>
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full mt-12">
            <div className="border border-dashed border-[#d2b8ea] p-8 rounded-lg space-y-8 bg-white overflow-x-auto min-w-0 flex items-center justify-center">
              <div className="w-full">
                <p className="text-sm text-gray-500 mb-4 whitespace-normal">
                  Pill Base
                </p>
                <Tabs defaultValue="1" variant="pill" sizing="sm">
                  <TabsList>
                    <TabsTrigger value="1" badge="10">
                      Tab
                    </TabsTrigger>
                    <TabsTrigger value="2" badge="10">
                      Tab
                    </TabsTrigger>
                    <TabsTrigger value="3" badge="10">
                      Tab
                    </TabsTrigger>
                    <TabsTrigger value="4" badge="10">
                      Tab
                    </TabsTrigger>
                    <TabsTrigger value="5" badge="10">
                      Tab
                    </TabsTrigger>
                    <TabsTrigger value="6" badge="10">
                      Tab
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="mt-8 flex gap-4 w-full">
                  <div className="w-[153px]">
                    <Tabs
                      defaultValue="account"
                      variant="pill"
                      sizing="default"
                      orientation="vertical"
                    >
                      <TabsList>
                        <TabsTrigger value="account" badge="10">
                          Account
                        </TabsTrigger>
                        <TabsTrigger value="password" badge="10">
                          Password
                        </TabsTrigger>
                        <TabsTrigger value="team" badge="10">
                          Team
                        </TabsTrigger>
                        <TabsTrigger value="plan" badge="10">
                          Plan
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-[#d2b8ea] p-8 flex items-center justify-center rounded-lg space-y-0 bg-[#eaecf0]">
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Pill Small Examples
                </p>
                <Tabs defaultValue="1" variant="pill" sizing="sm">
                  <TabsList className="bg-white">
                    <TabsTrigger value="1" badge="10">
                      Tab
                    </TabsTrigger>
                    <TabsTrigger value="2">Tab</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
