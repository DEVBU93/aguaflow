import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import NewAnalysisPage from './pages/NewAnalysisPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-6">
          <h1 className="text-xl font-bold text-blue-400">🌊 AguaFlow</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</a>
          <a href="/analysis/new" className="text-sm text-slate-400 hover:text-white transition-colors">Nuevo Análisis</a>
        </nav>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analysis/new" element={<NewAnalysisPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
