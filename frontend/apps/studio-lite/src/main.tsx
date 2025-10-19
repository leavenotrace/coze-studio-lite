import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Prompts from './pages/prompts'

const queryClient = new QueryClient()

function App(){
  return (
    <QueryClientProvider client={queryClient}>
      <Prompts />
    </QueryClientProvider>
  )
}

const el = document.getElementById('root')!
createRoot(el).render(<App />)
