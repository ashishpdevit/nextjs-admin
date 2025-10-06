import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Search, AlertCircle } from 'lucide-react'

interface TableLoadingStateProps {
  message?: string
}

export function TableLoadingState({ message = "Loading..." }: TableLoadingStateProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TableEmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export function TableEmptyState({ 
  title = "No data found", 
  message = "Try adjusting your search or filter criteria to find what you're looking for.",
  icon
}: TableEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          {icon || (
            <div className="h-12 w-12 text-muted-foreground mb-4">
              <Search className="h-12 w-12" />
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TableErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function TableErrorState({ 
  title = "Something went wrong", 
  message = "There was an error loading the data. Please try again.",
  onRetry
}: TableErrorStateProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            {message}
          </p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
