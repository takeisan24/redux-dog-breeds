import type { RootState } from '@/app/store'

export const selectBreeds = (state: RootState) => state.breeds.items
export const selectBreedsPagination = (state: RootState) => state.breeds.pagination
export const selectBreedsError = (state: RootState) => state.breeds.error
export const selectRequestedPage = (state: RootState) => state.breeds.requestedPage
export const selectLastSuccessAt = (state: RootState) => state.breeds.lastSuccessAt
export const selectIsBreedsLoading = (state: RootState) => state.breeds.status === 'loading'

/**
 * Every screen the breeds page can show, decided in one place.
 *
 * | viewState       | when                                     | UI                            |
 * |-----------------|------------------------------------------|-------------------------------|
 * | loadingNoData   | loading a page that is not on screen     | skeleton cards                |
 * | loadingWithData | reloading the page on screen             | old cards (dimmed) + progress |
 * | errorNoData     | failed, no data for the requested page   | full-page error + Retry       |
 * | errorWithData   | failed while reloading the shown page    | warning alert + old cards     |
 * | empty           | succeeded with 0 breeds (page too high)  | "no breeds" message           |
 * | ready           | succeeded                                | cards + pagination            |
 */
type BreedsViewState =
  | 'loadingNoData'
  | 'loadingWithData'
  | 'errorNoData'
  | 'errorWithData'
  | 'empty'
  | 'ready'

export function selectBreedsViewState(state: RootState): BreedsViewState {
  const { status, items, pagination, requestedPage } = state.breeds
  // Cards are only shown if they are the page the user asked for, otherwise the URL (?page=7)
  // and the cards (page 1) would disagree, e.g. while retrying a page that was never loaded.
  const hasRequestedPageData = items.length > 0 && pagination?.currentPage === requestedPage

  switch (status) {
    case 'idle':
    case 'loading':
      return hasRequestedPageData ? 'loadingWithData' : 'loadingNoData'
    case 'failed':
      return hasRequestedPageData ? 'errorWithData' : 'errorNoData'
    case 'succeeded':
      return items.length > 0 ? 'ready' : 'empty'
  }
}
