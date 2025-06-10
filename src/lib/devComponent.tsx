/**
 * @description Display a child component only in development environment
 * @param {React.ReactNode} children - Child component to be displayed
 * @returns {React.ReactNode} Child component or null
 */
export function DevComponent({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'development') {
    return children
  }
  return null
}
