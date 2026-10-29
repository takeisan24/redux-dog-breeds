import type { ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto'

type ColorMode = 'system' | 'light' | 'dark'

const NEXT_MODE: Record<ColorMode, ColorMode> = { system: 'light', light: 'dark', dark: 'system' }
const MODE_LABEL: Record<ColorMode, string> = { system: 'System', light: 'Light', dark: 'Dark' }
const MODE_ICON: Record<ColorMode, ReactNode> = {
  system: <BrightnessAutoIcon />,
  light: <LightModeIcon />,
  dark: <DarkModeIcon />,
}

/** Cycles the theme: System → Light → Dark. MUI saves the choice in localStorage. */
export function ColorModeToggle() {
  const { mode, setMode } = useColorScheme()

  if (!mode) return null // undefined until MUI has read the saved choice

  const label = `Theme: ${MODE_LABEL[mode]} (switch to ${MODE_LABEL[NEXT_MODE[mode]]})`

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" aria-label={label} onClick={() => setMode(NEXT_MODE[mode])}>
        {MODE_ICON[mode]}
      </IconButton>
    </Tooltip>
  )
}
