import Typography from '@mui/material/Typography'
import type { PaginationInfo } from '@/features/breeds/breedTypes'

interface BreedsSummaryProps {
  breedCount: number
  pagination: PaginationInfo
}

/** "Showing 25–48 of 283 breeds" */
export function BreedsSummary({ breedCount, pagination }: BreedsSummaryProps) {
  const first = (pagination.currentPage - 1) * pagination.pageSize + 1
  const last = first + breedCount - 1

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
      Showing {first}–{last} of {pagination.totalRecords} breeds
    </Typography>
  )
}
