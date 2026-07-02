import { useState } from 'react';
import { predict } from '../api';

// Form upload gambar — perilaku identik dengan implementasi awal, hanya dipindah ke komponen sendiri
function UploadPanel({ onResult, loading, setLoading }) {
  const [fileName, setFileName] = useState("Pilih atau Tarik Foto Wajah ke Sini");

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.fileInput;
    const file = fileInput.files[0];
    if (!file) return alert("Pilih file terlebih dahulu!");

    setLoading(true);
    onResult(null);

    try {
      const data = await predict(file, { source: 'upload', saveHistory: true });
      onResult(data);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan. Pastikan server Flask menyala.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card text-center">
      <h5 className="mb-4 fw-bold">Skrining Citra Wajah</h5>
      <form id="uploadForm" onSubmit={handleSubmit}>
        <div className="upload-area mb-4">
          <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
          <h6 id="fileNameDisplay" className={`fw-bold mb-1 ${fileName !== "Pilih atau Tarik Foto Wajah ke Sini" ? "text-primary" : ""}`}>
            {fileName}
          </h6>
          <p className="text-muted small mb-0">Mendukung format JPG, JPEG, atau PNG</p>
          <input className="file-input-hidden" type="file" id="fileInput" name="fileInput" accept="image/png, image/jpeg" onChange={handleFileChange} required />
        </div>

        <button type="submit" className="btn btn-custom w-100" disabled={loading}>Mulai Analisis</button>
      </form>

      <div id="loading" className="mt-4" style={{ display: loading ? 'block' : 'none' }}>
        <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 fw-medium text-info">Mengekstraksi fitur wajah & mendeteksi...</p>
      </div>
    </div>
  );
}

export default UploadPanel;
