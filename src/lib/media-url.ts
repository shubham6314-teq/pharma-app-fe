export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
  const origin = apiBase.replace(/\/api\/?$/, '')
  const path = url.startsWith('/') ? url : `/${url}`

  return origin ? `${origin}${path}` : path
}
