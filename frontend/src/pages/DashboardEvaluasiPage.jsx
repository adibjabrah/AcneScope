import { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getStats } from '../api';
import StatsCards from '../components/StatsCards';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

const EMPTY_STATS = {
  total_percobaan: 0,
  prediksi_benar: 0,
  prediksi_salah: 0,
  fp_total: 0,
  fn_total: 0,
  akurasi_persen: 0,
  timeline: [],
};

// Halaman Dashboard Evaluasi (route "/evaluasi") — statistik testing dari seluruh Riwayat Testing.
function DashboardEvaluasiPage() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const pieData = {
    labels: ['Prediksi Benar', 'Prediksi Salah'],
    datasets: [{
      data: [stats.prediksi_benar, stats.prediksi_salah],
      backgroundColor: ['rgba(5, 150, 105, 0.8)', 'rgba(220, 38, 38, 0.8)'],
    }],
  };

  const barData = {
    labels: ['Prediksi Benar', 'Prediksi Salah', 'False Positive', 'False Negative'],
    datasets: [{
      label: 'Jumlah',
      data: [stats.prediksi_benar, stats.prediksi_salah, stats.fp_total, stats.fn_total],
      backgroundColor: 'rgba(14, 165, 233, 0.8)',
      borderRadius: 6,
    }],
  };

  const lineData = {
    labels: stats.timeline.map((t) => new Date(t.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })),
    datasets: [{
      label: 'Total Jerawat Terdeteksi per Percobaan',
      data: stats.timeline.map((t) => t.total),
      borderColor: 'rgba(14, 165, 233, 1)',
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      tension: 0.3,
      fill: true,
    }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  return (
    <div className="container mb-5">
      <div className="glass-card mb-4">
        <h5 className="fw-bold mb-4"><i className="fa-solid fa-chart-line me-2"></i>Dashboard Evaluasi</h5>

        {loading ? (
          <p className="text-center text-muted py-4">Memuat statistik...</p>
        ) : (
          <>
            <StatsCards stats={stats} />

            <div className="row g-4">
              <div className="col-lg-4">
                <p className="fw-medium text-center mb-2">Perbandingan Prediksi Benar vs Salah</p>
                <div style={{ height: '260px' }}>
                  <Pie data={pieData} options={chartOptions} />
                </div>
              </div>
              <div className="col-lg-4">
                <p className="fw-medium text-center mb-2">Ringkasan Evaluasi</p>
                <div style={{ height: '260px' }}>
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>
              <div className="col-lg-4">
                <p className="fw-medium text-center mb-2">Tren Riwayat Testing</p>
                <div style={{ height: '260px' }}>
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardEvaluasiPage;
