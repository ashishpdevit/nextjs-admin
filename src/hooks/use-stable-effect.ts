import { useEffect, useRef } from 'react'

/**
 * A stable effect hook that prevents double execution in React Strict Mode
 * while still allowing the effect to run when dependencies change
 */
export function useStableEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList
) {
  const isRunning = useRef(false)
  const lastDeps = useRef<React.DependencyList>([])

  useEffect(() => {
    // Check if dependencies have actually changed
    const depsChanged = deps.some((dep, index) => dep !== lastDeps.current[index])
    
    // Prevent double execution in Strict Mode for the same dependencies
    if (isRunning.current && !depsChanged) {
      return
    }

    isRunning.current = true
    lastDeps.current = deps
    
    const cleanup = effect()
    isRunning.current = false

    return cleanup
  }, deps)
}
