import { BreedsPage } from '@/features/breeds/components/BreedsPage'
import { useNetworkStatusListener } from '@/features/network/useNetworkStatusListener'
import { AppFooter } from '@/layout/AppFooter'
import { AppHeader } from '@/layout/AppHeader'

/** Root component: the app shell (header + footer) around the page. */
export function App() {
  useNetworkStatusListener()

  return (
    <>
      <AppHeader />
      <BreedsPage />
      <AppFooter />
    </>
  )
}
