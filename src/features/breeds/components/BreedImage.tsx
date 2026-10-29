import { useState } from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import PetsIcon from '@mui/icons-material/Pets'
import type { BreedPhoto } from '@/features/breeds/breedTypes'

interface BreedImageProps {
  photo: BreedPhoto | null
  breedName: string
}

const imageFrameSx = { aspectRatio: '4 / 3', width: '100%' } as const

/** Breed photo with the author credit. Shows a placeholder if there is no photo or it fails to load (e.g. offline). */
export function BreedImage({ photo, breedName }: BreedImageProps) {
  // Photos are loaded by the browser (<img>), not through Redux, so a photo that failed while
  // offline would stay a placeholder forever. Remember WHICH photo object failed: every successful
  // API load (Retry / Reload) creates new photo objects, so the photo is tried again after it.
  const [failedPhoto, setFailedPhoto] = useState<BreedPhoto | null>(null)
  const hasError = photo !== null && failedPhoto === photo
  // The credit waits for the photo: a credit over an empty frame looks broken
  const [loadedPhoto, setLoadedPhoto] = useState<BreedPhoto | null>(null)
  const isLoaded = photo !== null && loadedPhoto === photo

  if (!photo || hasError) {
    return (
      <Box
        role="img"
        aria-label={`No photo available for ${breedName}`}
        sx={{
          ...imageFrameSx,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          color: 'text.disabled',
        }}
      >
        <PetsIcon sx={{ fontSize: 48 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="img"
        src={photo.url}
        alt={`${breedName} dog`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoadedPhoto(photo)}
        onError={() => setFailedPhoto(photo)}
        sx={{ ...imageFrameSx, display: 'block', objectFit: 'cover', bgcolor: 'action.hover' }}
      />
      {isLoaded && photo.author && (
        <Typography
          variant="caption"
          noWrap
          sx={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            px: 1,
            py: 0.25,
            color: 'common.white',
            bgcolor: 'rgba(0, 0, 0, 0.55)',
          }}
        >
          Photo:{' '}
          {photo.sourceUrl ? (
            <Link href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" color="inherit">
              {photo.author}
            </Link>
          ) : (
            photo.author
          )}
          {photo.license && ` · ${photo.license}`}
        </Typography>
      )}
    </Box>
  )
}
