import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectIsBreedsLoading, selectRequestedPage } from '@/features/breeds/breedsSelectors'
import { fetchBreeds } from '@/features/breeds/breedsThunks'

/** Calls the API again for the current page, without reloading the browser tab. */
export function ReloadBreedsButton() {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectRequestedPage)
  const isLoading = useAppSelector(selectIsBreedsLoading)

  return (
    <Tooltip title="Reload breeds">
      {/* span: a Tooltip cannot listen to events on a disabled button */}
      <span>
        <IconButton
          color="inherit"
          aria-label="Reload breeds"
          disabled={isLoading}
          onClick={() => dispatch(fetchBreeds({ page }))}
        >
          <RefreshIcon />
        </IconButton>
      </span>
    </Tooltip>
  )
}
