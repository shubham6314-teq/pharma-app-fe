import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function BaseIcon({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    />
  )
}

export function IconMenu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function IconLayers(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="m4 8 8-4 8 4-8 4-8-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m4 12 8 4 8-4M4 16l8 4 8-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

export function IconPills(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect
        x="4.5"
        y="8.5"
        width="7"
        height="11"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M4.5 14h7" stroke="currentColor" strokeWidth="1.8" />
      <rect
        x="12.5"
        y="4.5"
        width="7"
        height="11"
        rx="3.5"
        transform="rotate(35 16 10)"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </BaseIcon>
  )
}

export function IconTag(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4.5 12.5V6A1.5 1.5 0 0 1 6 4.5h6.5L19.5 12l-7.5 7.5-7.5-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" />
    </BaseIcon>
  )
}

export function IconGrid(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
    </BaseIcon>
  )
}

export function IconBox(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4.5 8.5 12 4.5l7.5 4v7l-7.5 4-7.5-4v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 12.5V20M4.5 8.5 12 12.5 19.5 8.5" stroke="currentColor" strokeWidth="1.8" />
    </BaseIcon>
  )
}

export function IconClipboard(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M9 5.5h6M9 5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5M9 5.5A1.5 1.5 0 0 0 7.5 7v12A1.5 1.5 0 0 0 9 20.5h6a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 15 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function IconFile(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 4.5h6.5L18 9v10.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5v-13A2 2 0 0 1 7 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.5 4.5V9H18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </BaseIcon>
  )
}

export function IconSignOut(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M10 5.5H7A1.5 1.5 0 0 0 5.5 7v10A1.5 1.5 0 0 0 7 18.5h3M10 12h8.5M15.5 8.5 19 12l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M5.5 12.5 9.5 16.5 18.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

export function IconAlert(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8.5v4.5M12 15.8h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function IconClose(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function IconEye(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M3 12s3.4-6.5 9-6.5S21 12 21 12s-3.4 6.5-9 6.5S3 12 3 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </BaseIcon>
  )
}

export function IconEyeOff(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M3 12s3.4-6.5 9-6.5S21 12 21 12s-3.4 6.5-9 6.5S3 12 3 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19 19 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M5 16.5 15.8 5.7a1.5 1.5 0 0 1 2.1 0l.4.4a1.5 1.5 0 0 1 0 2.1L7.5 19H5v-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m13.8 7.7 2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M6 8h12M9.5 8V6.5A1.5 1.5 0 0 1 11 5h2a1.5 1.5 0 0 1 1.5 1.5V8M9 18.5h6A1.5 1.5 0 0 0 16.5 17V8h-9v9A1.5 1.5 0 0 0 9 18.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

export function IconUser(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.2c.9-3.2 3.4-5 6.5-5s5.6 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}
