import { useRef, useState, useEffect } from 'react';
import { predict } from '../api';

// Tab Camera: buka webcam, ambil satu gambar, lalu analisis seperti alur Upload.
// Hasil otomatis tersimpan ke Riwayat Testing (save_history=true, sama seperti Upload).
function CameraCapture({ onResult, loading, setLoading }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
    } catch (err) {
      console.error(err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const captureAndAnalyze = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setLoading(true);
      onResult(null);
      try {
        const data = await predict(blob, { source: 'camera', saveHistory: true });
        onResult(data);
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan. Pastikan server Flask menyala.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="glass-card text-center">
      <h5 className="mb-4 fw-bold">Ambil Gambar dari Kamera</h5>

      {error && <div className="alert alert-danger small">{error}</div>}

      <div className="camera-preview mb-3">
        <video ref={videoRef} autoPlay playsInline muted className={active ? 'd-block' : 'd-none'} />
        {!active && (
          <div className="camera-placeholder">
            <i className="fa-solid fa-camera fa-2x mb-2"></i>
            <p className="small mb-0">Kamera belum aktif</p>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="d-none" />

      <div className="d-flex gap-2 justify-content-center flex-wrap">
        {!active ? (
          <button className="btn btn-custom" onClick={startCamera}>
            <i className="fa-solid fa-video me-2"></i>Buka Kamera
          </button>
        ) : (
          <>
            <button className="btn btn-custom" onClick={captureAndAnalyze} disabled={loading}>
              <i className="fa-solid fa-camera me-2"></i>Ambil Gambar &amp; Analisis
            </button>
            <button className="btn btn-outline-secondary" onClick={stopCamera}>
              <i className="fa-solid fa-stop me-2"></i>Tutup Kamera
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="mt-4">
          <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 fw-medium text-info">Mengekstraksi fitur wajah &amp; mendeteksi...</p>
        </div>
      )}
    </div>
  );
}

export default CameraCapture;
