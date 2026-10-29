import { createAsyncThunk } from '@reduxjs/toolkit'
import { toApiError, type ApiError } from '@/api/apiError'
import { getBreeds } from '@/api/dogApi'
import type { RootState } from '@/app/store'
import { mapBreedsResponse } from '@/features/breeds/breedMapper'
import type { BreedsPage } from '@/features/breeds/breedTypes'

/** 24 divides evenly into 1, 2, 3 and 4 columns, so the grid rows are always full. */
const BREEDS_PAGE_SIZE = 24

interface FetchBreedsArgs {
  page: number
}

interface FetchBreedsResult extends BreedsPage {
  fetchedAt: number
}

/**
 * Async logic lives in a thunk, never in a reducer (reducers must stay pure).
 * createAsyncThunk dispatches `breeds/fetchBreeds/pending`, then `.../fulfilled` or `.../rejected`.
 */
export const fetchBreeds = createAsyncThunk<
  FetchBreedsResult,
  FetchBreedsArgs,
  { state: RootState; rejectValue: ApiError }
>(
  'breeds/fetchBreeds',
  async ({ page }, { signal, rejectWithValue }) => {
    try {
      const response = await getBreeds({ page, pageSize: BREEDS_PAGE_SIZE }, { signal })
      return {
        ...mapBreedsResponse(response, BREEDS_PAGE_SIZE),
        // Created here, not in the reducer: Date.now() is a side effect
        fetchedAt: Date.now(),
      }
    } catch (error) {
      return rejectWithValue(toApiError(error))
    }
  },
  {
    // Skip if a request for this exact page is already in flight: React StrictMode runs effects
    // twice in dev, and users double-click. Returning false means nothing is dispatched.
    condition: ({ page }, { getState }) => {
      const { currentRequestId, requestedPage } = getState().breeds
      const isSamePageInFlight = currentRequestId !== null && requestedPage === page
      return !isSamePageInFlight
    },
  },
)
