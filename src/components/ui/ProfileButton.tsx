import { Link, useLocation } from 'react-router-dom'
import { IconUser } from './icons'

type ProfileButtonProps = {
  tone?: 'onLight' | 'onDark'
  className?: string
  onClick?: () => void
}

export function ProfileButton({
  tone = 'onLight',
  className = '',
  onClick,
}: ProfileButtonProps) {
  const location = useLocation()
  const isCurrent = location.pathname === '/profile'

  const toneClass =
    tone === 'onDark'
      ? isCurrent
        ? 'bg-white/12 text-white'
        : 'text-teal-100/75 hover:bg-white/10 hover:text-white'
      : isCurrent
        ? 'bg-slate-200/80 text-slate-900'
        : 'text-slate-800 hover:bg-slate-200/70'

  return (
    <Link
      to="/profile"
      aria-label="Profile"
      title="Profile"
      aria-current={isCurrent ? 'page' : undefined}
      onClick={onClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 ${
        tone === 'onDark'
          ? 'focus-visible:outline-white'
          : 'focus-visible:outline-teal-700'
      } ${toneClass} ${className}`}
    >
      <IconUser />
    </Link>
  )
}
