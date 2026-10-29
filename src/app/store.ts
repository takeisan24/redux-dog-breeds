import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { listenerMiddleware } from '@/app/listenerMiddleware'
import { breedsReducer } from '@/features/breeds/breedsSlice'
import { networkReducer } from '@/features/network/networkSlice'

// combineReducers merges each feature's reducer into one root reducer.
// Resulting state shape: { breeds: BreedsState, network: NetworkState }
const rootReducer = combineReducers({
  breeds: breedsReducer,
  network: networkReducer,
})

export type RootState = ReturnType<typeof rootReducer>

/**
 * configureStore = createStore + applyMiddleware(thunk) + Redux DevTools, with safe defaults
 * (it also warns in dev if state is mutated or is not serializable).
 * A factory, so every test can create its own fresh store.
 */
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    // Default middleware already includes redux-thunk; we add the listener middleware
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })
}

export const store = setupStore()

type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
