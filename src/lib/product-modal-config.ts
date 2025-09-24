// Standardized configuration for all product modals
// This ensures consistent sizing and behavior across view, edit, and create modals

export const PRODUCT_MODAL_CONFIG = {
  position: 'right' as const,
  width: '6xl' as const,
  height: 'full' as const
}

// Common styling classes for product modals
export const PRODUCT_MODAL_CLASSES = {
  container: "p-0 flex flex-col",
  header: "p-6 border-b bg-white dark:bg-gray-800 sticky top-0 z-10",
  content: "flex-1 overflow-y-auto p-8",
  grid: "grid grid-cols-1 xl:grid-cols-2 gap-8",
  column: "space-y-8",
  footer: "p-6 border-t bg-gray-50 dark:bg-gray-800 sticky bottom-0 z-10"
}
