function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function validationBadge(validation) {
  if (!validation) return <span className="badge bg-secondary">Belum Divalidasi</span>;
  if (validation.validation_status === 'Ya') return <span className="badge bg-success">Benar</span>;
  return <span className="badge bg-danger">Salah</span>;
}

// Tabel Riwayat Testing — menerima data yang sudah difilter/diurutkan dari HistoryPage
function HistoryTable({ records, onSelect }) {
  if (records.length === 0) {
    return <p className="text-muted text-center py-4">Belum ada data riwayat testing.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle history-table">
        <thead>
          <tr>
            <th>Tanggal &amp; Waktu</th>
            <th>Nama File</th>
            <th>Sumber</th>
            <th>Total Terdeteksi</th>
            <th>Confidence</th>
            <th>Status Analisis</th>
            <th>Validasi</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{formatDateTime(r.timestamp)}</td>
              <td>{r.filename}</td>
              <td className="text-capitalize">{r.source}</td>
              <td>{r.total}</td>
              <td>{(r.avg_confidence * 100).toFixed(1)}%</td>
              <td>{r.status}</td>
              <td>{validationBadge(r.validation)}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onSelect(r)}>
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
export { formatDateTime };
