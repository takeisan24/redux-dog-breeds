import { createTheme } from '@mui/material/styles'

/**
 * Light + dark color schemes. MUI picks the one matching the OS by default and
 * remembers the user's choice from the ColorModeToggle.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#8d5524' },
        background: { default: '#faf7f2' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#e0a96d' },
      },
    },
  },
  shape: { borderRadius: 12 },
  // Sentence-case buttons ("Try again", not "TRY AGAIN") read calmer and less like the MUI default
  typography: { button: { textTransform: 'none', fontWeight: 600 } },
})
