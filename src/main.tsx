import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
// Roboto is bundled with the app (not loaded from Google Fonts), so it still works offline
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { App } from '@/App'
import { store } from '@/app/store'
import { theme } from '@/app/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Makes the Redux store available to every component (useSelector / useDispatch) */}
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
