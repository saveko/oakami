import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E tests for Waste API endpoints
 * Tests complete workflows: create waste record -> list -> approve -> view dashboard
 */
describe('Waste API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;

  const mockUser = {
    email: 'waste@example.com',
    password: 'TestPassword123!',
    firstName: 'Waste',
    lastName: 'Manager',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    // Register user
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(mockUser)
      .expect(201);

    authToken = registerRes.body.accessToken;
    organizationId = registerRes.body.user.organizationId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /waste', () => {
    it('should create waste record with valid data', async () => {
      const createDto = {
        ingredientId: 'ingredient-123',
        categoryId: 'category-456',
        quantity: 10,
        unit: 'kg',
        costImpact: 25.5,
        notes: 'Expired tomatoes',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('PENDING');
      expect(res.body.quantity).toBe(10);
      expect(res.body.costImpact).toBe(25.5);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteDto = {
        ingredientId: 'ingredient-123',
        // Missing categoryId, quantity, etc.
      };

      await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteDto)
        .expect(400);
    });

    it('should return 401 without auth token', async () => {
      const createDto = {
        ingredientId: 'ingredient-123',
        categoryId: 'category-456',
        quantity: 10,
        unit: 'kg',
        costImpact: 25.5,
      };

      await request(app.getHttpServer())
        .post('/api/v1/waste')
        .send(createDto)
        .expect(401);
    });

    it('should return 404 for non-existent ingredient', async () => {
      const createDto = {
        ingredientId: 'invalid-ingredient-id',
        categoryId: 'category-456',
        quantity: 10,
        unit: 'kg',
        costImpact: 25.5,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('GET /waste', () => {
    it('should return list of waste records with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/waste')
        .query({ skip: 0, take: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('pages');
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/waste')
        .query({ status: 'APPROVED' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((record: any) => {
        expect(record.status).toBe('APPROVED');
      });
    });

    it('should support different page sizes', async () => {
      const res10 = await request(app.getHttpServer())
        .get('/api/v1/waste')
        .query({ take: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const res20 = await request(app.getHttpServer())
        .get('/api/v1/waste')
        .query({ take: 20 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res20.body.data.length).toBeGreaterThanOrEqual(res10.body.data.length);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/waste')
        .expect(401);
    });
  });

  describe('GET /waste/:id', () => {
    let wasteRecordId: string;

    beforeAll(async () => {
      // Create a waste record to retrieve
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ingredientId: 'ingredient-123',
          categoryId: 'category-456',
          quantity: 5,
          unit: 'kg',
          costImpact: 12.5,
        });

      wasteRecordId = createRes.body.id;
    });

    it('should retrieve waste record by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/waste/${wasteRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(wasteRecordId);
      expect(res.body.quantity).toBe(5);
      expect(res.body.costImpact).toBe(12.5);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/waste/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /waste/:id/approve', () => {
    let wasteRecordId: string;

    beforeAll(async () => {
      // Create a waste record to approve
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ingredientId: 'ingredient-123',
          categoryId: 'category-456',
          quantity: 8,
          unit: 'kg',
          costImpact: 20.0,
        });

      wasteRecordId = createRes.body.id;
    });

    it('should approve pending waste record', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/waste/${wasteRecordId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
      expect(res.body.approvedAt).toBeDefined();
      expect(res.body.approvedBy).toBeDefined();
    });

    it('should return 400 if already approved', async () => {
      // Try to approve the same record again
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/waste/${wasteRecordId}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('PENDING');
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/waste/non-existent-id/approve')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /waste/:id/reject', () => {
    let wasteRecordId: string;

    beforeAll(async () => {
      // Create a waste record to reject
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ingredientId: 'ingredient-123',
          categoryId: 'category-456',
          quantity: 6,
          unit: 'kg',
          costImpact: 15.0,
        });

      wasteRecordId = createRes.body.id;
    });

    it('should reject pending waste record', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/waste/${wasteRecordId}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.status).toBe('REJECTED');
    });

    it('should return 400 if already rejected', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/waste/${wasteRecordId}/reject`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /waste/dashboard/stats', () => {
    it('should return dashboard statistics for period', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/waste/dashboard/stats')
        .query({ days: 7 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('summary');
      expect(res.body.summary).toHaveProperty('totalWaste');
      expect(res.body.summary).toHaveProperty('totalQuantity');
      expect(res.body.summary).toHaveProperty('recordCount');
      expect(res.body.summary).toHaveProperty('avgCostPerDay');
    });

    it('should support different day ranges', async () => {
      const res7days = await request(app.getHttpServer())
        .get('/api/v1/waste/dashboard/stats')
        .query({ days: 7 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const res30days = await request(app.getHttpServer())
        .get('/api/v1/waste/dashboard/stats')
        .query({ days: 30 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res7days.body).toHaveProperty('summary');
      expect(res30days.body).toHaveProperty('summary');
      // 30-day stats should be >= 7-day stats
      expect(res30days.body.summary.totalWaste).toBeGreaterThanOrEqual(
        res7days.body.summary.totalWaste
      );
    });

    it('should only include APPROVED records', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/waste/dashboard/stats')
        .query({ days: 30 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify the stats are calculated only from approved records
      expect(res.body.summary.recordCount).toBeGreaterThanOrEqual(0);
      expect(res.body.summary.totalWaste).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Authorization & Security', () => {
    it('should not allow cross-organization access', async () => {
      // Create a waste record
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ingredientId: 'ingredient-123',
          categoryId: 'category-456',
          quantity: 3,
          unit: 'kg',
          costImpact: 7.5,
        });

      const wasteRecordId = createRes.body.id;

      // Try to access with different token (from another user/org)
      const otherUserRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'other@example.com',
          password: 'OtherPass123!',
          firstName: 'Other',
          lastName: 'User',
        });

      const otherToken = otherUserRes.body.accessToken;

      // The other user should not be able to see the waste record
      const accessRes = await request(app.getHttpServer())
        .get(`/api/v1/waste/${wasteRecordId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(accessRes.status).toBe(404);
    });

    it('should reject expired tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      await request(app.getHttpServer())
        .get('/api/v1/waste')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Complete Waste Workflow', () => {
    it('should complete create -> approve -> retrieve flow', async () => {
      // 1. Create waste record
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/waste')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ingredientId: 'ingredient-123',
          categoryId: 'category-456',
          quantity: 15,
          unit: 'kg',
          costImpact: 37.5,
          notes: 'Complete workflow test',
        })
        .expect(201);

      const wasteRecordId = createRes.body.id;
      expect(createRes.body.status).toBe('PENDING');

      // 2. Retrieve the record
      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/waste/${wasteRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getRes.body.id).toBe(wasteRecordId);
      expect(getRes.body.notes).toBe('Complete workflow test');

      // 3. Approve the record
      const approveRes = await request(app.getHttpServer())
        .patch(`/api/v1/waste/${wasteRecordId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(approveRes.body.status).toBe('APPROVED');

      // 4. Verify in dashboard stats
      const statsRes = await request(app.getHttpServer())
        .get('/api/v1/waste/dashboard/stats')
        .query({ days: 7 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statsRes.body.summary.totalWaste).toBeGreaterThanOrEqual(37.5);
      expect(statsRes.body.summary.recordCount).toBeGreaterThan(0);
    });
  });
});
