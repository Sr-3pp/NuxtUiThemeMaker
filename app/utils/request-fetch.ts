import type { AuthAccess } from '~/types/auth-access'

export type AppRequestFetch = <T>(
  url: string,
  options?: {
    method?: string
    credentials?: RequestCredentials
    body?: unknown
    headers?: HeadersInit
  },
) => Promise<T>

export function useAppRequestFetch(): AppRequestFetch {
  if (import.meta.server) {
    return useRequestFetch() as unknown as AppRequestFetch
  }

  return $fetch as unknown as AppRequestFetch
}

export function fetchAuthAccess() {
  return useAppRequestFetch()<AuthAccess>('/api/auth/access', {
    credentials: 'include',
  })
}
