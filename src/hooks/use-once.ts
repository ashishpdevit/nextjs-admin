import { useEffect, useRef } from 'react'

/**
 * Hook that ensures an effect runs only once, even in React Strict Mode
 * This prevents double API calls in development
 */
export function useOnce(effect: () => void, deps: React.DependencyList = []) {
  const hasRun = useRef(false)
  const isRunning = useRef(false)

  useEffect(() => {
    if (hasRun.current || isRunning.current) return
    
    isRunning.current = true
    effect()
    hasRun.current = true
    isRunning.current = false
  }, deps)
}
