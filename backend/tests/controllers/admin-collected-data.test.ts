// Mock auth and role middleware to allow test requests
jest.mock('../../src/middlewares/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-admin' };
    next();
  },
}));

jest.mock('../../src/middlewares/role.middleware', () => ({
  requireAdminOrModerator: (_req: any, _res: any, next: any) => next(),
}));

// Mock admin.service to avoid DB calls
jest.mock('../../src/services/admin.service', () => ({
  fetchCollectedDataForAdmin: jest.fn().mockResolvedValue({ items: [
    {
      id: 'test-1',
      raw_title: 'Test Title',
      raw_content: 'Test content',
      source_name: 'Test Source',
      source_url: 'https://example.com',
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ], total: 1 }),
  getCollectedDataForAdmin: jest.fn().mockResolvedValue({ id: 'test-1' }),
  approveCollectedData: jest.fn().mockResolvedValue({ id: 'test-1', verification_status: 'approved' }),
  rejectCollectedData: jest.fn().mockResolvedValue({ id: 'test-1', verification_status: 'rejected' }),
  editCollectedData: jest.fn().mockResolvedValue({ id: 'test-1' }),
  publishCollectedData: jest.fn().mockResolvedValue({ id: 'published-1' }),
}));

import request from 'supertest';
import app from '../../src/app';

describe('Admin collected-data endpoints', () => {
  it('GET /api/admin/collected-data should return items', async () => {
    const res = await request(app).get('/api/admin/collected-data');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.total).toBe(1);
  });

  it('PATCH /api/admin/collected-data/:id/approve should return approved', async () => {
    const res = await request(app)
      .patch('/api/admin/collected-data/test-1/approve')
      .send({ admin_notes: 'approved by test' });
    expect(res.status).toBe(200);
    expect(res.body.data.verification_status).toBe('approved');
  });

  it('PATCH /api/admin/collected-data/:id/reject should return rejected', async () => {
    const res = await request(app)
      .patch('/api/admin/collected-data/test-1/reject')
      .send({ rejection_reason: 'bad' });
    expect(res.status).toBe(200);
    expect(res.body.data.verification_status).toBe('rejected');
  });

  it('PATCH /api/admin/collected-data/:id/edit should update', async () => {
    const res = await request(app)
      .patch('/api/admin/collected-data/test-1/edit')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/admin/collected-data/:id/publish should insert and return published', async () => {
    const res = await request(app)
      .patch('/api/admin/collected-data/test-1/publish')
      .send({
        itemType: 'scheme',
        payload: {
          title: 'T',
          description: 'Test description',
          source_url: 'https://example.com',
          category: 'Test Category',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});
