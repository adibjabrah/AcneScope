import { useState } from 'react';
import { submitValidation } from '../api';

// Section "Validasi Hasil" — muncul setelah hasil deteksi tampil.
// Dipakai di AnalysisPage (untuk hasil yang baru saja dianalisis) dan di HistoryDetailModal
// (untuk memvalidasi/lihat validasi record riwayat lama).
function ValidationSection({ recordId, existingValidation, onValidated }) {
  const [editing, setEditing] = useState(!existingValidation);
  const [status, setStatus] = useState(existingValidation?.validation_status || '');
  const [actualCount, setActualCount] = useState(existingValidation?.actual_count ?? '');
  const [falseNegative, setFalseNegative] = useState(existingValidation?.false_negative ?? '');
  const [falsePositive, setFalsePositive] = useState(existingValidation?.false_positive ?? '');
  const [notes, setNotes] = useState(existingValidation?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const needsDetailForm = status === 'Sebagian' || status === 'Tidak';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return alert('Pilih salah satu jawaban terlebih dahulu.');
    if (!recordId) return alert('Data hasil belum siap untuk divalidasi.');

    setSubmitting(true);
    try {
      const payload = {
        validation_status: status,
        actual_count: needsDetailForm ? Number(actualCount) || 0 : null,
        false_negative: needsDetailForm ? Number(falseNegative) || 0 : 0,
        false_positive: needsDetailForm ? Number(falsePositive) || 0 : 0,
        notes,
      };
      const updated = await submitValidation(recordId, payload);
      setEditing(false);
      onValidated?.(updated.validation);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan validasi. Pastikan server Flask menyala.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing && existingValidation) {
    return (
      <div className="glass-card mt-4">
        <h5 className="mb-3 fw-bold border-bottom pb-2"><i className="fa-solid fa-clipboard-check me-2"></i>Validasi Hasil</h5>
        <p className="mb-1"><strong>Status:</strong> {existingValidation.validation_status}</p>
        {existingValidation.validation_status !== 'Ya' && (
          <>
            <p className="mb-1"><strong>Jumlah sebenarnya:</strong> {existingValidation.actual_count}</p>
            <p className="mb-1"><strong>False Negative:</strong> {existingValidation.false_negative}</p>
            <p className="mb-1"><strong>False Positive:</strong> {existingValidation.false_positive}</p>
          </>
        )}
        {existingValidation.notes && <p className="mb-1"><strong>Catatan:</strong> {existingValidation.notes}</p>}
        <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setEditing(true)}>
          Ubah Validasi
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card mt-4">
      <h5 className="mb-3 fw-bold border-bottom pb-2"><i className="fa-solid fa-clipboard-check me-2"></i>Validasi Hasil</h5>
      <form onSubmit={handleSubmit}>
        <p className="fw-medium mb-2">Apakah hasil deteksi sudah benar?</p>
        <div className="d-flex gap-4 flex-wrap mb-3">
          {['Ya', 'Sebagian', 'Tidak'].map((opt) => (
            <div className="form-check" key={opt}>
              <input
                className="form-check-input"
                type="radio"
                name="validationStatus"
                id={`val-${opt}`}
                value={opt}
                checked={status === opt}
                onChange={(e) => setStatus(e.target.value)}
              />
              <label className="form-check-label" htmlFor={`val-${opt}`}>{opt}</label>
            </div>
          ))}
        </div>

        {needsDetailForm && (
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label small">Jumlah jerawat sebenarnya</label>
              <input type="number" min="0" className="form-control" value={actualCount} onChange={(e) => setActualCount(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Tidak terdeteksi (False Negative)</label>
              <input type="number" min="0" className="form-control" value={falseNegative} onChange={(e) => setFalseNegative(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Salah terdeteksi (False Positive)</label>
              <input type="number" min="0" className="form-control" value={falsePositive} onChange={(e) => setFalsePositive(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label small">Catatan Pengguna</label>
              <textarea className="form-control" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-custom" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Validasi'}
        </button>
      </form>
    </div>
  );
}

export default ValidationSection;
