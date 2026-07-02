import { NavLink } from 'react-router-dom';

// Header brand dipertahankan identik dengan sebelumnya, hanya menambahkan navigasi di bawahnya
function Navbar() {
  return (
    <header className="custom-header">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div>
          <h1 className="brand-title"><i className="fa-solid fa-microscope me-2"></i>AcneScope</h1>
          <span className="brand-subtitle">Smart Decision Support System</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-house me-1"></i>Beranda
          </NavLink>
          <NavLink to="/riwayat" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-clock-rotate-left me-1"></i>Riwayat Testing
          </NavLink>
          <NavLink to="/evaluasi" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-chart-line me-1"></i>Dashboard Evaluasi
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
