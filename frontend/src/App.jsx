import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Navbar from './components/Navbar';
import './index.css';

// Simple auth check
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </PrivateRoute>
        } />
        
        <Route path="/projects" element={
          <PrivateRoute>
            <>
              <Navbar />
              <Projects />
            </>
          </PrivateRoute>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;
