import { useEffect, useRef } from 'react'

/**
 * A smart effect hook that prevents double execution in React Strict Mode
 * while allowing the effect to run when dependencies actually change
 */
export function useSmartEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList
) {
  const isRunning = useRef(false)
  const lastDepsRef = useRef<React.DependencyList>([])
  const effectId = useRef(0)

  useEffect(() => {
    // Check if dependencies have actually changed
    const depsChanged = deps.length !== lastDepsRef.current.length ||
      deps.some((dep, index) => dep !== lastDepsRef.current[index])
    
    // If dependencies haven't changed and we're already running, skip
    if (isRunning.current && !depsChanged) {
      return
    }

    // Generate a unique ID for this effect execution
    const currentEffectId = ++effectId.current
    isRunning.current = true
    lastDepsRef.current = [...deps]
    
    // Execute the effect
    const cleanup = effect()
    
    // Only mark as not running if this is still the current effect
    // This prevents race conditions in React Strict Mode
    if (currentEffectId === effectId.current) {
      isRunning.current = false
    }

    return cleanup
  }, deps)
}
