import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h2 className="gradient-text">TaskManager</h2>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Projects</Link>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {user && (
          <span style={{ color: 'var(--text-secondary)' }}>
            {user.name} <span className={`badge ${user.role}`}>{user.role}</span>
          </span>
        )}
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
