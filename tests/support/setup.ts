/** Runs before every test file (see `test.setupFiles` in vite.config.ts). */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { setNavigatorOnline } from './helpers'

// jsdom does not implement matchMedia (used by MUI's useMediaQuery and the color scheme) or scrollTo
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList
window.scrollTo = () => {}

// Every test starts from a clean browser: no mocks, online, at "/", nothing saved by MUI
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  setNavigatorOnline(true)
  window.history.replaceState(null, '', '/')
  localStorage.clear()
})
