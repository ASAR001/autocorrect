import { Outlet } from '@tanstack/solid-router'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div class="flex min-h-screen">
      <Sidebar />
      <main class="flex-1 overflow-auto px-8 py-6 lg:px-12 lg:py-10">
        <div class="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
