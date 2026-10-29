import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

interface BreedsPaginationProps {
  page: number
  pageCount: number
  disabled: boolean
  onPageChange: (page: number) => void
}

export function BreedsPagination({ page, pageCount, disabled, onPageChange }: BreedsPaginationProps) {
  // Fewer, smaller buttons on phones so the pagination fits in one row
  const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <Stack sx={{ alignItems: 'center', mt: 4 }}>
      <Pagination
        page={page}
        count={pageCount}
        disabled={disabled}
        onChange={(_event, nextPage) => onPageChange(nextPage)}
        color="primary"
        size={isPhone ? 'small' : 'medium'}
        siblingCount={isPhone ? 0 : 1}
      />
    </Stack>
  )
}
