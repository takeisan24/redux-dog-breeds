import { useCallback, useEffect, useState } from 'react'

/** Reads `?page=3` from the URL. Missing or invalid values (abc, 0, -1) mean page 1. */
function readPageFromUrl(): number {
  const page = Number(new URLSearchParams(window.location.search).get('page'))
  return Number.isInteger(page) && page >= 1 ? page : 1
}

function writePageToUrl(page: number, mode: 'push' | 'replace') {
  const url = new URL(window.location.href)
  if (page === 1) {
    url.searchParams.delete('page') // page 1 is just "/"
  } else {
    url.searchParams.set('page', String(page))
  }
  if (mode === 'push') {
    window.history.pushState(null, '', url)
  } else {
    window.history.replaceState(null, '', url)
  }
}

/**
 * The current page lives in the URL (`?page=2`), so it survives a refresh, can be shared,
 * and works with the browser's Back / Forward buttons.
 */
export function usePageFromUrl(): [page: number, changePage: (page: number) => void] {
  const [page, setPage] = useState(readPageFromUrl)

  useEffect(() => {
    // Clean up invalid values such as ?page=abc
    writePageToUrl(readPageFromUrl(), 'replace')

    const handlePopState = () => setPage(readPageFromUrl())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const changePage = useCallback((nextPage: number) => {
    writePageToUrl(nextPage, 'push')
    setPage(nextPage)
  }, [])

  return [page, changePage]
}
