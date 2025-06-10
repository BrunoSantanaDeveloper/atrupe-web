'use client'

export function TailwindIndicator() {
  if (process.env.NODE_ENV === 'production') return null

  const handleDoubleClick = () => {
    window.open(window.location.pathname === '/ui' ? '/' : '/ui', '_blank')
  }

  return (
    <button
      onDoubleClick={handleDoubleClick}
      className="fixed bottom-1 left-1 z-50 flex size-6 items-center justify-center rounded-full bg-gray-800 opacity-60 p-4 font-mono text-xs text-white cursor-default"
    >
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">
        sm
      </div>
      <div className="hidden md:block lg:hidden xl:hidden 2xl:hidden">md</div>
      <div className="hidden lg:block xl:hidden 2xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </button>
  )
}
