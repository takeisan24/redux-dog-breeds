import { createListenerMiddleware } from '@reduxjs/toolkit'
import { isConnectionError } from '@/api/apiError'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchBreeds } from '@/features/breeds/breedsThunks'
import { networkStatusChanged } from '@/features/network/networkSlice'

/**
 * Middleware runs between `dispatch(action)` and the reducers.
 * The listener middleware lets us react to actions with side effects, outside of components.
 * Features never import each other, so behavior that links `breeds` and `network` lives here.
 */
export const listenerMiddleware = createListenerMiddleware()

const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()

// When the browser reports that the connection is back, retry the request that failed.
startAppListening({
  actionCreator: networkStatusChanged,
  effect: (action, listenerApi) => {
    const isBackOnline = action.payload
    const { status, requestedPage } = listenerApi.getState().breeds

    if (isBackOnline && status === 'failed') {
      listenerApi.dispatch(fetchBreeds({ page: requestedPage }))
    }
  },
})

// The browser's online/offline events are not reliable: VPN or virtual network adapters keep
// `navigator.onLine` true with Wi-Fi off, so no `offline` event ever fires. The result of a real
// request is the reliable signal, so it updates the connection status too.
startAppListening({
  actionCreator: fetchBreeds.rejected,
  effect: (action, listenerApi) => {
    if (isConnectionError(action.payload) && listenerApi.getState().network.isOnline) {
      listenerApi.dispatch(networkStatusChanged(false))
    }
  },
})

startAppListening({
  actionCreator: fetchBreeds.fulfilled,
  effect: (_action, listenerApi) => {
    if (!listenerApi.getState().network.isOnline) {
      listenerApi.dispatch(networkStatusChanged(true))
    }
  },
})
