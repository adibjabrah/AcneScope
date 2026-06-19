import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("Pilih atau Tarik Foto Wajah ke Sini");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file terlebih dahulu!");

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);

      setTimeout(() => {
        window.scrollTo({ top: document.getElementById('resultArea').offsetTop - 50, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan. Pastikan server Flask menyala.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "AMAN") return { color: "#059669", backgroundColor: "#d1fae5" };
    if (status === "PERLU PERHATIAN") return { color: "#d97706", backgroundColor: "#fef3c7" };
    return { color: "#dc2626", backgroundColor: "#fee2e2" };
  };

  const chartData = {
    labels: result ? Object.keys(result.zona) : [],
    datasets: [{
      label: 'Jumlah Terdeteksi',
      data: result ? Object.values(result.zona) : [],
      backgroundColor: 'rgba(20, 184, 166, 0.8)',
      hoverBackgroundColor: 'rgba(14, 165, 233, 0.9)',
      borderRadius: 6,
      borderSkipped: false
    }]
  };

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

  return (
    <>
      <header className="custom-header">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h1 className="brand-title"><i className="fa-solid fa-microscope me-2"></i>AcneScope</h1>
            <span className="brand-subtitle">Smart Decision Support System</span>
          </div>
        </div>
      </header>

      <div className="container mb-5">
        
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 col-md-8">
            <div className="glass-card text-center">
              <h5 className="mb-4 fw-bold">Skrining Citra Wajah</h5>
              <form id="uploadForm" onSubmit={handleSubmit}>
                <div className="upload-area mb-4">
                  <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                  <h6 id="fileNameDisplay" className={`fw-bold mb-1 ${fileName !== "Pilih atau Tarik Foto" ? "text-primary" : ""}`}>
                    {fileName}
                  </h6>
                  <p className="text-muted small mb-0">Mendukung format JPG, JPEG, atau PNG</p>
                  <input className="file-input-hidden" type="file" id="fileInput" accept="image/png, image/jpeg" onChange={handleFileChange} required />
                </div>
                
                {/* Tombol Mulai Analisis 100% Statis (Seperti index.html) */}
                <button type="submit" className="btn btn-custom w-100">Mulai Analisis</button>
              </form>

              {/* Loading Animasi terpisah di bawah tombol */}
              <div id="loading" className="mt-4" style={{ display: loading ? 'block' : 'none' }}>
                <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <p className="mt-3 fw-medium text-info">Mengekstraksi fitur wajah & mendeteksi...</p>
              </div>
            </div>
          </div>
        </div>

        <div id="resultArea" className="row justify-content-center" style={{ display: result ? 'flex' : 'none' }}>
          
          <div className="col-lg-5 mb-4">
            <div className="glass-card h-100">
              <h5 className="mb-4 fw-bold border-bottom pb-2"><i className="fa-regular fa-image me-2"></i>Visualisasi Deteksi</h5>
              <div className="result-img-container">
                <img id="outputImage" className="result-img" src={result ? `data:image/jpeg;base64,${result.image}` : ""} alt="Hasil Deteksi Model" />
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
                    <h3 id="resTotal" className="metric-value">{result ? result.total : 0}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="metric-box">
                    <p className="metric-label">Status Keparahan</p>
                    <h3 id="resStatus" className="metric-value fs-5 mt-2 px-2 py-1 rounded" style={result ? getStatusStyle(result.status) : {}}>
                      {result ? result.status : "Aman"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="alert alert-info rounded-3 mb-4" style={{ backgroundColor: '#f0f9ff', borderLeft: '5px solid var(--primary-color)', borderRight: 'none', borderTop: 'none', borderBottom: 'none' }}>
                <h6 className="fw-bold mb-1"><i className="fa-solid fa-user-doctor me-2"></i>Saran Penanganan:</h6>
                <span id="resSaran" className="small">{result ? result.saran : ""}</span>
              </div>

              <h6 className="fw-bold mb-3 text-center">Distribusi Jerawat Berdasarkan Zona Wajah</h6>
              <div style={{ height: '220px', width: '100%' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="custom-footer text-center">
        <div className="container">
          <p className="mb-1 fw-medium">Sistem Informasi Deteksi Jerawat Berbasis Deep Learning (YOLOv8)</p>
        </div>
      </footer>
    </>
  );
}

export default App;