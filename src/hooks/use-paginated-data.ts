import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useAppDispatch } from '@/store/hooks'

interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  [key: string]: any
}

interface UsePaginatedDataOptions {
  enabled?: boolean
  debounceMs?: number
}

export function usePaginatedData<T = any>(
  apiCall: (params: PaginationParams) => any,
  params: PaginationParams,
  options: UsePaginatedDataOptions = {}
) {
  const dispatch = useAppDispatch()
  const { enabled = true, debounceMs = 300 } = options
  const hasFetched = useRef(false)
  const isFetching = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Debounce the params to prevent excessive API calls
  const debouncedParams = useMemo(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    return new Promise<PaginationParams>((resolve) => {
      timeoutRef.current = setTimeout(() => {
        resolve(params)
      }, debounceMs)
    })
  }, [params, debounceMs])

  const fetchData = useCallback(async (customParams?: Partial<PaginationParams>) => {
    if (!enabled || isFetching.current) return
    
    isFetching.current = true
    try {
      const finalParams = { ...params, ...customParams }
      await dispatch(apiCall(finalParams))
    } finally {
      isFetching.current = false
    }
  }, [dispatch, apiCall, params, enabled])

  // Initial fetch
  useEffect(() => {
    if (enabled && !hasFetched.current) {
      hasFetched.current = true
      fetchData()
    }
  }, [enabled, fetchData])

  // Debounced refetch when params change
  useEffect(() => {
    if (enabled && hasFetched.current) {
      debouncedParams.then((debounced) => {
        fetchData(debounced)
      })
    }
  }, [enabled, debouncedParams, fetchData])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    refetch: fetchData,
    isFetching: isFetching.current
  }
}
