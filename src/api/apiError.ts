type ApiErrorKind =
  | 'offline' // no network connection at all
  | 'network' // connected, but the server could not be reached (DNS, server down, no Internet)
  | 'timeout' // the server took too long to answer
  | 'http' // the server answered with a non-2xx status
  | 'invalid-response' // the body was not valid JSON
  | 'unknown'

/**
 * Plain object (not a class instance) so it is serializable and can live in the Redux state.
 */
export interface ApiError {
  kind: ApiErrorKind
  message: string
  status?: number
}

/**
 * Thrown by the http client. Converted to a plain `ApiError` with `toApiError()` before it reaches Redux.
 */
export class ApiRequestError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.kind = kind
    this.status = status
  }
}

/**
 * True when the server could not be reached at all (as opposed to answering with an error).
 * `navigator.onLine` is not enough to detect this: VPN or virtual network adapters keep it `true`
 * even with Wi-Fi turned off, so a failed request is the only reliable signal.
 */
export function isConnectionError(error: ApiError | null | undefined): boolean {
  return error?.kind === 'offline' || error?.kind === 'network'
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiRequestError) {
    return error.status === undefined
      ? { kind: error.kind, message: error.message }
      : { kind: error.kind, message: error.message, status: error.status }
  }
  return { kind: 'unknown', message: error instanceof Error ? error.message : String(error) }
}

interface ApiErrorContent {
  title: string
  description: string
}

/**
 * User-facing text for each kind of error. The raw `message` is not shown because
 * every browser words network errors differently ("Failed to fetch", "Load failed"...).
 */
export function getApiErrorContent(error: ApiError): ApiErrorContent {
  switch (error.kind) {
    case 'offline':
      return {
        title: "You're offline",
        description: 'Check your Internet connection, then try again.',
      }
    case 'network':
      return {
        title: "Can't reach Dog API",
        description: 'Check your Internet connection. If you are online, Dog API may be down.',
      }
    case 'timeout':
      return {
        title: 'Request timed out',
        description: 'Dog API is taking too long to respond. Please try again.',
      }
    case 'http':
      return {
        title: `Dog API error (${error.status ?? 'unknown status'})`,
        description: 'The server returned an error. Please try again later.',
      }
    case 'invalid-response':
      return {
        title: 'Unexpected response',
        description: 'Dog API returned data in an unexpected format.',
      }
    case 'unknown':
      return { title: 'Something went wrong', description: 'An unexpected error occurred.' }
  }
}
