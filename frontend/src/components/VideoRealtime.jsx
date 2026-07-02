import { useRef, useState, useEffect } from 'react';
import { predict } from '../api';

const INFERENCE_INTERVAL_MS = 1500;

// Tab Video: stream kamera live + inferensi berkala (tanpa mengubah model/API inferensi,
// hanya memanggil /predict secara berulang dengan save_history=false agar riwayat tidak
// membanjir tiap frame). User menekan "Simpan ke Riwayat" untuk menyimpan frame terpilih.
function VideoRealtime({ onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const lastBlobRef = useRef(null);
  const busyRef = useRef(false);

  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [saving, setSaving] = useState(false);
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

  const stopAll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setRunning(false);
    setActive(false);
    setLiveResult(null);
  };

  useEffect(() => () => stopAll(), []);

  const captureFrame = () =>
    new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0) return resolve(null);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });

  const inferenceTick = async () => {
    if (busyRef.current) return; // hindari tumpukan request jika inferensi sebelumnya belum selesai
    const blob = await captureFrame();
    if (!blob) return;
    busyRef.current = true;
    lastBlobRef.current = blob;
    try {
      const data = await predict(blob, { source: 'video', saveHistory: false });
      setLiveResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      busyRef.current = false;
    }
  };

  const toggleRealtime = () => {
    if (running) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(inferenceTick, INFERENCE_INTERVAL_MS);
      inferenceTick();
    }
  };

  const saveToHistory = async () => {
    if (!lastBlobRef.current) return;
    setSaving(true);
    try {
      const data = await predict(lastBlobRef.current, { source: 'video', saveHistory: true });
      onResult(data);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan ke riwayat. Pastikan server Flask menyala.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card text-center">
      <h5 className="mb-4 fw-bold">Realtime Video Detection</h5>

      {error && <div className="alert alert-danger small">{error}</div>}

      <div className="row">
        <div className="col-md-6 mb-3">
          <p className="small text-muted mb-1">Live Camera</p>
          <div className="camera-preview">
            <video ref={videoRef} autoPlay playsInline muted className={active ? 'd-block' : 'd-none'} />
            {!active && (
              <div className="camera-placeholder">
                <i className="fa-solid fa-video fa-2x mb-2"></i>
                <p className="small mb-0">Kamera belum aktif</p>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <p className="small text-muted mb-1">Live Deteksi {running && <span className="badge bg-danger ms-1">LIVE</span>}</p>
          <div className="camera-preview">
            {liveResult ? (
              <img className="result-img" src={`data:image/jpeg;base64,${liveResult.image}`} alt="Live deteksi" />
            ) : (
              <div className="camera-placeholder">
                <i className="fa-solid fa-bullseye fa-2x mb-2"></i>
                <p className="small mb-0">Belum ada inferensi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {liveResult && (
        <div className="row mb-3 justify-content-center">
          <div className="col-6 col-md-3">
            <div className="metric-box">
              <p className="metric-label">Total</p>
              <h3 className="metric-value fs-5">{liveResult.total}</h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="metric-box">
              <p className="metric-label">Status</p>
              <h3 className="metric-value fs-6">{liveResult.status}</h3>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="d-none" />

      <div className="d-flex gap-2 justify-content-center flex-wrap">
        {!active ? (
          <button className="btn btn-custom" onClick={startCamera}>
            <i className="fa-solid fa-video me-2"></i>Buka Kamera
          </button>
        ) : (
          <>
            <button className="btn btn-custom" onClick={toggleRealtime}>
              <i className={`fa-solid ${running ? 'fa-pause' : 'fa-play'} me-2`}></i>
              {running ? 'Hentikan Realtime' : 'Mulai Realtime'}
            </button>
            <button className="btn btn-outline-primary" onClick={saveToHistory} disabled={!liveResult || saving}>
              <i className="fa-solid fa-floppy-disk me-2"></i>
              {saving ? 'Menyimpan...' : 'Simpan ke Riwayat'}
            </button>
            <button className="btn btn-outline-secondary" onClick={stopAll}>
              <i className="fa-solid fa-stop me-2"></i>Tutup Kamera
            </button>
          </>
        )}
      </div>
      <p className="small text-muted mt-3 mb-0">
        Mode realtime menjalankan inferensi tiap {INFERENCE_INTERVAL_MS / 1000} detik untuk pratinjau live.
        Hasil tidak otomatis tersimpan — gunakan tombol "Simpan ke Riwayat" untuk menyimpan frame yang dipilih.
      </p>
    </div>
  );
}

export default VideoRealtime;
