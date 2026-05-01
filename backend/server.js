require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to verify Admin Role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'MEMBER' }
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- PROJECT ROUTES ---
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ include: { tasks: true } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: { name, description, userId: req.user.id }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// --- TASK ROUTES ---
app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, dueDate, projectId, assigneeId, priority } = req.body;
  try {
    const assignedId = assigneeId !== undefined && assigneeId !== null ? assigneeId : req.user.id;
    console.log('Task route req.user:', req.user, 'assignedId:', assignedId, 'raw assigneeId:', assigneeId);
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'Low',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId ?? null,
        assigneeId: assignedId,
      }
    });
    console.log('Created task', { id: task.id, assigneeId: task.assigneeId, title: task.title });
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const tasks = await prisma.task.findMany({
      where: role === 'ADMIN' ? {} : { assigneeId: userId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Legacy compatibility route for simple client code that posts to /tasks
app.post('/tasks', authenticateToken, async (req, res) => {
  const { title, description, dueDate, projectId, assigneeId } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Legacy task creation error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'TODO', 'IN_PROGRESS', 'DONE'
  
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(task);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let stats;
    if (role === 'ADMIN') {
      const totalTasks = await prisma.task.count();
      const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });
      stats = { totalTasks, completedTasks };
    } else {
      const totalTasks = await prisma.task.count({ where: { assigneeId: userId } });
      const completedTasks = await prisma.task.count({ where: { assigneeId: userId, status: 'DONE' } });
      stats = { totalTasks, completedTasks };
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
