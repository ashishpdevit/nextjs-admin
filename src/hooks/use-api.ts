import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'

interface UseApiOptions {
  enabled?: boolean
  refetchOnMount?: boolean
}

export function useApi<T = any>(
  apiCall: (params?: any) => any,
  params?: any,
  options: UseApiOptions = {}
) {
  const dispatch = useAppDispatch()
  const { enabled = true, refetchOnMount = true } = options
  const hasFetched = useRef(false)
  const isFetching = useRef(false)

  const fetchData = useCallback(async () => {
    if (!enabled || isFetching.current) return
    
    isFetching.current = true
    try {
      await dispatch(apiCall(params))
    } finally {
      isFetching.current = false
    }
  }, [dispatch, apiCall, params, enabled])

  useEffect(() => {
    if (enabled && (!hasFetched.current || refetchOnMount)) {
      hasFetched.current = true
      fetchData()
    }
  }, [enabled, refetchOnMount, fetchData])

  return {
    refetch: fetchData,
    isFetching: isFetching.current
  }
}
