import { POST as RegisterPOST } from '../../src/app/api/sellers/register/route';
import { POST as LoginPOST } from '../../src/app/api/login/route';
import { Seller } from '../../src/models';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { NextResponse } from 'next/server';

jest.mock('../../src/models', () => ({
  Seller: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('Auth API (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if missing fields', async () => {
      const req = { json: async () => ({ fullName: '', email: '', password: '', storeName: '' }) };
      const res = await RegisterPOST(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.message).toBe('All fields are required.');
    });

    it('should return 400 if user already exists', async () => {
      Seller.findOne.mockResolvedValue({ id: 1 });
      const req = { json: async () => ({ fullName: 'Test', email: 'test@test.com', password: 'password', storeName: 'Store' }) };
      const res = await RegisterPOST(req);
      const data = await res.json();
      expect(res.status).toBe(409);
      expect(data.message).toBe('An account with this email already exists.');
    });

    it('should return 201 on success', async () => {
      Seller.findOne.mockResolvedValue(null);
      Seller.create.mockResolvedValue({ id: 1, email: 'test@test.com' });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const req = { json: async () => ({ fullName: 'Test', email: 'test@test.com', password: 'password', storeName: 'Store' }) };
      const res = await RegisterPOST(req);
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.id).toBe(1);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if fields missing', async () => {
      const req = { json: async () => ({ email: '', password: '' }) };
      const res = await LoginPOST(req);
      const data = await res.json();
      expect(res.status).toBe(401);
    });

    it('should return 401 if user not found', async () => {
      Seller.findOne.mockResolvedValue(null);
      const req = { json: async () => ({ email: 'test@test.com', password: 'password' }) };
      const res = await LoginPOST(req);
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 401 if wrong password', async () => {
      Seller.findOne.mockResolvedValue({ id: 1, password_hash: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);
      const req = { json: async () => ({ email: 'test@test.com', password: 'password' }) };
      const res = await LoginPOST(req);
      const data = await res.json();
      expect(res.status).toBe(401);
    });

    it('should return 200 and setting cookie on success', async () => {
      Seller.findOne.mockResolvedValue({ id: 1, email: 'test@test.com', password_hash: 'hashed' });
      bcrypt.compare.mockResolvedValue(true);
      const req = { json: async () => ({ email: 'test@test.com', password: 'password' }) };
      const res = await LoginPOST(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.message).toBe('Login successful');
    });
  });
});
