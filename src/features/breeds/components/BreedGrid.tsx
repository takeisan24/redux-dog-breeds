import Grid from '@mui/material/Grid'
import type { Breed } from '@/features/breeds/breedTypes'
import { BreedCard } from '@/features/breeds/components/BreedCard'
import { BREED_GRID_ITEM_SIZE, BREED_GRID_SPACING } from '@/features/breeds/components/breedGridLayout'

interface BreedGridProps {
  breeds: Breed[]
  /** Fades the cards while a new page is loading. */
  isDimmed?: boolean
}

export function BreedGrid({ breeds, isDimmed = false }: BreedGridProps) {
  return (
    <Grid
      container
      spacing={BREED_GRID_SPACING}
      aria-busy={isDimmed}
      sx={{ opacity: isDimmed ? 0.5 : 1, transition: 'opacity 0.2s' }}
    >
      {breeds.map((breed) => (
        <Grid key={breed.id} size={BREED_GRID_ITEM_SIZE}>
          <BreedCard breed={breed} />
        </Grid>
      ))}
    </Grid>
  )
}
