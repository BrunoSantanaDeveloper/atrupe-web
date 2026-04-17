import React from 'react'
import { CheckboxField } from '@/components/common/checkbox-field'
import { RadioField } from '@/components/common/radio-field'
import { CheckboxCard } from '@/components/common/checkbox-card'
import { RadioCard } from '@/components/common/radio-card'
import { DatePicker } from '@/components/common/date-picker'
import { DateRangePicker } from '@/components/common/date-range-picker'
import { RadioGroup } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'

export default function FormsSandboxPage() {
  return (
    <div className="flex flex-col flex-wrap justify-start items-start relative gap-16 p-12 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-6">
        <h1 className="text-display-sm-semibold text-gray-900">
          Checkbox Matrix
        </h1>
        <div className="flex gap-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {/* SM Size */}
          <div className="flex flex-col gap-6 min-w-[280px]">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Small (sm)
            </h2>
            <CheckboxField id="cbx-sm-1" size="sm" label="Lembrar de mim" />
            <CheckboxField
              id="cbx-sm-2"
              size="sm"
              defaultChecked
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-sm-3"
              size="sm"
              checked="indeterminate"
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-sm-4"
              size="sm"
              disabled
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-sm-5"
              size="sm"
              defaultChecked
              disabled
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-sm-6"
              size="sm"
              label="Lembrar de mim"
              hint="Salvar meu login para as próximas sessões"
            />
            <div className="mt-4 p-4 rounded bg-gray-50 border flex gap-4">
              <Checkbox size="sm" />
              <span className="text-sm">Raw Checkbox</span>
            </div>
          </div>

          {/* MD Size */}
          <div className="flex flex-col gap-6 min-w-[280px]">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Medium (md)
            </h2>
            <CheckboxField id="cbx-md-1" size="md" label="Lembrar de mim" />
            <CheckboxField
              id="cbx-md-2"
              size="md"
              defaultChecked
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-md-3"
              size="md"
              checked="indeterminate"
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-md-4"
              size="md"
              disabled
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-md-5"
              size="md"
              defaultChecked
              disabled
              label="Lembrar de mim"
            />
            <CheckboxField
              id="cbx-md-6"
              size="md"
              label="Lembrar de mim"
              hint="Salvar meu login para as próximas sessões"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h1 className="text-display-sm-semibold text-gray-900">Radio matrix</h1>
        <div className="flex gap-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {/* SM Size */}
          <div className="flex flex-col gap-6 min-w-[280px]">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Small (sm)
            </h2>
            <RadioGroup defaultValue="r-sm-2" className="flex flex-col gap-6">
              <RadioField value="r-sm-1" size="sm" label="Lembrar de mim" />
              <RadioField value="r-sm-2" size="sm" label="Lembrar de mim" />
              <RadioField
                value="r-sm-3"
                size="sm"
                disabled
                label="Lembrar de mim"
              />
            </RadioGroup>
            <RadioGroup value="r-sm-4" className="flex flex-col gap-6 mt-6">
              <RadioField
                value="r-sm-4"
                size="sm"
                defaultChecked
                disabled
                label="Lembrar de mim disabled checked"
              />
              <RadioField
                value="r-sm-5"
                size="sm"
                label="Lembrar de mim"
                hint="Salvar meu login para as próximas sessões"
              />
            </RadioGroup>
          </div>

          {/* MD Size */}
          <div className="flex flex-col gap-6 min-w-[280px]">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Medium (md)
            </h2>
            <RadioGroup defaultValue="r-md-2" className="flex flex-col gap-6">
              <RadioField value="r-md-1" size="md" label="Lembrar de mim" />
              <RadioField value="r-md-2" size="md" label="Lembrar de mim" />
              <RadioField
                value="r-md-3"
                size="md"
                disabled
                label="Lembrar de mim"
              />
            </RadioGroup>
            <RadioGroup value="r-md-4" className="flex flex-col gap-6 mt-6">
              <RadioField
                value="r-md-4"
                size="md"
                defaultChecked
                disabled
                label="Lembrar de mim disabled checked"
              />
              <RadioField
                value="r-md-5"
                size="md"
                label="Lembrar de mim"
                hint="Salvar meu login para as próximas sessões"
              />
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-display-sm-semibold text-gray-900">
          Complex Card layouts (RadioCard & CheckboxCard)
        </h1>
        <div className="grid grid-cols-2 gap-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full">
          {/* Pricing Card Examples */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Pricing Plans (Left Align vs Right Align)
            </h2>

            <RadioGroup defaultValue="plan-1" className="flex flex-col gap-4">
              <RadioCard value="plan-1" size="md" alignControl="top-left">
                <p className="text-base text-left">
                  <span className="font-medium text-[#084C36]">Basic plan</span>
                  <span className="text-brand-600"> $10/month</span>
                </p>
                <p className="text-base text-brand-600 mt-0.5">
                  Includes up to 10 users, 20GB individual data and access to
                  all features.
                </p>
              </RadioCard>

              <RadioCard value="plan-2" size="md" alignControl="top-right">
                <p className="text-base text-left">
                  <span className="font-medium text-[#084C36]">Pro plan</span>
                  <span className="text-brand-600"> $20/month</span>
                </p>
                <p className="text-base text-brand-600 mt-0.5">
                  Includes up to 20 users, 40GB individual data and access to
                  all features.
                </p>
              </RadioCard>
            </RadioGroup>
          </div>

          {/* Avatar Selection Card Examples */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Avatar Selection (Checkbox)
            </h2>

            <div className="flex flex-col gap-4">
              <CheckboxCard
                id="user-1"
                size="sm"
                alignControl="left"
                defaultChecked
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col justify-center items-center w-8 h-8 rounded-[200px] bg-indigo-500 text-white font-medium text-xs">
                    OR
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-left">
                      <span className="font-medium text-[#344054]">
                        Olivia Rhye
                      </span>
                      <span className="text-[#667085]"> @olivia</span>
                    </p>
                    <p className="text-sm text-[#667085]">
                      Product Manager, Integrations
                    </p>
                  </div>
                </div>
              </CheckboxCard>

              <CheckboxCard id="user-2" size="sm" alignControl="right">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col justify-center items-center w-8 h-8 rounded-[200px] bg-rose-500 text-white font-medium text-xs">
                    PM
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-left">
                      <span className="font-medium text-[#344054]">
                        Phoenix Baker
                      </span>
                      <span className="text-[#667085]"> @phoenix</span>
                    </p>
                    <p className="text-sm text-[#667085]">
                      Engineering Manager
                    </p>
                  </div>
                </div>
              </CheckboxCard>
            </div>
          </div>

          {/* Payment Selection Card Examples */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl-semibold text-gray-700 pb-2 border-b">
              Payment Method (Radio Right-Aligned)
            </h2>

            <RadioGroup defaultValue="pm-1" className="flex flex-col gap-4">
              <RadioCard value="pm-1" size="sm" alignControl="top-right">
                <div className="flex items-start gap-3">
                  <div className="w-[46px] h-8 bg-[#172B85] rounded-md flex items-center justify-center text-white text-[10px] font-bold italic">
                    VISA
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm font-medium text-[#344054]">
                        Visa ending in 1234
                      </p>
                      <p className="text-sm text-[#667085]">Expiry 06/2024</p>
                    </div>
                    <div className="flex gap-3 text-sm font-semibold">
                      <span className="text-[#667085]">Set as default</span>
                      <span className="text-[#085D40]">Edit</span>
                    </div>
                  </div>
                </div>
              </RadioCard>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-display-sm-semibold text-gray-900">
          Date Pickers Configuration Matrix
        </h1>
        <div className="grid grid-cols-2 gap-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Single Date
            </h2>
            <div className="flex flex-col gap-3">
              <DatePicker />
              <DatePicker value={new Date(2026, 3, 14)} />
              <DatePicker disabled />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <DatePicker label="Data" />
              <DatePicker label="Data" value={new Date()} />
              <DatePicker label="Data" disabled />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Date Range
            </h2>
            <div className="flex flex-col gap-3">
              <DateRangePicker />
              <DateRangePicker
                value={{
                  from: new Date(2026, 3, 14),
                  to: new Date(2026, 3, 20),
                }}
              />
              <DateRangePicker disabled />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <DateRangePicker label="Período" />
              <DateRangePicker
                label="Período"
                value={{
                  from: new Date(),
                  to: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                }}
              />
              <DateRangePicker label="Período" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
