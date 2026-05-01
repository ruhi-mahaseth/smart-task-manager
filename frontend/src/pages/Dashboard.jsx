import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from '../components/TaskForm.jsx';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchTasks()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  if (loading) return <div className="container">Loading dashboard...</div>;

  const progress = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const markTaskComplete = async (taskId) => {
    try {
      await axios.put(`${apiUrl}/api/tasks/${taskId}/status`, { status: 'DONE' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshAll();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, <span className="gradient-text">{user.name}</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Here is your project overview for today.</p>
        </div>
      </div>

      <TaskForm onTaskAdded={refreshAll} />

      <div className="tasks-section glass-panel" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Your tasks</h3>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No tasks yet. Add one to start tracking progress.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-row">
                <div>
                  <strong>{task.title}</strong>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {task.priority} · {task.status}
                  </div>
                </div>
                <div>
                  {task.status !== 'DONE' ? (
                    <button className="btn btn-secondary" onClick={() => markTaskComplete(task.id)}>
                      Mark done
                    </button>
                  ) : (
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
