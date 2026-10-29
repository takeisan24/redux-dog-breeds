import Typography from '@mui/material/Typography'
import type { PaginationInfo } from '@/features/breeds/breedTypes'
import { formatTime } from '@/utils/formatters'

interface BreedsSummaryProps {
  breedCount: number
  pagination: PaginationInfo
  lastSuccessAt: number | null
}

/** "Showing 25–48 of 283 breeds · Updated 10:32 AM" */
export function BreedsSummary({ breedCount, pagination, lastSuccessAt }: BreedsSummaryProps) {
  const first = (pagination.currentPage - 1) * pagination.pageSize + 1
  const last = first + breedCount - 1

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
      Showing {first}–{last} of {pagination.totalRecords} breeds
      {lastSuccessAt && ` · Updated ${formatTime(lastSuccessAt)}`}
    </Typography>
  )
}
