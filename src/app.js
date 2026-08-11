/**
 * Task Tracker API
 * -----------------
 * A small Express service for managing a team's tasks.
 *
 * Endpoints:
 *   POST   /tasks                -> create a task
 *   GET    /tasks                -> list tasks (supports ?status=pending|done)
 *   GET    /tasks/:id            -> fetch a single task
 *   PUT    /tasks/:id            -> update title / status
 *   DELETE /tasks/:id            -> remove a task
 *   POST   /tasks/:id/complete   -> mark a task done
 *   GET    /health               -> liveness probe
 */

const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());

  // In-memory store so the project needs zero external services in CI.
  let tasks = [];
  let nextId = 1;

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.post('/tasks', (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }
    const task = { id: nextId++, title, status: 'pending' };
    tasks.push(task);
    return res.status(201).json(task);
  });

  app.get('/tasks', (req, res) => {
    const { status } = req.query;
    let result = tasks;
    if (status) {
      result = tasks.filter((t) => t.status === status);
    }
    return res.status(200).json(result);
  });

  app.get('/tasks/:id', (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.status(200).json(task);
  });

  app.put('/tasks/:id', (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { title, status } = req.body;
    if (title !== undefined) task.title = title;
    if (status !== undefined) {
      if (!['pending', 'done'].includes(status)) {
        return res.status(400).json({ error: 'invalid status' });
      }
      task.status = status;
    }
    return res.status(200).json(task);
  });

  app.delete('/tasks/:id', (req, res) => {
    const index = tasks.findIndex((t) => t.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    tasks.splice(index, 1);
    return res.status(204).send();
  });

  app.post('/tasks/:id/complete', (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.status = 'done';
    return res.status(200).json(task);
  });

  // Test-only helper to reset state between test cases.
  app._resetForTests = () => {
    tasks = [];
    nextId = 1;
  };

  return app;
}

module.exports = createApp;
