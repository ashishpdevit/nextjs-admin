# Custom Hooks for NextJS Admin Starter Kit

This directory contains reusable custom hooks that provide consistent patterns for data fetching and state management across the admin application.

## Available Hooks

### `useDebounce`
Delays the execution of a value update to prevent excessive API calls during user input.

```typescript
import { useDebounce } from '@/hooks/use-debounce'

const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 500) // 500ms delay
```

### `useSmartEffect`
Prevents double execution of effects in React Strict Mode while allowing the effect to run when dependencies actually change.

```typescript
import { useSmartEffect } from '@/hooks/use-smart-effect'

useSmartEffect(() => {
  dispatch(fetchData(params))
}, [dispatch, params])
```

### `useDataFetch`
A comprehensive hook for data fetching with built-in loading states and error handling.

```typescript
import { useDataFetch } from '@/hooks/use-data-fetch'

const { refetch, isFetching } = useDataFetch(
  fetchProducts,
  { page: 1, limit: 10 },
  { enabled: true, refetchOnMount: true }
)
```

### `useTableData`
Specialized hook for table data with pagination, search, and sorting.

```typescript
import { useTableData } from '@/hooks/use-table-data'

useTableData(fetchProducts, {
  page: 1,
  limit: 10,
  sortBy: 'name',
  sortOrder: 'asc',
  search: 'query'
}, { debounceMs: 300 })
```

## Best Practices

1. **Always use `useSmartEffect`** for API calls to prevent double execution while allowing parameter changes
2. **Use `useDebounce`** for search inputs to reduce API calls
3. **Memoize search parameters** with `useMemo` to prevent unnecessary re-renders
4. **Keep hooks focused** on single responsibilities
5. **Document custom hooks** with TypeScript interfaces

## Standard Pattern for Table Pages

```typescript
// 1. State management
const [search, setSearch] = useState('')
const [page, setPage] = useState(1)
const [sortBy, setSortBy] = useState('id')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

// 2. Debounced search
const debouncedSearch = useDebounce(search, 500)

// 3. Memoized parameters
const searchParams = useMemo(() => ({
  page,
  limit: 10,
  sortBy,
  sortOrder,
  search: debouncedSearch || undefined,
  // ... other filters
}), [page, sortBy, sortOrder, debouncedSearch])

// 4. Smart effect for API calls
useSmartEffect(() => {
  dispatch(fetchData(searchParams))
}, [dispatch, searchParams])
```

This pattern ensures:
- ✅ Single API call per page load
- ✅ Debounced search to prevent excessive calls
- ✅ Stable effects that work in both development and production
- ✅ Consistent behavior across all admin pages
