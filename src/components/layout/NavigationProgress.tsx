'use client'

// React
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

// Next
import { usePathname, useSearchParams } from 'next/navigation'

// Lib
import { cn } from '@/lib/utils'

// Barra de progresso no topo durante a troca de página
// (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 5).
//
// O App Router não avisa quando uma navegação começa: o início vem do clique
// num link interno (ou de `startNavigationProgress()`, para `router.push` em
// código) e o fim, da mudança de `pathname`/`searchParams`.

const SHOW_DELAY = 150 // troca rápida não mostra a barra
const SAFETY_TIMEOUT = 10000 // navegação cancelada não deixa a barra presa

const startListeners = new Set<() => void>()

export function startNavigationProgress() {
  startListeners.forEach((listener) => listener())
}

function isSameUrl(url: URL) {
  return (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  )
}

function getNavigationTarget(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null
  }

  const target = event.target as Element | null
  const anchor = target?.closest('a')
  // <a> de SVG tem `href` de outro tipo e não é navegação do Next
  if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) return null
  if (anchor.target && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null

  // Botão dentro de um link costuma cancelar a navegação (ação da linha)
  const interactive = target?.closest(
    'button, [role="button"], input, select, textarea, label',
  )
  if (interactive && anchor.contains(interactive)) return null

  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  if (isSameUrl(url)) return null

  return url
}

function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const active = useRef(false)
  const shown = useRef(false)
  const timers = useRef<{
    show?: number
    trickle?: number
    safety?: number
    hide?: number
  }>({})

  const clearTimers = useCallback(() => {
    const { show, trickle, safety, hide } = timers.current
    window.clearTimeout(show)
    window.clearInterval(trickle)
    window.clearTimeout(safety)
    window.clearTimeout(hide)
    timers.current = {}
  }, [])

  const finish = useCallback(() => {
    if (!active.current) return
    active.current = false
    clearTimers()
    // Se nem chegou a aparecer, nada muda na tela
    if (!shown.current) return
    shown.current = false
    // Completa e some
    setProgress(1)
    timers.current.hide = window.setTimeout(() => setVisible(false), 200)
  }, [clearTimers])

  const start = useCallback(() => {
    if (active.current) return
    active.current = true
    clearTimers()
    // Barra ainda sumindo da navegação anterior: volta ao zero sem animar
    setVisible(false)
    setProgress(0)

    timers.current.show = window.setTimeout(() => {
      shown.current = true
      setProgress(0.1)
      setVisible(true)
      // Avança cada vez mais devagar, sem chegar ao fim antes da página
      timers.current.trickle = window.setInterval(() => {
        setProgress((current) => current + (0.9 - current) * 0.1)
      }, 200)
    }, SHOW_DELAY)

    timers.current.safety = window.setTimeout(finish, SAFETY_TIMEOUT)
  }, [clearTimers, finish])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (getNavigationTarget(event)) start()
    }

    // Captura: o Link do Next cancela o evento na fase de bolha
    document.addEventListener('click', handleClick, true)
    startListeners.add(start)

    return () => {
      document.removeEventListener('click', handleClick, true)
      startListeners.delete(start)
    }
  }, [start])

  useEffect(() => {
    finish()
  }, [pathname, searchParams, finish])

  useEffect(() => clearTimers, [clearTimers])

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 transition-opacity duration-base',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      // Escondida, volta ao zero sem animar
      onTransitionEnd={() => !visible && setProgress(0)}
    >
      <div
        className={cn(
          'h-full origin-left bg-brand-600 ease-out',
          visible && 'transition-transform duration-base',
        )}
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}

export function NavigationProgress() {
  // useSearchParams exige um limite de Suspense
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  )
}
