/**
 * Redux layer for breeds: mapper (raw API → Breed), reducers (pending / fulfilled / rejected),
 * the view state selector and the fetchBreeds thunk (duplicate and out-of-order requests).
 */
import { describe, expect, it } from 'vitest'
import type { ApiError } from '@/api/apiError'
import { setupStore } from '@/app/store'
import { mapBreedsResponse } from '@/features/breeds/breedMapper'
import { selectBreedsViewState } from '@/features/breeds/breedsSelectors'
import { breedsReducer, type BreedsState } from '@/features/breeds/breedsSlice'
import { fetchBreeds } from '@/features/breeds/breedsThunks'
import { createBreedsResponse } from './support/fixtures'
import { mockFetchSuccess } from './support/helpers'

describe('breedMapper', () => {
  it('maps a raw API breed into the app Breed type, including the group name', () => {
    const { breeds } = mapBreedsResponse(createBreedsResponse({ names: ['Affenpinscher'] }), 24)

    expect(breeds[0]).toEqual({
      id: 'breed-affenpinscher',
      name: 'Affenpinscher',
      description: 'Affenpinscher is a friendly test dog.',
      groupName: 'Toy Group',
      lifeSpan: { min: 14, max: 16 },
      maleWeight: { min: 4, max: 6 },
      femaleWeight: { min: 4, max: 5 },
      isHypoallergenic: true,
      originCountry: 'Germany',
      photo: {
        url: 'https://images.example.test/breed-affenpinscher-medium.webp',
        author: 'Jane Doe',
        license: 'CC BY-SA 4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
      },
    })
  })

  it('maps the pagination', () => {
    const { pagination } = mapBreedsResponse(createBreedsResponse({ page: 2, last: 12 }), 24)

    expect(pagination).toEqual({ currentPage: 2, lastPage: 12, totalRecords: 283, pageSize: 24 })
  })

  it('computes the last page when the API leaves `last` out (it does on the last page)', () => {
    const response = createBreedsResponse({ page: 12, last: undefined, records: 283 })

    expect(mapBreedsResponse(response, 24).pagination.lastPage).toBe(12) // ceil(283 / 24)
  })
})

const initialState = breedsReducer(undefined, { type: '@@INIT' })
const page1 = { ...mapBreedsResponse(createBreedsResponse({ page: 1 }), 24), fetchedAt: 1_000 }
const offlineError: ApiError = { kind: 'offline', message: 'Failed to fetch' }

/** State after page 1 was loaded successfully. */
function loadedState(): BreedsState {
  const pending = breedsReducer(initialState, fetchBreeds.pending('request-1', { page: 1 }))
  return breedsReducer(pending, fetchBreeds.fulfilled(page1, 'request-1', { page: 1 }))
}

/** Page 1 is on screen, then a request for `page` fails. */
function failedState(page: number): BreedsState {
  const pending = breedsReducer(loadedState(), fetchBreeds.pending('request-2', { page }))
  return breedsReducer(pending, fetchBreeds.rejected(null, 'request-2', { page }, offlineError))
}

describe('breedsSlice', () => {
  it('pending: marks the request as loading and remembers the requested page', () => {
    const state = breedsReducer(initialState, fetchBreeds.pending('request-1', { page: 3 }))

    expect(state.status).toBe('loading')
    expect(state.requestedPage).toBe(3)
    expect(state.currentRequestId).toBe('request-1')
  })

  it('fulfilled: stores the breeds and the pagination', () => {
    const state = loadedState()

    expect(state.status).toBe('succeeded')
    expect(state.items.map((breed) => breed.name)).toEqual(['Affenpinscher', 'Akita'])
    expect(state.pagination?.currentPage).toBe(1)
    expect(state.lastSuccessAt).toBe(1_000)
  })

  it('rejected: stores the error but KEEPS the breeds that were already loaded', () => {
    const state = failedState(1)

    expect(state.status).toBe('failed')
    expect(state.error).toEqual(offlineError)
    expect(state.items).toHaveLength(2)
  })

  it('ignores the response of an older request that finished late', () => {
    let state = breedsReducer(initialState, fetchBreeds.pending('old', { page: 1 }))
    state = breedsReducer(state, fetchBreeds.pending('new', { page: 2 }))
    state = breedsReducer(state, fetchBreeds.fulfilled(page1, 'old', { page: 1 }))

    expect(state.status).toBe('loading')
    expect(state.items).toEqual([])
  })

  it('never mutates the previous state (Immer returns a new object)', () => {
    const previous = loadedState()
    const next = breedsReducer(previous, fetchBreeds.pending('request-2', { page: 2 }))

    expect(next).not.toBe(previous)
    expect(previous.status).toBe('succeeded')
    expect(previous.requestedPage).toBe(1)
  })
})

describe('selectBreedsViewState', () => {
  const viewStateOf = (breeds: BreedsState) =>
    selectBreedsViewState({ breeds, network: { isOnline: true } })

  it('reloading the page on screen: keeps its cards (dimmed)', () => {
    const state = breedsReducer(loadedState(), fetchBreeds.pending('request-2', { page: 1 }))

    expect(viewStateOf(state)).toBe('loadingWithData')
  })

  it('loading another page: skeleton, not the cards of the old page', () => {
    const state = breedsReducer(loadedState(), fetchBreeds.pending('request-2', { page: 2 }))

    expect(viewStateOf(state)).toBe('loadingNoData')
  })

  it('retrying a page that failed and was never loaded: skeleton, not the cards of the old page', () => {
    const state = breedsReducer(failedState(7), fetchBreeds.pending('request-3', { page: 7 }))

    expect(viewStateOf(state)).toBe('loadingNoData')
  })

  it('failed: keeps the cards only if they are the page that failed', () => {
    expect(viewStateOf(failedState(1))).toBe('errorWithData')
    expect(viewStateOf(failedState(7))).toBe('errorNoData')
  })
})

describe('fetchBreeds thunk', () => {
  it('sends one request when the same page is requested again while in flight (StrictMode, double click)', async () => {
    const fetchMock = mockFetchSuccess(createBreedsResponse())
    const store = setupStore()

    await Promise.all([
      store.dispatch(fetchBreeds({ page: 1 })),
      store.dispatch(fetchBreeds({ page: 1 })),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().breeds.status).toBe('succeeded')
  })

  it('does not block a request for another page, and only the latest one updates the state', async () => {
    const fetchMock = mockFetchSuccess(createBreedsResponse({ page: 2 }))
    const store = setupStore()

    await Promise.all([
      store.dispatch(fetchBreeds({ page: 1 })),
      store.dispatch(fetchBreeds({ page: 2 })),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(store.getState().breeds.requestedPage).toBe(2)
    expect(store.getState().breeds.pagination?.currentPage).toBe(2)
  })
})
