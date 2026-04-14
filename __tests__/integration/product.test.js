import { GET, POST, PUT, DELETE } from '../../src/app/api/product/route';
import { Product } from '../../src/models';
import { getSellerFromToken } from '../../src/lib/get-seller-from-token';
import { NextResponse } from 'next/server';

jest.mock('../../src/models', () => ({
  Product: {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Category: {},
  Discount: {},
}));

jest.mock('../../src/lib/get-seller-from-token', () => ({
  getSellerFromToken: jest.fn(),
}));

describe('Product API (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/product', () => {
    it('should return 401 if unauthorized', async () => {
      getSellerFromToken.mockResolvedValue(null);
      const res = await GET({});
      expect(res.status).toBe(401);
    });

    it('should return products on success', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      Product.findAll.mockResolvedValue([{ id: 1, name: 'Truffle' }]);
      const res = await GET({});
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
    });
  });

  describe('POST /api/product', () => {
    it('should return 401 if unauthorized', async () => {
      getSellerFromToken.mockResolvedValue(null);
      const res = await POST({});
      expect(res.status).toBe(401);
    });

    it('should return 400 if missing fields', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      const req = { json: async () => ({ name: 'Test' }) };
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('should create product successfully', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      Product.create.mockResolvedValue({ id: 1, name: 'Cake' });
      const req = { json: async () => ({ name: 'Cake', slug: 'cake', categoryId: 1 }) };
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/product', () => {
    it('should return 400 if ID is missing', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      const req = { json: async () => ({ name: 'Cake' }) };
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });

    it('should update successfully', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      const mockProduct = { update: jest.fn().mockResolvedValue(true) };
      Product.findOne.mockResolvedValue(mockProduct);
      
      const req = { json: async () => ({ id: 1, name: 'Cake Updated', slug: 'cake-new', categoryId: 1 }) };
      const res = await PUT(req);
      expect(res.status).toBe(200);
      expect(mockProduct.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/product', () => {
    it('should return 404 if product not found', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      Product.findOne.mockResolvedValue(null);
      
      const req = { url: 'http://localhost/api/product?id=999' };
      const res = await DELETE(req);
      expect(res.status).toBe(404);
    });

    it('should delete product successfully', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      const mockProduct = { destroy: jest.fn().mockResolvedValue(true) };
      Product.findOne.mockResolvedValue(mockProduct);
      
      const req = { url: 'http://localhost/api/product?id=1' };
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      expect(mockProduct.destroy).toHaveBeenCalled();
    });
  });
});
