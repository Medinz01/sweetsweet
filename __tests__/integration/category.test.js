import { GET, POST, PUT, DELETE } from '../../src/app/api/category/route';
import { Category } from '../../src/models';
import { getSellerFromToken } from '../../src/lib/get-seller-from-token';
import { NextResponse } from 'next/server';

jest.mock('../../src/models', () => ({
  Category: {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Seller: {}
}));

jest.mock('../../src/lib/get-seller-from-token', () => ({
  getSellerFromToken: jest.fn(),
}));

describe('Category API (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/category', () => {
    it('should return 401 if unauthorized', async () => {
      getSellerFromToken.mockResolvedValue(null);
      const res = await GET({});
      expect(res.status).toBe(401);
    });

    it('should return categories on success', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      Category.findAll.mockResolvedValue([{ id: 1, name: 'Sweets' }]);
      const res = await GET({});
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
    });
  });

  describe('POST /api/category', () => {
    it('should return 400 if missing name', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      const req = { json: async () => ({}) };
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('should create category successfully', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      Category.create.mockResolvedValue({ id: 1, name: 'Savory' });
      const req = { json: async () => ({ name: 'Savory' }) };
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });
});
