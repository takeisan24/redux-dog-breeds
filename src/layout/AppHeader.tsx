import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import PetsIcon from '@mui/icons-material/Pets'
import { useAppSelector } from '@/app/hooks'
import { ColorModeToggle } from '@/components/ColorModeToggle'
import { selectIsBreedsLoading } from '@/features/breeds/breedsSelectors'
import { ReloadBreedsButton } from '@/features/breeds/components/ReloadBreedsButton'
import { NetworkStatusChip } from '@/features/network/components/NetworkStatusChip'

export function AppHeader() {
  const isLoading = useAppSelector(selectIsBreedsLoading)

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      {/* Same max width as the page content, so the header lines up with the cards */}
      <Toolbar component={Container} maxWidth="lg">
        <PetsIcon sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
          Dog Breeds
        </Typography>
        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ alignItems: 'center' }}>
          <NetworkStatusChip />
          <ReloadBreedsButton />
          <ColorModeToggle />
        </Stack>
      </Toolbar>
      {isLoading && (
        <LinearProgress
          aria-label="Loading breeds"
          sx={{ position: 'absolute', insetInline: 0, bottom: 0 }}
        />
      )}
    </AppBar>
  )
}
