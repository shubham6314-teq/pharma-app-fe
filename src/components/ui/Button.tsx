import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  width?: 'full' | 'auto'
  size?: 'md' | 'sm' | 'icon'
}

const variantClass = {
  primary:
    'bg-teal-700 text-white shadow-sm hover:bg-teal-800 focus-visible:outline-teal-700 disabled:bg-teal-700/60',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-teal-700 disabled:bg-slate-100',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-600/60',
  ghost:
    'bg-transparent text-current shadow-none hover:bg-white/10 focus-visible:outline-white disabled:opacity-50',
} as const

const sizeClass = {
  md: 'h-12 px-4 text-sm',
  sm: 'h-9 px-3 text-xs',
  icon: 'h-9 w-9 px-0',
} as const

export function Button({
  className = '',
  type = 'button',
  variant = 'primary',
  width = 'full',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${width === 'full' ? 'w-full' : 'w-auto'} ${className}`}
      {...props}
    />
  )
}
