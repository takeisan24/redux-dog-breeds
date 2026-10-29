import { useEffect } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import { getApiErrorContent } from '@/api/apiError'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { StatusMessage } from '@/components/StatusMessage'
import {
  selectBreeds,
  selectBreedsError,
  selectBreedsPagination,
  selectBreedsViewState,
  selectIsBreedsLoading,
  selectLastSuccessAt,
} from '@/features/breeds/breedsSelectors'
import { fetchBreeds } from '@/features/breeds/breedsThunks'
import { BreedGrid } from '@/features/breeds/components/BreedGrid'
import { BreedGridSkeleton } from '@/features/breeds/components/BreedGridSkeleton'
import { BreedsPagination } from '@/features/breeds/components/BreedsPagination'
import { BreedsSummary } from '@/features/breeds/components/BreedsSummary'
import { usePageFromUrl } from '@/features/breeds/usePageFromUrl'
import { formatTime } from '@/utils/formatters'

/**
 * Container for the breeds page: the only component of this page that reads the store and
 * dispatches. Everything it renders below gets data through props.
 */
export function BreedsPage() {
  const dispatch = useAppDispatch()
  const [page, changePage] = usePageFromUrl()

  const viewState = useAppSelector(selectBreedsViewState)
  const breeds = useAppSelector(selectBreeds)
  const pagination = useAppSelector(selectBreedsPagination)
  const error = useAppSelector(selectBreedsError)
  const isLoading = useAppSelector(selectIsBreedsLoading)
  const lastSuccessAt = useAppSelector(selectLastSuccessAt)

  // Call the API whenever the page in the URL changes (including the first render)
  useEffect(() => {
    dispatch(fetchBreeds({ page }))
  }, [dispatch, page])

  const handleRetry = () => dispatch(fetchBreeds({ page }))

  const handlePageChange = (nextPage: number) => {
    // MUI also fires onChange for the page that is already selected
    if (nextPage === page) return
    changePage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const errorContent = error ? getApiErrorContent(error) : null

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {viewState === 'loadingNoData' && <BreedGridSkeleton />}

      {viewState === 'errorNoData' && errorContent && (
        <StatusMessage
          role="alert"
          icon={error?.kind === 'offline' ? <WifiOffIcon /> : <CloudOffIcon />}
          title={errorContent.title}
          description={errorContent.description}
          actions={
            <>
              <Button variant="contained" onClick={handleRetry} disabled={isLoading}>
                Try again
              </Button>
              {pagination && pagination.currentPage !== page && (
                <Button onClick={() => handlePageChange(pagination.currentPage)}>
                  Back to page {pagination.currentPage}
                </Button>
              )}
            </>
          }
        />
      )}

      {viewState === 'empty' && (
        <StatusMessage
          icon={<SearchOffIcon />}
          title={`Page ${page} has no breeds`}
          description="This page doesn't exist. Go back to the first page to see all breeds."
          actions={
            <Button variant="contained" onClick={() => handlePageChange(1)}>
              Go to first page
            </Button>
          }
        />
      )}

      {(viewState === 'ready' || viewState === 'loadingWithData' || viewState === 'errorWithData') && (
        <>
          {viewState === 'errorWithData' && errorContent && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRetry} disabled={isLoading}>
                  Retry
                </Button>
              }
            >
              <AlertTitle>{errorContent.title}</AlertTitle>
              {errorContent.description}
              {lastSuccessAt && ` Showing breeds loaded at ${formatTime(lastSuccessAt)}.`}
            </Alert>
          )}
          {pagination && (
            <BreedsSummary
              breedCount={breeds.length}
              pagination={pagination}
              lastSuccessAt={lastSuccessAt}
            />
          )}
          <BreedGrid breeds={breeds} isDimmed={viewState === 'loadingWithData'} />
        </>
      )}

      {/* Stays in place (disabled) while another page loads, so it does not jump */}
      {pagination && (
        <BreedsPagination
          page={page}
          pageCount={pagination.lastPage}
          disabled={isLoading}
          onPageChange={handlePageChange}
        />
      )}
    </Container>
  )
}
