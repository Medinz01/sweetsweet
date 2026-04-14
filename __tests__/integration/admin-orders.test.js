import { GET } from '../../src/app/api/admin/orders/route';
import { Order, OrderItem, Product, User, Address } from '../../src/models';
import { verifyToken } from '../../src/lib/auth';
import { cookies } from 'next/headers';

jest.mock('../../src/lib/auth');
jest.mock('next/headers');
jest.mock('../../src/models', () => ({
  Order: { findAll: jest.fn() },
  OrderItem: {},
  Product: {},
  User: {},
  Address: {},
}));

describe('Admin Orders API (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    cookies.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return orders for the authenticated seller (Multitenancy Check)', async () => {
    const mockSellerId = 101;
    const mockOrders = [
      { id: 1, sellerId: mockSellerId, totalPrice: 500, items: [] },
      { id: 2, sellerId: mockSellerId, totalPrice: 300, items: [] },
    ];

    cookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'valid-token' }),
    });

    verifyToken.mockResolvedValue({ sellerId: mockSellerId });
    Order.findAll.mockResolvedValue(mockOrders);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { sellerId: mockSellerId }
    }));
  });

  it('should isolate orders between different sellers', async () => {
    const sellerA = 1;
    const sellerB = 2;

    cookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'seller-a-token' }),
    });

    // Test for Seller A
    verifyToken.mockResolvedValue({ sellerId: sellerA });
    await GET();
    expect(Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { sellerId: sellerA }
    }));

    // Test for Seller B
    verifyToken.mockResolvedValue({ sellerId: sellerB });
    await GET();
    expect(Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { sellerId: sellerB }
    }));
  });
});
