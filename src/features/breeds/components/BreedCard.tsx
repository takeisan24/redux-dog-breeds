import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Breed } from '@/features/breeds/breedTypes'
import { BreedImage } from '@/features/breeds/components/BreedImage'
import { formatRange } from '@/utils/formatters'

interface BreedCardProps {
  breed: Breed
}

export function BreedCard({ breed }: BreedCardProps) {
  return (
    <Card
      component="article"
      variant="outlined"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <BreedImage photo={breed.photo} breedName={breed.name} />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Typography variant="h6" component="h2" gutterBottom>
            {breed.name}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {breed.groupName && <Chip size="small" label={breed.groupName} />}
            {/* Most breeds are not hypoallergenic: a "Not…" chip on almost every card is noise */}
            {breed.isHypoallergenic && (
              <Chip size="small" variant="outlined" color="success" label="Hypoallergenic" />
            )}
          </Stack>
        </Box>

        <Typography
          variant="body2"
          title={breed.description}
          sx={{
            color: 'text.secondary',
            // Show at most 3 lines so every card keeps a similar height
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {breed.description}
        </Typography>

        <Box
          component="dl"
          sx={{
            m: 0,
            mt: 'auto',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 2,
            rowGap: 0.5,
            '& dt': { color: 'text.secondary' },
            '& dd': { m: 0, fontWeight: 500 },
          }}
        >
          <BreedFact label="Life span" value={`${formatRange(breed.lifeSpan)} years`} />
          <BreedFact label="Male weight" value={`${formatRange(breed.maleWeight)} kg`} />
          <BreedFact label="Female weight" value={`${formatRange(breed.femaleWeight)} kg`} />
          {breed.originCountry && <BreedFact label="Origin" value={breed.originCountry} />}
        </Box>
      </CardContent>
    </Card>
  )
}

function BreedFact({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Typography component="dt" variant="body2">
        {label}
      </Typography>
      <Typography component="dd" variant="body2">
        {value}
      </Typography>
    </>
  )
}
