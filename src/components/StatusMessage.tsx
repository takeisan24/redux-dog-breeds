import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface StatusMessageProps {
  icon: ReactNode
  title: string
  description: string
  /** Buttons shown under the text, e.g. "Try again". */
  actions?: ReactNode
  role?: 'alert' | 'status'
}

/** Centered full-width message, used for the error and empty states. */
export function StatusMessage({ icon, title, description, actions, role = 'status' }: StatusMessageProps) {
  return (
    <Stack
      role={role}
      spacing={2}
      sx={{ alignItems: 'center', textAlign: 'center', py: { xs: 6, sm: 10 }, px: 2 }}
    >
      <Stack sx={{ color: 'text.secondary', '& svg': { fontSize: 56 } }}>{icon}</Stack>
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      <Typography sx={{ color: 'text.secondary', maxWidth: 480 }}>{description}</Typography>
      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  )
}
