const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

beforeEach(() => {
  app._resetForTests();
});

test('health check returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

test('creates a task', async () => {
  const res = await request(app).post('/tasks').send({ title: 'Write report' });
  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe('Write report');
  expect(res.body.status).toBe('pending');
});

test('rejects a task with no title', async () => {
  const res = await request(app).post('/tasks').send({});
  expect(res.statusCode).toBe(400);
});

test('lists tasks, empty by default', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});

test('filters tasks by status', async () => {
  await request(app).post('/tasks').send({ title: 'A' });
  await request(app).post('/tasks').send({ title: 'B' });
  await request(app).post('/tasks/2/complete');

  const res = await request(app).get('/tasks').query({ status: 'done' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].title).toBe('B');
});

test('gets a single task', async () => {
  await request(app).post('/tasks').send({ title: 'A' });
  const res = await request(app).get('/tasks/1');
  expect(res.statusCode).toBe(200);
  expect(res.body.title).toBe('A');
});

test('404 when task does not exist', async () => {
  const res = await request(app).get('/tasks/999');
  expect(res.statusCode).toBe(404);
});

test('updates a task title and status', async () => {
  await request(app).post('/tasks').send({ title: 'A' });
  const res = await request(app).put('/tasks/1').send({ title: 'A2', status: 'done' });
  expect(res.statusCode).toBe(200);
  expect(res.body.title).toBe('A2');
  expect(res.body.status).toBe('done');
});

test('rejects an invalid status on update', async () => {
  await request(app).post('/tasks').send({ title: 'A' });
  const res = await request(app).put('/tasks/1').send({ status: 'archived' });
  expect(res.statusCode).toBe(400);
});

test('deletes a task', async () => {
  await request(app).post('/tasks').send({ title: 'A' });
  const del = await request(app).delete('/tasks/1');
  expect(del.statusCode).toBe(204);
  const get = await request(app).get('/tasks/1');
  expect(get.statusCode).toBe(404);
});

test('marks a task complete', async () => {
  await request(app).post('/tasks').send({ title: 'A' });
  const res = await request(app).post('/tasks/1/complete');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('done');
});
