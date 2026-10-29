import Chip from '@mui/material/Chip'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import { useAppSelector } from '@/app/hooks'
import { selectIsOnline } from '@/features/network/networkSlice'

export function NetworkStatusChip() {
  const isOnline = useAppSelector(selectIsOnline)

  return (
    // One element updated in place + role="status", so screen readers announce the change
    <Chip
      role="status"
      size="small"
      variant={isOnline ? 'outlined' : 'filled'}
      color={isOnline ? 'success' : 'warning'}
      icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
      label={isOnline ? 'Online' : 'Offline'}
    />
  )
}
