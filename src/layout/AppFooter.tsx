import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

export function AppFooter() {
  return (
    <Typography
      component="footer"
      variant="body2"
      sx={{ color: 'text.secondary', textAlign: 'center', pb: 4 }}
    >
      Data from{' '}
      <Link href="https://dogapi.dog" target="_blank" rel="noopener noreferrer">
        Dog API by kinduff
      </Link>
    </Typography>
  )
}
