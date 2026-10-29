import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { vi } from 'vitest'
import { setupStore } from '@/app/store'
import { theme } from '@/app/theme'

/** Renders a component with a fresh Redux store and the MUI theme, like main.tsx does. */
export function renderWithProviders(ui: ReactElement) {
  const store = setupStore()
  const user = userEvent.setup()
  const result = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </Provider>,
  )
  return { store, user, ...result }
}

/** Simulates the browser's connection state (`navigator.onLine`). */
export function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => isOnline })
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/vnd.api+json' },
  })
}

/** Every fetch call answers with this body (a new Response each time, since a body can only be read once). */
export function mockFetchSuccess(body: unknown) {
  return mockFetch().mockImplementation(async () => jsonResponse(body))
}

/** Every fetch call fails like it does without a connection. */
export function mockFetchNetworkFailure() {
  return mockFetch().mockRejectedValue(new TypeError('Failed to fetch'))
}

/** fetch stays pending until `respond(body)` is called, to check what is shown while loading. */
export function mockFetchDeferred() {
  let resolveFetch: (response: Response) => void = () => {}
  mockFetch().mockImplementation(
    () => new Promise<Response>((resolve) => (resolveFetch = resolve)),
  )
  return { respond: (body: unknown) => resolveFetch(jsonResponse(body)) }
}

/** Spying on fetch again returns the same spy, so clear the calls recorded before. */
function mockFetch() {
  return vi.spyOn(globalThis, 'fetch').mockClear()
}
