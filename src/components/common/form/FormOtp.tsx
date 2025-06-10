// UI
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from '@/components/ui/input-otp'

// Form
import { useFormContext } from 'react-hook-form'

// Types
import type { Path, FieldValues } from 'react-hook-form'
import * as React from 'react'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  label?: string
  maxLength: number
}

function OtpSlot({ index }: { index: number }) {
  return (
    <InputOTPSlot
      index={index}
      inputMode="numeric"
      className="relative [&:empty]:before:content-['0'] [&:empty]:before:absolute [&:empty]:before:left-1/2 [&:empty]:before:top-1/2 [&:empty]:before:-translate-x-1/2 [&:empty]:before:-translate-y-1/2 [&:empty]:before:opacity-50 [&:empty]:before:text-gray-300"
    />
  )
}

export function FormOtp<T extends FieldValues>({
  name,
  label,
  maxLength,
}: Props<T>) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <InputOTP maxLength={maxLength} {...field} autoFocus>
              <InputOTPGroup>
                {Array.from({ length: maxLength }).map((_, index) => (
                  <OtpSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
