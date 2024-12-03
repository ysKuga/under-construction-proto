import { useNotifications } from '@/components/ui/notifications'
import { env } from '@/config/env'

type RequestOptions = {
  body?: any
  cache?: RequestCache
  cookie?: string
  headers?: Record<string, string>
  method?: string
  next?: NextFetchRequestConfig
  params?: Record<string, boolean | null | number | string | undefined>
}

function buildUrlWithParams(
  url: string,
  params?: RequestOptions['params'],
): string {
  if (!params) return url
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  )
  if (Object.keys(filteredParams).length === 0) return url
  const queryString = new URLSearchParams(
    filteredParams as Record<string, string>,
  ).toString()
  return `${url}?${queryString}`
}

// Create a separate function for getting server-side cookies that can be imported where needed
export function getServerCookies() {
  if (typeof window !== 'undefined') return ''

  // Dynamic import next/headers only on server-side
  return import('next/headers').then(({ cookies }) => {
    try {
      const cookieStore = cookies()
      return cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ')
    } catch (error) {
      console.error('Failed to access cookies:', error)
      return ''
    }
  })
}

async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    cache = 'no-store',
    cookie,
    headers = {},
    method = 'GET',
    next,
    params,
  } = options

  // Get cookies from the request when running on server
  let cookieHeader = cookie
  if (typeof window === 'undefined' && !cookie) {
    cookieHeader = await getServerCookies()
  }

  const fullUrl = buildUrlWithParams(`${env.API_URL}${url}`, params)

  const response = await fetch(fullUrl, {
    body: body ? JSON.stringify(body) : undefined,
    cache,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    method,
    next,
  })

  if (!response.ok) {
    const message = (await response.json()).message || response.statusText
    if (typeof window !== 'undefined') {
      useNotifications.getState().addNotification({
        message,
        title: 'Error',
        type: 'error',
      })
    }
    throw new Error(message)
  }

  return response.json()
}

export const api = {
  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'DELETE' })
  },
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'GET' })
  },
  patch<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, body, method: 'PATCH' })
  },
  post<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, body, method: 'POST' })
  },
  put<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, body, method: 'PUT' })
  },
}
