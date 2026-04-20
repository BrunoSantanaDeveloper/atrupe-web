'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ModalVariant = 'success' | 'warning' | 'danger'
export type ModalLayout = 'vertical' | 'horizontal'
export type ModalIntent = 'success' | 'danger'

export interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: ModalVariant // defaults to 'success'
  layout?: ModalLayout // defaults to 'vertical'
  title: string
  description?: React.ReactNode
  primaryAction: {
    label: string
    onClick: () => void
    intent?: ModalIntent // overrides derived color (default: danger uses red, else green)
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  checkbox?: {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
  }
  customIcon?: React.ReactNode // Overrides the default variant icon
  children?: React.ReactNode // Custom content injected between header and footer
  footerLeftContent?: React.ReactNode // Content on the far left of the footer (e.g. link/icon)
  tertiaryAction?: {
    label: string
    onClick: () => void
    intent?: 'neutral' | 'danger' | 'success' // Neutral: white/gray, Danger: light red, Success: light green
  }
  footerLayout?: 'right' | 'fill' | 'left' | 'space-between' // How the buttons distribute
  reverseActions?: boolean // If true, Primary is on the left of Secondary
}

/* ─────────────────────────────────────────────────────────────
   Modal Icons
───────────────────────────────────────────────────────────── */

const IconSuccess = () => (
  <svg
    width={56}
    height={56}
    viewBox="0 0 56 56"
    fill="none"
    className="flex-grow-0 flex-shrink-0 w-12 h-12 relative"
  >
    <rect x={4} y={4} width={48} height={48} rx={24} fill="#D1FADF" />
    <rect
      x={4}
      y={4}
      width={48}
      height={48}
      rx={24}
      stroke="#ECFDF3"
      strokeWidth={8}
    />
    <path
      d="M38 27.08V28C37.9988 30.1564 37.3005 32.2547 36.0093 33.9818C34.7182 35.709 32.9033 36.9725 30.8354 37.5839C28.7674 38.1953 26.5573 38.1219 24.5345 37.3746C22.5117 36.6273 20.7847 35.2461 19.611 33.4371C18.4373 31.628 17.8798 29.4881 18.0217 27.3363C18.1636 25.1846 18.9972 23.1363 20.3983 21.4971C21.7994 19.8578 23.6928 18.7154 25.7962 18.2401C27.8996 17.7649 30.1003 17.9823 32.07 18.86M38 20L28 30.01L25 27.01"
      stroke="#039855"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconWarning = () => (
  <svg
    width={56}
    height={56}
    viewBox="0 0 56 56"
    fill="none"
    className="flex-grow-0 flex-shrink-0 w-12 h-12 relative"
  >
    <rect x={4} y={4} width={48} height={48} rx={24} fill="#FEF0C7" />
    <rect
      x={4}
      y={4}
      width={48}
      height={48}
      rx={24}
      stroke="#FFFAEB"
      strokeWidth={8}
    />
    <path
      d="M27.9998 24V28M27.9998 32H28.0098M26.2898 18.86L17.8198 33C17.6451 33.3024 17.5527 33.6453 17.5518 33.9945C17.5508 34.3437 17.6413 34.6871 17.8142 34.9905C17.9871 35.2939 18.2365 35.5467 18.5375 35.7238C18.8385 35.9009 19.1806 35.9961 19.5298 36H36.4698C36.819 35.9961 37.1611 35.9009 37.4621 35.7238C37.7631 35.5467 38.0124 35.2939 38.1854 34.9905C38.3583 34.6871 38.4488 34.3437 38.4478 33.9945C38.4468 33.6453 38.3544 33.3024 38.1798 33L29.7098 18.86C29.5315 18.5661 29.2805 18.3231 28.981 18.1544C28.6814 17.9858 28.3435 17.8972 27.9998 17.8972C27.656 17.8972 27.3181 17.9858 27.0186 18.1544C26.7191 18.3231 26.468 18.5661 26.2898 18.86Z"
      stroke="#DC6803"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconDanger = () => (
  <svg
    width={56}
    height={56}
    viewBox="0 0 56 56"
    fill="none"
    className="flex-grow-0 flex-shrink-0 w-12 h-12 relative"
  >
    <rect x={4} y={4} width={48} height={48} rx={24} fill="#FEE4E2" />
    <rect
      x={4}
      y={4}
      width={48}
      height={48}
      rx={24}
      stroke="#FEF3F2"
      strokeWidth={8}
    />
    <path
      d="M28 24V28M28 32H28.01M38 28C38 33.5228 33.5228 38 28 38C22.4772 38 18 33.5228 18 28C18 22.4772 22.4772 18 28 18C33.5228 18 38 22.4772 38 28Z"
      stroke="#D92D20"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ─────────────────────────────────────────────────────────────
   Modal Component
───────────────────────────────────────────────────────────── */

export function FeedbackModal({
  isOpen,
  onClose,
  variant = 'success',
  layout = 'vertical',
  title,
  description,
  customIcon,
  primaryAction,
  secondaryAction,
  checkbox,
  children,
  footerLeftContent,
  footerLayout = 'right',
  reverseActions = false,
  tertiaryAction,
}: FeedbackModalProps) {
  const [mounted, setMounted] = useState(false)

  // Hydration safety for React Portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  // Resolve Primary Intent
  // Warnings default to Success (green) button unless overriden. Danger defaults to Danger (red).
  const derivedIntent =
    primaryAction.intent || (variant === 'danger' ? 'danger' : 'success')
  const primaryColors =
    derivedIntent === 'danger'
      ? 'bg-[#d92d20] border-[#d92d20] hover:bg-[#b42318] focus:ring-[#FEE4E2]'
      : 'bg-[#12b76a] border-[#12b76a] hover:bg-[#039855] focus:ring-[#D1FADF]'

  const tertiaryColors =
    tertiaryAction?.intent === 'danger'
      ? 'bg-[#fef3f2] border-[#fef3f2] text-[#b42318] hover:bg-[#fee4e2]'
      : tertiaryAction?.intent === 'success'
        ? 'bg-[#ecfdf3] border-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]'
        : 'bg-white border-[#d0d5dd] text-[#344054] hover:bg-gray-50'

  const IconComponent =
    variant === 'success'
      ? IconSuccess
      : variant === 'warning'
        ? IconWarning
        : IconDanger

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#344054]/70 backdrop-blur-md transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-xl shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),_0px_8px_8px_-4px_rgba(16,24,40,0.03)] overflow-hidden relative flex animate-in fade-in zoom-in-95 duration-200 ${
          layout === 'vertical'
            ? 'w-full max-w-[400px] flex-col items-center p-4 pt-5 sm:p-6 gap-6 sm:gap-8'
            : 'w-full max-w-[544px] flex-col sm:flex-row items-start p-4 pt-5 sm:p-6 gap-6'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* For Horizontal Layout: Icon is on the left */}
        {layout === 'horizontal' && (
          <div className="flex-shrink-0 hidden sm:block">
            {customIcon || <IconComponent />}
          </div>
        )}

        <div
          className={`flex flex-col w-full ${layout === 'horizontal' ? 'gap-8' : 'gap-5 sm:gap-8'}`}
        >
          {/* Main Content Area */}
          <div
            className={`flex flex-col w-full relative ${
              layout === 'vertical'
                ? 'items-center gap-4 sm:gap-5'
                : 'items-start gap-4 sm:gap-2'
            }`}
          >
            {/* For Vertical Layout: Icon is centered top / For Horizontal on Mobile: Icon shows up top */}
            {(layout === 'vertical' || (layout === 'horizontal' && true)) && (
              <div className={layout === 'horizontal' ? 'sm:hidden' : ''}>
                {customIcon || <IconComponent />}
              </div>
            )}

            <div
              className={`flex flex-col w-full ${
                layout === 'vertical'
                  ? 'items-center text-center gap-2'
                  : 'items-start text-left gap-2'
              }`}
            >
              <h2
                className={`text-lg font-semibold text-[#101828] leading-tight ${layout === 'vertical' ? 'text-center' : 'text-left'}`}
              >
                {title}
              </h2>
              {description && (
                <div
                  className={`text-sm text-[#667085] leading-normal ${layout === 'vertical' ? 'text-center' : 'text-left'}`}
                >
                  {description}
                </div>
              )}
            </div>

            {/* Custom Content Slot */}
            {children && <div className="w-full mt-1">{children}</div>}
          </div>

          {/* Footer Area */}
          <div
            className={`flex flex-col sm:flex-row gap-6 w-full ${footerLeftContent || checkbox ? 'sm:items-center justify-between' : footerLayout === 'left' ? 'justify-start' : footerLayout === 'space-between' ? 'justify-between' : 'justify-end'}`}
          >
            {/* Optional Checkbox or Left Content */}
            <div className="flex items-center">
              {checkbox && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={`relative flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                      checkbox.checked
                        ? 'bg-[#12b76a] border-[#12b76a]'
                        : 'bg-white border-[#d0d5dd] group-hover:border-[#12b76a]'
                    }`}
                  >
                    {checkbox.checked && (
                      <>
                        <div className="absolute inset-0 bg-[#12b76a] rounded border border-[#12b76a]"></div>
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          className="relative z-10"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checkbox.checked}
                      onChange={(e) => checkbox.onChange(e.target.checked)}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#344054] select-none">
                    {checkbox.label}
                  </span>
                </label>
              )}
              {!checkbox && footerLeftContent && (
                <div className="flex items-center">{footerLeftContent}</div>
              )}
            </div>

            {/* Actions Buttons Container */}
            <div
              className={`flex gap-3 ${footerLayout === 'fill' ? 'flex-col sm:flex-row w-full' : 'flex-col sm:flex-row'}`}
            >
              {/* Secondary (if not reversed, order 2 on mobile, 1 on desktop. If reversed, changes order) */}
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className={`flex justify-center items-center gap-2 px-[18px] py-2.5 rounded-lg bg-white border border-[#d0d5dd] shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 ${
                    footerLayout === 'fill' ? 'flex-1' : 'w-full sm:w-auto'
                  } ${reverseActions ? 'order-2' : 'order-3 sm:order-1'}`}
                >
                  <span className="text-base font-semibold text-[#344054]">
                    {secondaryAction.label}
                  </span>
                </button>
              )}

              {/* Tertiary */}
              {tertiaryAction && (
                <button
                  type="button"
                  onClick={tertiaryAction.onClick}
                  className={`flex justify-center items-center gap-2 px-[18px] py-2.5 rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-4 ${tertiaryColors} ${
                    footerLayout === 'fill' ? 'flex-1' : 'w-full sm:w-auto'
                  } order-2`}
                >
                  <span className="text-base font-semibold">
                    {tertiaryAction.label}
                  </span>
                </button>
              )}

              {/* Primary */}
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={`flex justify-center items-center gap-2 px-[18px] py-2.5 rounded-lg border shadow-sm transition-all focus:outline-none focus:ring-4 ${primaryColors} ${
                  footerLayout === 'fill' ? 'flex-1' : 'w-full sm:w-auto'
                } ${reverseActions ? 'order-1' : 'order-1 sm:order-3'}`}
              >
                <span className="text-base font-semibold text-white">
                  {primaryAction.label}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
