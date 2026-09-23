export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function requestJson<T>(endpoint: string, options: RequestInit): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  Object.entries(authHeaders()).forEach(([name, value]) => headers.set(name, value))
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed: ${response.status}`)
  }
  return body as T
}
