/**
 * API layer: how `getJson` (src/api/httpClient.ts) turns every kind of failure into an error `kind`,
 * and which message the user sees for it (src/api/apiError.ts).
 */
import { describe, expect, it, vi } from 'vitest'
import { getApiErrorContent } from '@/api/apiError'
import { getJson } from '@/api/httpClient'
import { jsonResponse, mockFetchNetworkFailure, setNavigatorOnline } from './support/helpers'

const URL = 'https://dogapi.dog/api/v2/breeds'

describe('getJson', () => {
  it('returns the parsed JSON and always revalidates with the server (no HTTP cache)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true }))

    await expect(getJson(URL)).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(URL, expect.objectContaining({ cache: 'no-cache' }))
  })

  it('reports "offline" when the request fails and the browser has no connection', async () => {
    setNavigatorOnline(false)
    mockFetchNetworkFailure()

    await expect(getJson(URL)).rejects.toMatchObject({ kind: 'offline' })
  })

  it('reports "network" when the request fails although the browser says it is online', async () => {
    mockFetchNetworkFailure()

    await expect(getJson(URL)).rejects.toMatchObject({ kind: 'network' })
  })

  it('reports "http" with the status code for non-2xx responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ errors: [] }, 500))

    await expect(getJson(URL)).rejects.toMatchObject({ kind: 'http', status: 500 })
  })

  it('reports "invalid-response" when the body is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>oops</html>'))

    await expect(getJson(URL)).rejects.toMatchObject({ kind: 'invalid-response' })
  })

  it('reports a connection lost while reading the body as a connection error, not "invalid-response"', async () => {
    setNavigatorOnline(false)
    const bodyFailsToDownload = {
      ok: true,
      status: 200,
      json: () => Promise.reject(new TypeError('network error')),
    } as unknown as Response
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(bodyFailsToDownload)

    await expect(getJson(URL)).rejects.toMatchObject({ kind: 'offline' })
  })

  it('reports "timeout" when the server takes too long', async () => {
    // A fetch that never answers, and only rejects when its signal is aborted
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )

    await expect(getJson(URL, { timeoutMs: 20 })).rejects.toMatchObject({ kind: 'timeout' })
  })
})

describe('getApiErrorContent: HTTP errors', () => {
  const contentFor = (status: number) =>
    getApiErrorContent({ kind: 'http', message: `Request failed with status ${status}`, status })

  it.each([500, 503, 429])('%i is temporary: the server has a problem, trying again later can work', (status) => {
    expect(contentFor(status)).toEqual({
      title: `Dog API is unavailable (${status})`,
      description: 'The server is having problems. Please try again in a moment.',
    })
  })

  it.each([400, 404])('%i is a rejected request: trying again will not fix it', (status) => {
    expect(contentFor(status)).toEqual({
      title: `Request rejected (${status})`,
      description: 'Dog API refused the request. If this keeps happening, the app may need an update.',
    })
  })
})
