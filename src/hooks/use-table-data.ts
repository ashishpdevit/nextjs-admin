import { useEffect, useMemo, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'

interface TableDataParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  [key: string]: any
}

interface UseTableDataOptions {
  enabled?: boolean
  debounceMs?: number
}

/**
 * Custom hook for managing table data with pagination, search, and sorting
 * This is the standard pattern for the starter kit
 */
export function useTableData<T = any>(
  apiCall: (params: TableDataParams) => any,
  params: TableDataParams,
  options: UseTableDataOptions = {}
) {
  const dispatch = useAppDispatch()
  const { enabled = true, debounceMs = 300 } = options
  const hasInitialized = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Create a stable reference for the search parameters
  const searchParams = useMemo(() => ({
    page,
    limit,
    sortBy,
    sortOrder,
    search: search || undefined,
    ...Object.fromEntries(
      Object.entries(params).filter(([key]) => 
        !['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(key)
      )
    )
  }), [params])

  // Debounced effect for search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (enabled) {
        dispatch(apiCall(searchParams))
        hasInitialized.current = true
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [dispatch, apiCall, searchParams, enabled, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isInitialized: hasInitialized.current
  }
}
