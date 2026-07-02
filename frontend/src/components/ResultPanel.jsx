import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getStatusStyle(status) {
  if (status === "AMAN") return { color: "#059669", backgroundColor: "#d1fae5" };
  if (status === "PERLU PERHATIAN") return { color: "#d97706", backgroundColor: "#fef3c7" };
  return { color: "#dc2626", backgroundColor: "#fee2e2" };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, color: '#64748b' },
      grid: { color: '#f1f5f9', drawBorder: false }
    },
    x: {
      ticks: { color: '#64748b', font: { family: "'Poppins', sans-serif" } },
      grid: { display: false }
    }
  }
};

// Menampilkan visualisasi hasil deteksi (gambar, metrik, saran, chart zona)
// Dipakai bersama oleh tab Upload, Camera, dan Video
function ResultPanel({ result }) {
  if (!result) return null;

  const chartData = {
    labels: Object.keys(result.zona),
    datasets: [{
      label: 'Jumlah Terdeteksi',
      data: Object.values(result.zona),
      backgroundColor: 'rgba(20, 184, 166, 0.8)',
      hoverBackgroundColor: 'rgba(14, 165, 233, 0.9)',
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  return (
    <div id="resultArea" className="row justify-content-center">
      <div className="col-lg-5 mb-4">
        <div className="glass-card h-100">
          <h5 className="mb-4 fw-bold border-bottom pb-2"><i className="fa-regular fa-image me-2"></i>Visualisasi Deteksi</h5>
          <div className="result-img-container">
            <img id="outputImage" className="result-img" src={`data:image/jpeg;base64,${result.image}`} alt="Hasil Deteksi Model" />
          </div>
        </div>
      </div>

      <div className="col-lg-7 mb-4">
        <div className="glass-card h-100">
          <h5 className="mb-4 fw-bold border-bottom pb-2"><i className="fa-solid fa-chart-pie me-2"></i>Hasil Analisis Kulit</h5>

          <div className="row mb-4">
            <div className="col-6">
              <div className="metric-box">
                <p className="metric-label">Total Jerawat Terdeteksi</p>
                <h3 id="resTotal" className="metric-value">{result.total}</h3>
              </div>
            </div>
            <div className="col-6">
              <div className="metric-box">
                <p className="metric-label">Status Keparahan</p>
                <h3 id="resStatus" className="metric-value fs-5 mt-2 px-2 py-1 rounded" style={getStatusStyle(result.status)}>
                  {result.status}
                </h3>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-6">
              <div className="metric-box">
                <p className="metric-label">Confidence Rata-rata</p>
                <h3 className="metric-value fs-5">{(result.avg_confidence * 100).toFixed(1)}%</h3>
              </div>
            </div>
            <div className="col-6">
              <div className="metric-box">
                <p className="metric-label">Waktu Inferensi</p>
                <h3 className="metric-value fs-5">{result.inference_time_ms} ms</h3>
              </div>
            </div>
          </div>

          <div className="alert alert-info rounded-3 mb-4" style={{ backgroundColor: '#f0f9ff', borderLeft: '5px solid var(--primary-color)', borderRight: 'none', borderTop: 'none', borderBottom: 'none' }}>
            <h6 className="fw-bold mb-1"><i className="fa-solid fa-user-doctor me-2"></i>Saran Penanganan:</h6>
            <span id="resSaran" className="small">{result.saran}</span>
          </div>

          <h6 className="fw-bold mb-3 text-center">Distribusi Jerawat Berdasarkan Zona Wajah</h6>
          <div style={{ height: '220px', width: '100%' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;
