import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import TechnicalAnalysis from './pages/TechnicalAnalysis'
import FundamentalAnalysis from './pages/FundamentalAnalysis'
import Screener from './pages/Screener'
import Comparison from './pages/Comparison'
import Watchlist from './pages/Watchlist'
import Alerts from './pages/Alerts'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock" element={<StockDetail />} />
          <Route path="/technical" element={<TechnicalAnalysis />} />
          <Route path="/fundamental" element={<FundamentalAnalysis />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
