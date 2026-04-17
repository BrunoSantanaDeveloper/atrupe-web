import React from 'react'
import { Slider } from '@/components/ui/slider'

export const dynamic = 'force-dynamic'

export default function SliderSandbox() {
  return (
    <div className="p-16 flex flex-col items-center bg-gray-50 min-h-screen gap-12 pt-32">
      <div className="w-full max-w-4xl space-y-16 bg-white p-12 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-12">
          Range Sliders
        </h2>

        <div className="grid grid-cols-2 gap-x-20 gap-y-24">
          {/* Simple Labels Alternate */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-8 absolute -translate-y-8">
              Simple Labels (Alternate)
            </h3>
            <Slider
              defaultValue={[0, 25]}
              showLabels="alternate-reverse"
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-4 pt-12">
            <Slider
              defaultValue={[25, 75]}
              showLabels="alternate-reverse"
              max={100}
              step={1}
            />
          </div>

          {/* Tooltips Alternate */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-8 absolute -translate-y-16">
              Floating Tooltips (Alternate)
            </h3>
            <Slider
              defaultValue={[25, 50]}
              showTooltips="alternate"
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-4">
            <Slider
              defaultValue={[50, 75]}
              showTooltips="alternate-reverse"
              max={100}
              step={1}
            />
          </div>

          {/* Both Tooltips Top */}
          <div className="space-y-4 pt-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-8 absolute -translate-y-16">
              Both Tooltips Top
            </h3>
            <Slider
              defaultValue={[0, 75]}
              showTooltips="top"
              max={100}
              step={1}
            />
          </div>

          {/* Simple Track Single Value */}
          <div className="space-y-4 pt-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-8 absolute -translate-y-16">
              Single Value with Label Bottom
            </h3>
            <Slider
              defaultValue={[100]}
              showLabels="bottom"
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-4 pt-12">
            <h3 className="text-sm font-semibold text-gray-500 mb-8 absolute -translate-y-8">
              Labels Bottom
            </h3>
            <Slider
              defaultValue={[25, 75]}
              showLabels="bottom"
              max={100}
              step={1}
            />
          </div>

          {/* Three values */}
          <div className="space-y-4 pt-12">
            <h3 className="text-sm font-semibold text-gray-500 mb-8 absolute -translate-y-20">
              Multiple tooltips
            </h3>
            <Slider
              defaultValue={[25, 50, 75]}
              showTooltips="alternate"
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
