import { useEffect } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { networkStatusChanged } from '@/features/network/networkSlice'

/**
 * Updates `state.network.isOnline` from the browser's online/offline events. Use once, in App.
 * These events can be missing (VPN / virtual adapters), so API results also update the status:
 * see `app/listenerMiddleware.ts`.
 */
export function useNetworkStatusListener() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleOnline = () => dispatch(networkStatusChanged(true))
    const handleOffline = () => dispatch(networkStatusChanged(false))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [dispatch])
}
