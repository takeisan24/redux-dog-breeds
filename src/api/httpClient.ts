import { ApiRequestError } from '@/api/apiError'

const DEFAULT_TIMEOUT_MS = 10_000

interface GetJsonOptions {
  /** Lets the caller cancel the request (createAsyncThunk provides one). */
  signal?: AbortSignal
  timeoutMs?: number
}

/**
 * GET a URL and parse the JSON body.
 * Every failure is thrown as an `ApiRequestError` with a `kind`, so callers never deal with raw fetch errors.
 */
export async function getJson<T>(
  url: string,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: GetJsonOptions = {},
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

  let response: Response
  try {
    // `no-cache` = always check with the server first. Dog API sends
    // `cache-control: max-age=300, stale-while-revalidate=3600`, so without it the browser
    // could answer from its HTTP cache while offline and the failure would be hidden.
    response = await fetch(url, { signal: requestSignal, cache: 'no-cache' })
  } catch (error) {
    throw toRequestError(error, timeoutSignal)
  }

  // fetch does NOT reject on 4xx/5xx, so the status has to be checked by hand
  if (!response.ok) {
    throw new ApiRequestError('http', `Request failed with status ${response.status}`, response.status)
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    // Only a SyntaxError means the body is not JSON. The connection can also drop
    // (or time out) while the body is still downloading: that is a request failure.
    throw error instanceof SyntaxError
      ? new ApiRequestError('invalid-response', 'Response body is not valid JSON')
      : toRequestError(error, timeoutSignal)
  }
}

function toRequestError(error: unknown, timeoutSignal: AbortSignal): ApiRequestError {
  if (timeoutSignal.aborted) {
    return new ApiRequestError('timeout', 'Request timed out')
  }
  // fetch rejects with a TypeError when the network fails (offline, DNS, server unreachable).
  // navigator.onLine === false means there is no connection at all.
  if (error instanceof TypeError) {
    return new ApiRequestError(navigator.onLine ? 'network' : 'offline', error.message)
  }
  return new ApiRequestError('unknown', String(error))
}
