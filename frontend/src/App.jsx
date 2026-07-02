import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import DashboardEvaluasiPage from './pages/DashboardEvaluasiPage';
import './App.css';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<AnalysisPage />} />
        <Route path="/riwayat" element={<HistoryPage />} />
        <Route path="/evaluasi" element={<DashboardEvaluasiPage />} />
      </Routes>

      <footer className="custom-footer text-center">
        <div className="container">
          <p className="mb-1 fw-medium">Sistem Informasi Deteksi Jerawat Berbasis Deep Learning (YOLOv8)</p>
        </div>
      </footer>
    </>
  );
}

export default App;
