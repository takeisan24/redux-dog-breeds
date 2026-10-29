import { createSlice } from '@reduxjs/toolkit'
import type { ApiError } from '@/api/apiError'
import type { Breed, PaginationInfo } from '@/features/breeds/breedTypes'
import { fetchBreeds } from '@/features/breeds/breedsThunks'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface BreedsState {
  /** Breeds currently shown. Kept when a later request fails, so the user still sees data. */
  items: Breed[]
  pagination: PaginationInfo | null
  status: RequestStatus
  error: ApiError | null
  /** Page being loaded, or the page that failed. Retry uses it. */
  requestedPage: number
  /** Only the latest request may update the state (protects against out-of-order responses). */
  currentRequestId: string | null
  /** Time of the last successful load, shown as "Updated 10:32". */
  lastSuccessAt: number | null
}

const initialState: BreedsState = {
  items: [],
  pagination: null,
  status: 'idle',
  error: null,
  requestedPage: 1,
  currentRequestId: null,
  lastSuccessAt: null,
}

/*
 * Note: these reducers look like they mutate `state`, but createSlice uses Immer:
 * the "mutations" are recorded on a draft and a NEW state object is returned.
 * The previous state is never changed, so Redux's "state is read-only" rule still holds.
 */
export const breedsSlice = createSlice({
  name: 'breeds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBreeds.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestedPage = action.meta.arg.page
        state.currentRequestId = action.meta.requestId
      })
      .addCase(fetchBreeds.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return // an older request finished late

        state.status = 'succeeded'
        state.items = action.payload.breeds
        state.pagination = action.payload.pagination
        state.lastSuccessAt = action.payload.fetchedAt
        state.currentRequestId = null
      })
      .addCase(fetchBreeds.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return

        state.status = 'failed'
        // `payload` is our ApiError from rejectWithValue; `error` covers anything unexpected
        state.error = action.payload ?? {
          kind: 'unknown',
          message: action.error.message ?? 'Unknown error',
        }
        state.currentRequestId = null
        // `items` is intentionally left as it was
      })
  },
})

export const breedsReducer = breedsSlice.reducer
