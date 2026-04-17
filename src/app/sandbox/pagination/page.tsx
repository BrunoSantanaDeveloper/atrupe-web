import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { PaginationDots } from '@/components/ui/pagination-dots'

export default function PaginationSandbox() {
  return (
    <div className="p-8 flex flex-col items-center justify-center bg-gray-100 min-h-screen gap-12">
      <div className="w-full max-w-4xl space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          1. Pagination Dots (Carousel/Slider)
        </h2>
        <div className="grid grid-cols-2 gap-8 gap-y-12">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500">
              Brand Success (Pill Active)
            </h3>
            <PaginationDots count={5} activeIndex={1} variant="success" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500">
              Brand Success (Circle Active)
            </h3>
            <PaginationDots
              count={5}
              activeIndex={0}
              variant="success"
              pillOnActive={false}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500">
              Neutral Gray
            </h3>
            <PaginationDots count={5} activeIndex={2} variant="gray" />
          </div>

          <div className="space-y-4 bg-gray-900 p-4 rounded-md">
            <h3 className="text-sm font-semibold text-gray-400">
              White (Dark Mode context)
            </h3>
            <PaginationDots count={5} activeIndex={3} variant="white" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          2. Standard List Pagination
        </h2>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500">
            Default (Square/Light)
          </h3>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">10</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500">
            Success Active Variant
          </h3>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive activeVariant="success">
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">10</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500">
            Rounded Full (Circles)
          </h3>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" rounded="full" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" rounded="full">
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  rounded="full"
                  isActive
                  activeVariant="success"
                >
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" rounded="full">
                  3
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" rounded="full">
                  10
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" rounded="full" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          3. Joined Pagination (Border overlap)
        </h2>

        <p className="text-sm text-gray-600">
          Using `-space-x-px gap-0` on `PaginationContent` and specific corner
          rounding overrides.
        </p>

        <div className="space-y-4">
          <Pagination>
            {/* The gap-0 and -space-x-px create the joined border effect */}
            <PaginationContent className="gap-0 -space-x-px">
              <PaginationItem>
                <PaginationPrevious href="#" className="rounded-r-none h-11" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="rounded-none h-11">
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive
                  activeVariant="dark"
                  className="rounded-none h-11"
                >
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="rounded-none h-11">
                  3
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                {/* Ellipsis might need custom border if joined */}
                <span className="flex h-11 w-11 items-center justify-center border border-gray-300 bg-white">
                  ...
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="rounded-none h-11">
                  10
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" className="rounded-l-none h-11" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          4. Simple Text Pagination
        </h2>

        <div className="flex items-center justify-between border-t py-4">
          <PaginationPrevious href="#" />
          <span className="text-sm font-medium text-gray-700">
            Página 1 de 10
          </span>
          <PaginationNext href="#" />
        </div>

        <div className="flex items-center justify-center gap-6 border-t py-4">
          <PaginationPrevious href="#" rounded="full" className="px-3" />
          <span className="text-sm font-medium text-gray-700">
            Página 1 de 10
          </span>
          <PaginationNext href="#" rounded="full" className="px-3" />
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
          5. Carousel Components (Images Overlay)
        </h2>

        <div className="grid grid-cols-2 gap-8">
          <div className="relative w-full h-[300px] bg-gray-200 rounded-lg overflow-hidden flex flex-col justify-between p-4">
            <span className="text-gray-400 font-medium">Image Placeholder</span>

            {/* Center arrows, bottom dots */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <PaginationPrevious
                href="#"
                size="icon"
                rounded="full"
                variant="glassDark"
                className="pointer-events-auto"
              />
              <PaginationNext
                href="#"
                size="icon"
                rounded="full"
                variant="glassDark"
                className="pointer-events-auto"
              />
            </div>

            <div className="flex justify-center mt-auto pb-2 relative z-10">
              <PaginationDots
                count={5}
                activeIndex={1}
                variant="white"
                wrapper="glassDark"
              />
            </div>
          </div>

          <div className="relative w-full h-[300px] bg-gray-300 rounded-lg overflow-hidden flex flex-col justify-between p-4">
            <span className="text-gray-500 font-medium">
              Image Placeholder 2
            </span>

            {/* Center arrows, bottom dots (light variant) */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <PaginationPrevious
                href="#"
                size="icon"
                rounded="full"
                variant="glassLight"
                className="pointer-events-auto"
              />
              <PaginationNext
                href="#"
                size="icon"
                rounded="full"
                variant="glassLight"
                className="pointer-events-auto"
              />
            </div>

            <div className="flex justify-center mt-auto pb-2 relative z-10">
              <PaginationDots
                count={5}
                activeIndex={2}
                variant="dark"
                wrapper="glassLight"
                size="md"
                pillOnActive
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
