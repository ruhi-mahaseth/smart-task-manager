import { useState, useEffect } from 'react';
import axios from 'axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'ADMIN';
  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProject({ name: '', description: '' });
      setIsCreating(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to create project. Ensure you are an Admin.');
    }
  };

  if (loading) return <div className="container">Loading projects...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Projects</h1>
        {isAdmin && !isCreating && (
          <button className="btn" onClick={() => setIsCreating(true)}>+ New Project</button>
        )}
      </div>

      {isCreating && (
        <div className="glass-panel" style={{ marginBottom: '32px' }}>
          <h3>Create New Project</h3>
          <form onSubmit={handleCreate} style={{ marginTop: '16px' }}>
            <div className="input-group">
              <label>Project Name</label>
              <input 
                type="text" 
                required 
                value={newProject.name} 
                onChange={e => setNewProject({...newProject, name: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                value={newProject.description} 
                onChange={e => setNewProject({...newProject, description: e.target.value})} 
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-cards">
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '8px' }}>{project.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px', flexGrow: 1 }}>
                {project.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {project.tasks?.length || 0} tasks
                </span>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
