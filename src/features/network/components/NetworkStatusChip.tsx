import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import { useAppSelector } from '@/app/hooks'
import { selectIsOnline } from '@/features/network/networkSlice'

/** Shown only while offline: when everything works, a status chip is just noise. */
export function NetworkStatusChip() {
  const isOnline = useAppSelector(selectIsOnline)

  return (
    // The role="status" box stays mounted and only its content changes, so screen readers
    // announce "Offline" when the chip appears
    <Box role="status" sx={{ display: 'flex' }}>
      {!isOnline && <Chip size="small" color="warning" icon={<WifiOffIcon />} label="Offline" />}
    </Box>
  )
}
