import React, { useEffect, useState } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Prompts from './pages/prompts'
import Login from './pages/login'
import Register from './pages/register'

const queryClient = new QueryClient()

function Nav() {
  const onNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="bg-base-200 p-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" onClick={e => onNavigate(e, '/')} className="font-semibold">Studio Lite</a>
          <a href="/" onClick={e => onNavigate(e, '/')} className="text-sm text-gray-600">Prompts</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" onClick={e => onNavigate(e, '/login')} className="link">Login</a>
          <a href="/register" onClick={e => onNavigate(e, '/register')} className="link">Register</a>
        </div>
      </div>
    </div>
  )
}

function Router() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  if (path === '/login') return <Login />
  if (path === '/register') return <Register />
  return <Prompts />
}

function App(){
  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      <Router />
    </QueryClientProvider>
  )
}

const el = document.getElementById('root')!
createRoot(el).render(<App />)
