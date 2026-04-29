import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm',
        'text-stone-900 placeholder:text-stone-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:border-stone-400',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-50',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
