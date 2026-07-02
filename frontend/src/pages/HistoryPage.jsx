import { useEffect, useMemo, useState } from 'react';
import { getHistory } from '../api';
import HistoryTable from '../components/HistoryTable';
import HistoryDetailModal from '../components/HistoryDetailModal';

// Halaman Riwayat Testing (route "/riwayat") — search, filter tanggal, sort terbaru/terlama, dan detail.
function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selected, setSelected] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) =>
        r.filename.toLowerCase().includes(q) || r.status.toLowerCase().includes(q)
      );
    }

    if (dateFilter) {
      result = result.filter((r) => r.timestamp.slice(0, 10) === dateFilter);
    }

    result.sort((a, b) => {
      const diff = new Date(a.timestamp) - new Date(b.timestamp);
      return sortOrder === 'newest' ? -diff : diff;
    });

    return result;
  }, [records, search, dateFilter, sortOrder]);

  const handleValidated = (recordId, validation) => {
    setRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, validation } : r)));
    setSelected((prev) => (prev && prev.id === recordId ? { ...prev, validation } : prev));
  };

  return (
    <div className="container mb-5">
      <div className="glass-card mb-4">
        <h5 className="fw-bold mb-4"><i className="fa-solid fa-clock-rotate-left me-2"></i>Riwayat Testing</h5>

        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <label className="form-label small">Cari (nama file / status)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Cari riwayat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Filter Tanggal</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Urutkan</label>
            <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn btn-outline-secondary w-100" onClick={fetchHistory} title="Muat ulang">
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted py-4">Memuat data riwayat...</p>
        ) : (
          <HistoryTable records={filteredRecords} onSelect={setSelected} />
        )}
      </div>

      <HistoryDetailModal record={selected} onClose={() => setSelected(null)} onValidated={handleValidated} />
    </div>
  );
}

export default HistoryPage;
