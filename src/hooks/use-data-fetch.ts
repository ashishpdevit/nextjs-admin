import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'

interface UseDataFetchOptions {
  enabled?: boolean
  refetchOnMount?: boolean
}

export function useDataFetch<T = any>(
  apiCall: (params?: any) => any,
  params?: any,
  options: UseDataFetchOptions = {}
) {
  const dispatch = useAppDispatch()
  const { enabled = true, refetchOnMount = true } = options
  const hasFetched = useRef(false)
  const isFetching = useRef(false)
  const lastParams = useRef<any>(null)

  const fetchData = useCallback(async (customParams?: any) => {
    if (!enabled || isFetching.current) return
    
    const finalParams = customParams || params
    const paramsChanged = JSON.stringify(finalParams) !== JSON.stringify(lastParams.current)
    
    if (!hasFetched.current || refetchOnMount || paramsChanged) {
      isFetching.current = true
      lastParams.current = finalParams
      
      try {
        await dispatch(apiCall(finalParams))
      } finally {
        isFetching.current = false
        hasFetched.current = true
      }
    }
  }, [dispatch, apiCall, params, enabled, refetchOnMount])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [enabled, fetchData])

  return {
    refetch: fetchData,
    isFetching: isFetching.current
  }
}
