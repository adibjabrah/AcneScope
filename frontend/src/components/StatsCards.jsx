const CARD_CONFIG = [
  { key: 'total_percobaan', label: 'Total Percobaan', icon: 'fa-solid fa-flask' },
  { key: 'prediksi_benar', label: 'Prediksi Benar', icon: 'fa-solid fa-circle-check' },
  { key: 'prediksi_salah', label: 'Prediksi Salah', icon: 'fa-solid fa-circle-xmark' },
  { key: 'fp_total', label: 'False Positive Total', icon: 'fa-solid fa-triangle-exclamation' },
  { key: 'fn_total', label: 'False Negative Total', icon: 'fa-solid fa-circle-exclamation' },
  { key: 'akurasi_persen', label: 'Persentase Keberhasilan', icon: 'fa-solid fa-percent', suffix: '%' },
];

// Card ringkasan statistik di Dashboard Evaluasi
function StatsCards({ stats }) {
  return (
    <div className="row g-3 mb-4">
      {CARD_CONFIG.map((cfg) => (
        <div className="col-6 col-md-4 col-lg-2" key={cfg.key}>
          <div className="metric-box h-100">
            <i className={`${cfg.icon} mb-2`} style={{ color: 'var(--primary-color)' }}></i>
            <p className="metric-label">{cfg.label}</p>
            <h3 className="metric-value fs-4">{stats[cfg.key]}{cfg.suffix || ''}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
