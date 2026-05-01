import { useState } from 'react';

function TaskForm({ onTaskAdded }) {
  const [taskName, setTaskName] = useState('');
  const [taskLevel, setTaskLevel] = useState('Low');
  const [feedback, setFeedback] = useState('');

  const submitTask = async (event) => {
    event.preventDefault();
    setFeedback('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    const payload = {
      title: taskName,
      priority: taskLevel,
    };

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFeedback(errorData.error || 'Unable to save task');
      } else {
        setFeedback('Task added successfully');
        setTaskName('');
        setTaskLevel('Low');
        if (onTaskAdded) onTaskAdded();
      }
    } catch (err) {
      setFeedback('Unable to save task');
      console.error('Unable to save task:', err);
    }
  };

  return (
    <section className="task-form-panel">
      <h2>Create a new task</h2>
      <form onSubmit={submitTask} className="task-form">
        <label>
          Task name
          <input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </label>

        <label>
          Priority
          <select value={taskLevel} onChange={(e) => setTaskLevel(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <button type="submit">Add Task</button>
        {feedback && <p className="form-feedback">{feedback}</p>}
      </form>
    </section>
  );
}

export default TaskForm;
