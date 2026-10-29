/**
 * The whole app, end to end (only fetch is mocked). Follows the two exam requirements:
 * 1. Online: call the API and show information for each breed.
 * 2. Offline: call the API again and handle the failure.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/App'
import { createBreedsResponse } from './support/fixtures'
import {
  mockFetchDeferred,
  mockFetchNetworkFailure,
  mockFetchSuccess,
  renderWithProviders,
  setNavigatorOnline,
} from './support/helpers'

function goOffline() {
  setNavigatorOnline(false)
  window.dispatchEvent(new Event('offline'))
}

function goOnline() {
  setNavigatorOnline(true)
  window.dispatchEvent(new Event('online'))
}

describe('Requirement 1: online, call the API and show each breed', () => {
  it('calls the breeds API and shows information for each breed', async () => {
    const fetchMock = mockFetchSuccess(createBreedsResponse())

    renderWithProviders(<App />)

    expect(await screen.findByRole('heading', { name: 'Affenpinscher' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Akita' })).toBeInTheDocument()
    expect(screen.getByText(/Showing 1–2 of 283 breeds/)).toBeInTheDocument()
    expect(screen.getAllByText('14–16 years')).toHaveLength(2)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/breeds?page%5Bnumber%5D=1')
    // All is well, so no connection chip in the header
    expect(screen.queryByText('Online')).not.toBeInTheDocument()
    expect(screen.queryByText('Offline')).not.toBeInTheDocument()
  })

  it('credits the photo author once the photo has loaded (no credit over an empty frame)', async () => {
    mockFetchSuccess(createBreedsResponse({ names: ['Affenpinscher'] }))
    renderWithProviders(<App />)
    const photo = await screen.findByRole('img', { name: 'Affenpinscher dog' })

    expect(screen.queryByRole('link', { name: 'Jane Doe' })).not.toBeInTheDocument()

    fireEvent.load(photo)

    expect(screen.getByRole('link', { name: 'Jane Doe' })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Example.jpg',
    )
  })

  it('loads the page written in the URL (?page=2)', async () => {
    window.history.replaceState(null, '', '/?page=2')
    const fetchMock = mockFetchSuccess(createBreedsResponse({ page: 2 }))

    renderWithProviders(<App />)

    await waitFor(() =>
      expect(String(fetchMock.mock.calls[0]?.[0])).toContain('page%5Bnumber%5D=2'),
    )
    expect(await screen.findByText(/Showing 25–26 of 283 breeds/)).toBeInTheDocument()
  })

  it('clicking the page that is already open does nothing (no request, no history entry)', async () => {
    const fetchMock = mockFetchSuccess(createBreedsResponse())
    const { user } = renderWithProviders(<App />)
    await screen.findByRole('heading', { name: 'Affenpinscher' })
    const historyLength = window.history.length

    await user.click(screen.getByRole('button', { name: 'page 1' }))

    expect(window.history.length).toBe(historyLength)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('Requirement 2: disconnected, call the API again', () => {
  it('after loading: reload fails, the error is shown and the loaded breeds stay', async () => {
    mockFetchSuccess(createBreedsResponse())
    const { user } = renderWithProviders(<App />)
    await screen.findByRole('heading', { name: 'Affenpinscher' })

    goOffline()
    const fetchMock = mockFetchNetworkFailure()
    await user.click(screen.getByRole('button', { name: 'Reload breeds' }))

    expect(await screen.findByText("You're offline")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1) // the API really was called
    expect(screen.getByRole('heading', { name: 'Affenpinscher' })).toBeInTheDocument()
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('on first load: full-page error with "Try again", which recovers once online', async () => {
    setNavigatorOnline(false)
    mockFetchNetworkFailure()
    const { user } = renderWithProviders(<App />)

    expect(await screen.findByRole('heading', { name: "You're offline" })).toBeInTheDocument()

    setNavigatorOnline(true)
    mockFetchSuccess(createBreedsResponse())
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'Affenpinscher' })).toBeInTheDocument()
  })

  it('opening a page that was never loaded: full-page error, not the cards of the old page', async () => {
    mockFetchSuccess(createBreedsResponse())
    const { user } = renderWithProviders(<App />)
    await screen.findByRole('heading', { name: 'Affenpinscher' })

    goOffline()
    mockFetchNetworkFailure()
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }))

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to page 1' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Affenpinscher' })).not.toBeInTheDocument()
    expect(window.location.search).toBe('?page=2')
  })

  it('"Try again" on a page that was never loaded: skeleton while loading, the old page never comes back', async () => {
    mockFetchSuccess(createBreedsResponse())
    const { user } = renderWithProviders(<App />)
    await screen.findByRole('heading', { name: 'Affenpinscher' })

    goOffline()
    mockFetchNetworkFailure()
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }))
    await screen.findByRole('button', { name: 'Try again' })

    setNavigatorOnline(true)
    const fetchMock = mockFetchDeferred()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByRole('status', { name: 'Loading breeds' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Affenpinscher' })).not.toBeInTheDocument()

    fetchMock.respond(createBreedsResponse({ page: 2 }))
    expect(await screen.findByText(/Showing 25–26 of 283 breeds/)).toBeInTheDocument()
  })

  it('Wi-Fi off while the browser still says "online" (VPN / virtual adapters): the failed request shows the Offline chip, a successful Retry removes it', async () => {
    // navigator.onLine stays true and no offline/online events fire
    mockFetchNetworkFailure()
    const { user } = renderWithProviders(<App />)

    expect(await screen.findByRole('heading', { name: "Can't reach Dog API" })).toBeInTheDocument()
    expect(screen.getByText('Offline')).toBeInTheDocument()
    // The message must not contradict the Offline chip ("If you are online…")
    expect(screen.queryByText(/if you are online/i)).not.toBeInTheDocument()

    mockFetchSuccess(createBreedsResponse())
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'Affenpinscher' })).toBeInTheDocument()
    expect(screen.queryByText('Offline')).not.toBeInTheDocument()
  })

  it('retries automatically when the browser reports that the connection is back', async () => {
    setNavigatorOnline(false)
    mockFetchNetworkFailure()
    renderWithProviders(<App />)
    await screen.findByRole('heading', { name: "You're offline" })

    mockFetchSuccess(createBreedsResponse())
    goOnline()

    expect(await screen.findByRole('heading', { name: 'Affenpinscher' })).toBeInTheDocument()
    expect(screen.queryByText('Offline')).not.toBeInTheDocument()
  })

  it('a photo that failed to load (offline) shows a placeholder and is requested again after the next successful load', async () => {
    mockFetchSuccess(createBreedsResponse())
    const { user } = renderWithProviders(<App />)

    fireEvent.error(await screen.findByRole('img', { name: 'Affenpinscher dog' }))
    expect(screen.getByRole('img', { name: 'No photo available for Affenpinscher' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reload breeds' }))

    expect(await screen.findByRole('img', { name: 'Affenpinscher dog' })).toBeInTheDocument()
  })
})
