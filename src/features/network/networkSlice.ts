import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

export interface NetworkState {
  /** Can the app reach the Internet? Set by the browser's online/offline events and by API results. */
  isOnline: boolean
}

export const networkSlice = createSlice({
  name: 'network',
  // A function, so the connection is read when the store is created (not when this file is imported)
  initialState: (): NetworkState => ({ isOnline: navigator.onLine }),
  reducers: {
    // Named as an event ("what happened"), as the Redux style guide recommends
    networkStatusChanged(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload
    },
  },
})

export const { networkStatusChanged } = networkSlice.actions
export const networkReducer = networkSlice.reducer

export const selectIsOnline = (state: RootState) => state.network.isOnline
