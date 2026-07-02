import { resolveImageUrl } from '../api';
import { formatDateTime } from './HistoryTable';
import ValidationSection from './ValidationSection';

// Modal detail riwayat testing — custom overlay (tidak bergantung pada JS Bootstrap
// yang tidak dimuat di project ini), ditutup lewat tombol atau klik backdrop.
function HistoryDetailModal({ record, onClose, onValidated }) {
  if (!record) return null;

  const classesEntries = Object.entries(record.classes || {});
  const zonaEntries = Object.entries(record.zona || {});

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div className="custom-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="fw-bold mb-0">Detail Riwayat Testing</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <p className="small text-muted mb-1">Gambar Asli</p>
            <div className="result-img-container">
              <img className="result-img" src={resolveImageUrl(record.original_image)} alt="Gambar asli" />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <p className="small text-muted mb-1">Gambar Hasil Deteksi</p>
            <div className="result-img-container">
              <img className="result-img" src={resolveImageUrl(record.result_image)} alt="Gambar hasil deteksi" />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6 col-md-3 mb-2"><strong>ID:</strong> <span className="small">{record.id}</span></div>
          <div className="col-6 col-md-3 mb-2"><strong>Tanggal:</strong> {formatDateTime(record.timestamp)}</div>
          <div className="col-6 col-md-3 mb-2"><strong>Nama File:</strong> {record.filename}</div>
          <div className="col-6 col-md-3 mb-2"><strong>Sumber:</strong> <span className="text-capitalize">{record.source}</span></div>
          <div className="col-6 col-md-3 mb-2"><strong>Total Terdeteksi:</strong> {record.total}</div>
          <div className="col-6 col-md-3 mb-2"><strong>Confidence Rata-rata:</strong> {(record.avg_confidence * 100).toFixed(1)}%</div>
          <div className="col-6 col-md-3 mb-2"><strong>Status Analisis:</strong> {record.status}</div>
          <div className="col-6 col-md-3 mb-2"><strong>Waktu Inferensi:</strong> {record.inference_time_ms} ms</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <p className="fw-medium mb-1">Detail Kelas Terdeteksi</p>
            {classesEntries.length === 0 ? <p className="small text-muted">Tidak ada objek terdeteksi</p> : (
              <ul className="small mb-0">
                {classesEntries.map(([name, count]) => <li key={name}>{name}: {count}</li>)}
              </ul>
            )}
          </div>
          <div className="col-md-6 mb-2">
            <p className="fw-medium mb-1">Distribusi Zona Wajah</p>
            <ul className="small mb-0">
              {zonaEntries.map(([name, count]) => <li key={name}>{name}: {count}</li>)}
            </ul>
          </div>
        </div>

        <ValidationSection
          recordId={record.id}
          existingValidation={record.validation}
          onValidated={(validation) => onValidated(record.id, validation)}
        />
      </div>
    </div>
  );
}

export default HistoryDetailModal;
