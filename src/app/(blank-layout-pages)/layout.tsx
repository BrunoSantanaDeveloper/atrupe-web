// Type Imports
import type { PropsWithChildren } from 'react'

export default function BlankLayout({ children }: PropsWithChildren) {
  return <div className="flex flex-col h-screen">{children}</div>
}
