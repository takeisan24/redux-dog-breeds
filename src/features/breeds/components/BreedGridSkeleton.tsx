import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import { BREED_GRID_ITEM_SIZE, BREED_GRID_SPACING } from '@/features/breeds/components/breedGridLayout'

/** Placeholder cards with the same layout as BreedGrid, shown during the first load. */
export function BreedGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Grid container spacing={BREED_GRID_SPACING} role="status" aria-label="Loading breeds" aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <Grid key={index} size={BREED_GRID_ITEM_SIZE}>
          <Card variant="outlined">
            <Skeleton variant="rectangular" sx={{ height: 'auto', aspectRatio: '4 / 3' }} />
            <CardContent>
              <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '60%' }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" sx={{ width: '80%' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
