import { app } from '../../main/app';

import { expect } from 'chai';
import nock from 'nock';
import request from 'supertest';

const API_BASE = 'http://localhost:4000';

describe('Task Management', () => {
  beforeEach(() => {
    // Clear all nock interceptors
    nock.cleanAll();
  });

  describe('GET /tasks', () => {
    it('should display tasks page with tasks from API', async () => {
      // Mock the API response
      nock(API_BASE)
        .get('/tasks')
        .reply(200, [
          {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            dueDate: '2025-12-31T23:59',
            status: 'PENDING',
          },
        ]);

      const response = await request(app).get('/tasks').expect(200);

      expect(response.text).to.include('Test Task');
      expect(response.text).to.include('Test Description');
    });

    it('should handle API errors gracefully', async () => {
      nock(API_BASE).get('/tasks').reply(500, { error: 'Server error' });

      await request(app).get('/tasks').expect(500).expect('Error fetching tasks');
    });
  });

  describe('POST /tasks/create', () => {
    it('should create a new task and redirect to tasks page', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2025-12-31T23:59',
      };

      nock(API_BASE).post('/tasks', newTask).reply(201);

      await request(app).post('/tasks/create').send(newTask).expect(302).expect('Location', '/tasks');
    });

    it('should handle validation errors', async () => {
      const invalidTask = {
        description: 'Missing Title',
        dueDate: '2025-12-31T23:59',
      };

      nock(API_BASE).post('/tasks').reply(400, { error: 'Title is required' });

      await request(app).post('/tasks/create').send(invalidTask).expect(500).expect('Error creating task');
    });
  });

  describe('POST /tasks/:id/status', () => {
    it('should update task status and redirect to tasks page', async () => {
      const taskId = '123';
      const status = 'COMPLETED';

      nock(API_BASE).put(`/tasks/${taskId}?status=${status}`).reply(200);

      await request(app).post(`/tasks/${taskId}/status`).send({ status }).expect(302).expect('Location', '/tasks');
    });
  });

  describe('POST /tasks/:id/delete', () => {
    it('should delete task and redirect to tasks page', async () => {
      const taskId = '123';

      nock(API_BASE).delete(`/tasks/${taskId}`).reply(200);

      await request(app).post(`/tasks/${taskId}/delete`).expect(302).expect('Location', '/tasks');
    });
  });
});
