import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="container">Loading dashboard...</div>;

  const progress = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '8px' }}>Welcome back, <span className="gradient-text">{user.name}</span></h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Here is your project overview for today.</p>

      <div className="grid-cards">
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Total Tasks</h3>
          <h1 style={{ fontSize: '3rem', margin: 0 }} className="gradient-text">{stats.totalTasks}</h1>
        </div>
        
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Completed</h3>
          <h1 style={{ fontSize: '3rem', margin: 0, color: 'var(--success)' }}>{stats.completedTasks}</h1>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Completion Rate</h3>
          <div style={{ background: 'rgba(0,0,0,0.3)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: 'var(--primary-color)', height: '100%', transition: 'width 1s ease' }}></div>
          </div>
          <p style={{ textAlign: 'right', marginTop: '8px', fontWeight: 'bold' }}>{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
