import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">
        <h1>TaskManager</h1>
        <p>Track priorities, projects, and progress</p>
      </div>

      <nav className="nav-links">
        {token ? (
          <>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/projects">Projects</NavLink>
          </>
        ) : null}
      </nav>

      <div className="nav-actions">
        {token ? (
          <>
            <span className="nav-user">Hi, {user.name || 'Member'}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </header>
  );
}

export default Navbar;
