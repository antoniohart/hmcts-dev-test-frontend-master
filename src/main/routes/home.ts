import axios from 'axios';
import { format } from 'date-fns';
import { Application, Request, Response, Router } from 'express';

const API_BASE = 'http://localhost:4000'; // backend

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
}

export default function (app: Application): void {
  const router = Router();
  app.use('/', router);

  // Get tasks
  router.get('/tasks', async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const minDateTime = getLocalISOStringWithoutSeconds(now);

      // Call backend API
      const response = await axios.get(`${API_BASE}/tasks`);
      const tasks = response.data;

      // Add formatted due date field to each task
      const processed = tasks.map((task: Task) => {
        const due = new Date(task.dueDate);
        return {
          ...task,
          dueFormatted: due > now ? format(due, 'dd MMM yyyy HH:mm') : 'Overdue',
        };
      });

      // Pass processed tasks into template
      res.render('tasks.njk', { tasks: processed, minDateTime });
    } catch (error) {
      console.error('Error making request:', error);
      res.status(500).send('Error fetching tasks');
    }
  });

  // Create task
  router.post('/tasks/create', async (req: Request, res: Response) => {
    console.log('Received form data:', req.body);
    const { title, description, dueDate } = req.body;

    try {
      console.log('Creating task with:', { title, description, dueDate });

      const taskPayload = { title, description, dueDate };
      console.log('Creating task with JSON payload:', taskPayload);
      await axios.post(`${API_BASE}/tasks`, taskPayload);

      res.redirect('/tasks');
    } catch (err) {
      console.error('Error making request:', err);
      res.status(500).send('Error creating task');
    }
  });

  // Update task status
  router.post('/tasks/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating task ${id} to status ${status}`);
    try {
      await axios.put(`${API_BASE}/tasks/${id}?status=${status}`);
      res.redirect('/tasks');
    } catch (err) {
      res.status(500).send('Error updating status');
    }
  });

  // Delete task
  router.post('/tasks/:id/delete', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      res.redirect('/tasks');
    } catch (err) {
      res.status(500).send('Error deleting task');
    }
  });

  // Helper to get local ISO string without seconds (for datetime-local input) accounting for bst
  function getLocalISOStringWithoutSeconds(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // months start at 0
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    // Format: YYYY-MM-DDTHH:mm (no timezone suffix, so browsers treat it as local)
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
