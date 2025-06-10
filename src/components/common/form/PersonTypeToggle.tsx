'use client'

import React from 'react'
import type { PersonType } from '@/types/subscription'
import { IconBuildingCommunity, IconCheck, IconUser } from '@tabler/icons-react'

interface PersonTypeToggleProps {
  value: PersonType
  onChange: (type: PersonType) => void
  className?: string
}

export function PersonTypeToggle({
  value,
  onChange,
  className,
}: PersonTypeToggleProps) {
  const options = [
    {
      value: 'individual' as PersonType,
      label: 'Pessoa Física',
      icon: <IconUser />,
    },
    {
      value: 'company' as PersonType,
      label: 'Pessoa Jurídica',
      icon: <IconBuildingCommunity />,
    },
  ]

  return (
    <div
      className={`flex gap-2 ${className}`}
      role="radiogroup"
      aria-label="Tipo de pessoa"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={0}
          className={`flex-1 flex items-center justify-between px-4 py-2 rounded-lg border transition ${
            value === option.value
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
              : 'bg-white border-gray-200 text-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-emerald-400`}
          onClick={() => onChange(option.value)}
        >
          <span className="flex items-center gap-2">
            {option.icon}
            {option.label}
          </span>
          <span
            className={`ml-0 w-5 h-5 flex items-center justify-center rounded-full border-2 ${
              value === option.value
                ? 'border-emerald-600 bg-white'
                : 'border-gray-300 bg-white'
            }`}
            aria-hidden="true"
          >
            {value === option.value && <IconCheck />}
          </span>
        </button>
      ))}
    </div>
  )
}
