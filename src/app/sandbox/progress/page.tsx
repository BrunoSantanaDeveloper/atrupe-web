import React from 'react'
import { Progress, ProgressBar } from '@/components/ui/progress'
import { ProgressCircle } from '@/components/ui/progress-circle'

export const dynamic = 'force-dynamic'

export default function ProgressSandbox() {
  return (
    <div className="p-8 flex flex-col items-center justify-center bg-gray-50 min-h-screen gap-12">
      <div className="w-full max-w-4xl space-y-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          1. Progress Bars (Linear)
        </h2>

        <div className="space-y-12 max-w-lg">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-6">
              With Floating Tooltip
            </h3>
            <ProgressBar value={20} showTooltip label="20%" />
            <br />
            <ProgressBar value={50} showTooltip label="50%" />
            <br />
            <ProgressBar value={80} showTooltip label="80%" />
          </div>

          <div className="space-y-4 pt-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-6">
              With Side Label
            </h3>
            <ProgressBar value={10} labelRight label="10%" />
            <ProgressBar value={30} labelRight label="30%" />
            <ProgressBar value={100} labelRight label="100%" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          2. Progress Circles & Semicircles (Gauges)
        </h2>

        <div className="flex flex-wrap gap-12 items-end justify-start p-8">
          {/* Full Circles */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              Circular Rings
            </h3>

            <div className="flex gap-8 items-center">
              <ProgressCircle value={40} size={84} strokeWidth={8}>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg font-medium text-gray-900">40%</span>
                  <span className="text-[10px] text-gray-500">Usuários</span>
                </div>
              </ProgressCircle>

              <ProgressCircle value={40} size={160} strokeWidth={16}>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium mb-1">
                    Usuários ativos
                  </span>
                  <span className="text-2xl font-medium text-gray-900">
                    40%
                  </span>
                </div>
              </ProgressCircle>

              <ProgressCircle value={40} size={240} strokeWidth={24}>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium mb-1">
                    Usuários ativos
                  </span>
                  <span className="text-4xl font-medium text-gray-900">
                    40%
                  </span>
                </div>
              </ProgressCircle>
            </div>
          </div>

          {/* Semicircles */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              Semi-circular Gauges
            </h3>

            <div className="flex gap-8 items-end">
              <ProgressCircle
                variant="semi"
                value={40}
                size={160}
                strokeWidth={16}
              >
                <div className="flex flex-col items-center justify-center translate-y-3">
                  <span className="text-xs text-gray-500 font-medium">
                    Usuários ativos
                  </span>
                  <span className="text-2xl font-medium text-gray-900">
                    40%
                  </span>
                </div>
              </ProgressCircle>

              <ProgressCircle
                variant="semi"
                value={40}
                size={240}
                strokeWidth={24}
              >
                <div className="flex flex-col items-center justify-center translate-y-4">
                  <span className="text-sm text-gray-500 font-medium mb-1">
                    Usuários ativos
                  </span>
                  <span className="text-4xl font-medium text-gray-900">
                    40%
                  </span>
                </div>
              </ProgressCircle>

              <ProgressCircle
                variant="semi"
                value={40}
                size={280}
                strokeWidth={28}
              >
                <div className="flex flex-col items-center justify-center translate-y-5">
                  <span className="text-5xl font-medium text-gray-900">
                    40%
                  </span>
                </div>
              </ProgressCircle>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
