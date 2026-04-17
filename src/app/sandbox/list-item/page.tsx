import React from 'react'
import { ListItem } from '@/components/ui/list-item'

export default function ListItemSandboxPage() {
  const BrandIconLg = (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-grow-0 flex-shrink-0 w-12 h-12 relative"
      preserveAspectRatio="none"
    >
      <rect width={48} height={48} rx={24} fill="#A9F1CC" />
      <path
        d="M15.27 18.96L24 24.01L32.73 18.96M24 34.08V24M33 28V20C32.9996 19.6493 32.9071 19.3048 32.7315 19.0012C32.556 18.6975 32.3037 18.4454 32 18.27L25 14.27C24.696 14.0945 24.3511 14.0021 24 14.0021C23.6489 14.0021 23.304 14.0945 23 14.27L16 18.27C15.6963 18.4454 15.444 18.6975 15.2685 19.0012C15.0929 19.3048 15.0004 19.6493 15 20V28C15.0004 28.3508 15.0929 28.6952 15.2685 28.9989C15.444 29.3025 15.6963 29.5547 16 29.73L23 33.73C23.304 33.9056 23.6489 33.998 24 33.998C24.3511 33.998 24.696 33.9056 25 33.73L32 29.73C32.3037 29.5547 32.556 29.3025 32.7315 28.9989C32.9071 28.6952 32.9996 28.3508 33 28Z"
        stroke="#077550"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const BrandIconSm = (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
      preserveAspectRatio="none"
    >
      <path
        d="M3.27 6.96002L12 12.01L20.73 6.96002M12 22.08V12M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z"
        stroke="#077550"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const CheckIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.6666 5L7.49992 14.1667L3.33325 10"
        stroke="#077550"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8 lg:p-12">
      <div className="max-w-[1200px] mx-auto space-y-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-medium text-[#252e3b]">
            List / Feature Items
          </h2>
          <p className="text-sm border-l-4 border-indigo-500 pl-3 text-gray-600 max-w-3xl">
            A flexible generic primitive spanning dropdown items, feature
            blocks, layout lists. Includes strict mappings to brand tokens.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* SECTION 1: Standard w-80 Large Icons combinations */}
          <div className="flex flex-col gap-8">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-700">
              Size: w-80, Icon: Lg
            </h3>

            <div className="flex flex-col gap-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm w-[360px]">
              {/* Full Variant */}
              <ListItem
                title={<span className="flex-grow-0">Products</span>}
                subtitle="Find the best solution for you."
                badge="New"
                action="Learn more"
                icon={BrandIconLg}
                iconSize="md"
              />
              <hr className="my-2 border-gray-100" />
              {/* No Action */}
              <ListItem
                title={<span className="flex-grow-0">Products</span>}
                subtitle="Find the best solution for you."
                badge="New"
                icon={BrandIconLg}
              />
              <hr className="my-2 border-gray-100" />
              {/* No Badge */}
              <ListItem
                title={<span className="flex-grow-0">Products</span>}
                subtitle="Find the best solution for you."
                action="Learn more"
                icon={BrandIconLg}
              />
              <hr className="my-2 border-gray-100" />
              {/* Title Only + Icon */}
              <ListItem
                title={
                  <span className="flex-grow-0 text-gray-900">Products</span>
                }
                icon={BrandIconLg}
              />
              {/* Trailing Icon Test */}
              <ListItem
                title={
                  <span className="flex-grow-0 text-gray-900">Products</span>
                }
                icon={BrandIconLg}
                trailingIcon={CheckIcon}
              />
            </div>
          </div>

          {/* SECTION 2: Standard w-80 Small Icons combinations */}
          <div className="flex flex-col gap-8">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-700">
              Size: w-80, Icon: Sm
            </h3>

            <div className="flex flex-col gap-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm w-[360px]">
              {/* Full Variant */}
              <ListItem
                title={<span className="flex-grow-0">Products</span>}
                subtitle="Find the best solution for you."
                badge="New"
                action="Learn more"
                icon={BrandIconSm}
                iconSize="sm"
              />
              <hr className="my-2 border-gray-100" />
              {/* No Action */}
              <ListItem
                title={<span className="flex-grow-0">Products</span>}
                subtitle="Find the best solution for you."
                badge="New"
                icon={BrandIconSm}
                iconTheme="default"
              />
              <hr className="my-2 border-gray-100" />
              {/* No Badge */}
              <ListItem
                title={<span className="flex-grow-0">Products</span>}
                subtitle="Find the best solution for you."
                action="Learn more"
                icon={BrandIconSm}
                iconTheme="default"
              />
              <hr className="my-2 border-gray-100" />
              {/* Title Only + Icon */}
              <ListItem
                title={
                  <span className="flex-grow-0 text-gray-900">Products</span>
                }
                icon={BrandIconSm}
                iconTheme="default"
              />
            </div>
          </div>

          {/* SECTION 3: Without Icons (Fluid width w-[375px] styled) */}
          <div className="flex flex-col gap-8 col-span-1 lg:col-span-2">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-700">
              Width: ~375px No Leading Icon
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm w-full md:w-[375px]">
                {/* Full Text Only Variant */}
                <ListItem
                  title={<span className="flex-grow-0">Products</span>}
                  subtitle="Find the best solution for you."
                  badge="New"
                  action="Learn more"
                />
                <hr className="my-2 border-gray-100" />
                <ListItem
                  title={<span className="flex-grow-0">Products</span>}
                  subtitle="Find the best solution for you."
                  badge="New"
                />
                <hr className="my-2 border-gray-100" />
                <ListItem
                  title={<span className="flex-grow-0">Products</span>}
                  subtitle="Find the best solution for you."
                />
              </div>

              <div className="flex flex-col gap-2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm w-full md:w-[375px]">
                {/* Minimal List Variants */}
                <ListItem
                  title={<span className="flex-grow-0">Products</span>}
                  badge="New"
                />
                <ListItem
                  title={
                    <span className="flex-grow-0 text-gray-900 font-medium">
                      Pricing
                    </span>
                  }
                />
                <ListItem
                  title={
                    <span className="flex-grow-0 text-gray-900 font-medium">
                      Integrations
                    </span>
                  }
                  trailingIcon={
                    <span className="text-gray-400 text-xs">⌘I</span>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
