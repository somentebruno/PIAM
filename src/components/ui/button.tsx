import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-900 shadow-sm',
  outline: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400 focus-visible:ring-stone-300',
  ghost: 'text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-stone-200',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export function buttonClass(variant: Variant = 'default', size: Size = 'md', extra?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    extra
  )
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button ref={ref} className={buttonClass(variant, size, className)} {...props} />
  )
)
Button.displayName = 'Button'

export { Button }
