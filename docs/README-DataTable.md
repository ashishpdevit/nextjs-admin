# DataTable Component

A comprehensive, reusable table component for Next.js applications with advanced features like sorting, pagination, selection, and customizable actions.

## Features

- ✅ **Sorting**: Click column headers to sort data
- ✅ **Pagination**: Built-in pagination with configurable page sizes
- ✅ **Row Selection**: Single and bulk row selection
- ✅ **Custom Actions**: Flexible action buttons (edit, delete, view, etc.)
- ✅ **Customizable Columns**: Support for custom cell renderers
- ✅ **Responsive**: Mobile-friendly design
- ✅ **TypeScript**: Full TypeScript support
- ✅ **Accessible**: Built with accessibility in mind

## Basic Usage

```tsx
import { DataTableCard, createTextColumn, createNumberColumn } from "@/components/ui/data-table-card"

interface Product {
  id: number
  name: string
  price: number
  status: "active" | "inactive"
}

const products: Product[] = [
  { id: 1, name: "Product 1", price: 99.99, status: "active" },
  { id: 2, name: "Product 2", price: 149.99, status: "inactive" },
]

const columns = [
  createNumberColumn("id", "ID", "id"),
  createTextColumn("name", "Name", "name"),
  {
    id: "price",
    header: "Price",
    accessorKey: "price",
    sortable: true,
    cell: ({ value }) => `$${value.toFixed(2)}`,
  },
  createStatusColumn("status", "Status", "status"),
]

function ProductsPage() {
  return (
    <DataTableCard
      title="Products"
      data={products}
      columns={columns}
      selectable
      actions={{
        items: [
          {
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (row) => console.log("Edit", row),
          },
          {
            label: "Delete",
            icon: <Trash className="h-4 w-4" />,
            onClick: (row) => console.log("Delete", row),
            variant: "destructive",
          },
        ],
      }}
    />
  )
}
```

## Column Types

### Pre-built Column Helpers

```tsx
// Text column
createTextColumn("name", "Name", "name")

// Number column
createNumberColumn("id", "ID", "id")

// Badge column
createBadgeColumn("type", "Type", "type")

// Status column (with colored badges)
createStatusColumn("status", "Status", "status")

// Custom column
createCustomColumn("custom", "Custom", ({ row, value }) => (
  <div>Custom content for {row.name}</div>
))
```

### Custom Column Definition

```tsx
const customColumn: ColumnDef<Product> = {
  id: "price",
  header: "Price",
  accessorKey: "price", // or use accessorFn for computed values
  sortable: true,
  width: "100px",
  className: "text-right",
  cell: ({ row, value, index }) => (
    <div className="font-mono">${value.toFixed(2)}</div>
  ),
}
```

## Props

### DataTableCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Table title |
| `subtitle` | `string` | - | Optional subtitle |
| `headerActions` | `React.ReactNode` | - | Actions to display in header |
| `data` | `T[]` | - | Array of data to display |
| `columns` | `ColumnDef<T>[]` | - | Column definitions |
| `keyField` | `keyof T` | `"id"` | Field to use as unique key |
| `sortable` | `boolean` | `true` | Enable sorting |
| `selectable` | `boolean` | `false` | Enable row selection |
| `pagination` | `boolean` | `true` | Enable pagination |
| `pageSize` | `number` | `10` | Initial page size |
| `pageSizeOptions` | `number[]` | `[10, 20, 50]` | Available page sizes |
| `onPageSizeChange` | `(size: number) => void` | - | Called when page size changes |
| `onSortChange` | `(key: string, dir: "asc" \| "desc") => void` | - | Called when sorting changes |
| `onSelectionChange` | `(ids: (string \| number)[]) => void` | - | Called when selection changes |
| `onRowClick` | `(row: T) => void` | - | Called when row is clicked |
| `actions` | `ActionConfig<T>` | - | Action buttons configuration |
| `emptyMessage` | `string` | `"No data available"` | Message when no data |
| `loading` | `boolean` | `false` | Show loading state |

### Column Definition

```tsx
interface ColumnDef<T> {
  id: string                    // Unique column identifier
  header: string | ReactNode    // Column header
  accessorKey?: keyof T         // Field to access from row data
  accessorFn?: (row: T) => any  // Function to compute value
  cell?: (info: {               // Custom cell renderer
    row: T
    value: any
    index: number
  }) => React.ReactNode
  sortable?: boolean            // Enable sorting for this column
  width?: string               // Column width (CSS value)
  className?: string           // Additional CSS classes
  headerClassName?: string     // Header CSS classes
}
```

### Actions Configuration

```tsx
interface ActionConfig<T> {
  label?: string               // Actions column header
  items: Array<{
    label: string              // Button label/tooltip
    icon?: React.ReactNode     // Button icon
    onClick: (row: T) => void  // Click handler
    variant?: ButtonVariant    // Button variant
    disabled?: (row: T) => boolean  // Disable condition
    hidden?: (row: T) => boolean    // Hide condition
  }>
}
```

## Advanced Examples

### With Filtering and Search

```tsx
function ProductsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || product.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])

  return (
    <DataTableCard
      title="Products"
      headerActions={
        <>
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </Select>
        </>
      }
      data={filteredProducts}
      columns={columns}
      // ... other props
    />
  )
}
```

### With Bulk Actions

```tsx
function ProductsPage() {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])
  
  const handleBulkDelete = () => {
    // Delete all selected products
    setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
    setSelectedIds([])
  }

  return (
    <DataTableCard
      title="Products"
      headerActions={
        <>
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </>
      }
      data={products}
      columns={columns}
      selectable
      onSelectionChange={setSelectedIds}
      // ... other props
    />
  )
}
```

### Custom Cell Renderers

```tsx
const columns: ColumnDef<Product>[] = [
  // Image column
  {
    id: "image",
    header: "Image",
    accessorKey: "imageUrl",
    sortable: false,
    width: "80px",
    cell: ({ value }) => (
      <img 
        src={value} 
        alt="Product" 
        className="w-12 h-12 object-cover rounded"
      />
    ),
  },
  
  // Rating column
  {
    id: "rating",
    header: "Rating",
    accessorKey: "rating",
    sortable: true,
    cell: ({ value }) => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < value ? "text-yellow-400" : "text-gray-300"
            }`}
            fill={i < value ? "currentColor" : "none"}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          ({value}/5)
        </span>
      </div>
    ),
  },
  
  // Tags column
  {
    id: "tags",
    header: "Tags",
    accessorKey: "tags",
    sortable: false,
    cell: ({ value }) => (
      <div className="flex flex-wrap gap-1">
        {value.map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    ),
  },
]
```

## Styling

The DataTable component uses Tailwind CSS classes and can be customized:

```css
/* Custom table styles */
.admin-table {
  /* Your custom styles */
}

/* Custom card styles */
.table-card {
  /* Your custom styles */
}

.table-card-header {
  /* Your custom styles */
}

.table-card-title {
  /* Your custom styles */
}
```

## Migration from Existing Tables

To migrate from your existing table implementations:

1. **Replace TableCard usage**:
   ```tsx
   // Before
   <TableCard title="Products">
     <Table className="admin-table">
       {/* table content */}
     </Table>
   </TableCard>
   
   // After
   <DataTableCard
     title="Products"
     data={products}
     columns={columns}
     // ... other props
   />
   ```

2. **Convert table rows to column definitions**:
   ```tsx
   // Before: Manual table rows
   <TableRow>
     <TableCell>{product.name}</TableCell>
     <TableCell>{product.price}</TableCell>
   </TableRow>
   
   // After: Column definitions
   const columns = [
     createTextColumn("name", "Name", "name"),
     createNumberColumn("price", "Price", "price"),
   ]
   ```

3. **Move action handlers**:
   ```tsx
   // Before: Inline action buttons
   <Button onClick={() => handleEdit(product)}>Edit</Button>
   
   // After: Actions configuration
   actions={{
     items: [
       {
         label: "Edit",
         icon: <Pencil className="h-4 w-4" />,
         onClick: handleEdit,
       },
     ],
   }}
   ```

## Demo

Visit `/admin/data-table-demo` to see the DataTable component in action with various examples.
