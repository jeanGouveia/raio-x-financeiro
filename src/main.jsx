// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import Pricing from './components/Pricing.jsx'

const root = document.getElementById('root')

if (!root) {
  console.error('❌ Elemento #root não encontrado no DOM.')
} else {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter basename="/raio-x">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/precos" element={<Pricing />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  )
}
