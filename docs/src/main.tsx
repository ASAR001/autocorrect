import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import { routeTree } from './routeTree'
import { ThemeProvider } from './theme'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

render(
  () => (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  ),
  document.getElementById('root')!,
)
