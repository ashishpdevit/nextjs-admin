// Global modal configuration
export interface ModalConfig {
  position: 'center' | 'right'
  width: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  height: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
}

// Default configuration - can be overridden
export const defaultModalConfig: ModalConfig = {
  position: 'right', // Default to right side like Metronic
  width: '6xl',
  height: 'full'
}

// Modal position classes
export const getModalPositionClasses = (position: 'center' | 'right') => {
  if (position === 'right') {
    return {
      container: 'fixed inset-0 z-50 flex justify-end',
      content: 'h-full w-full max-w-2xl translate-x-0 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 transition-transform duration-300 ease-in-out',
      overlay: 'fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
    }
  } else {
    return {
      container: 'fixed inset-0 z-50 flex items-center justify-center',
      content: 'h-auto max-h-[95vh] w-full max-w-2xl translate-y-0 data-[state=closed]:translate-y-4 data-[state=open]:translate-y-0 transition-transform duration-300 ease-in-out',
      overlay: 'fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
    }
  }
}

// Modal size classes
export const getModalSizeClasses = (width: string, height: string) => {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  }

  const heightClasses = {
    auto: 'h-auto',
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-96',
    xl: 'h-[28rem]',
    '2xl': 'h-[32rem]',
    '3xl': 'h-[36rem]',
    '4xl': 'h-[40rem]',
    '5xl': 'h-[44rem]',
    '6xl': 'h-[48rem]',
    '7xl': 'h-[52rem]',
    full: 'h-full'
  }

  return {
    width: widthClasses[width as keyof typeof widthClasses] || 'max-w-2xl',
    height: heightClasses[height as keyof typeof heightClasses] || 'h-auto'
  }
}
