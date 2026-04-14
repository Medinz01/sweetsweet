import { getSellerFromToken } from '../../src/lib/get-seller-from-token';
import { signToken } from '../../src/lib/auth';

describe('getSellerFromToken Helper (Unit)', () => {
  const payload = { userId: 1, email: 'test@example.com', sellerId: 101 };

  it('should return payload if valid token cookie is present', async () => {
    const token = await signToken(payload);
    
    // Mock Next.js Request object
    const mockRequest = {
      cookies: {
        get: jest.fn().mockReturnValue({ value: token })
      }
    };

    const result = await getSellerFromToken(mockRequest);
    expect(result).toMatchObject(payload);
  });

  it('should return null if token cookie is missing', async () => {
    const mockRequest = {
      cookies: {
        get: jest.fn().mockReturnValue(undefined)
      }
    };

    const result = await getSellerFromToken(mockRequest);
    expect(result).toBeNull();
  });

  it('should return null if token does not contain a sellerId', async () => {
    const invalidPayload = { userId: 1, email: 'user@example.com' }; // No sellerId
    const token = await signToken(invalidPayload);
    
    const mockRequest = {
      cookies: {
        get: jest.fn().mockReturnValue({ value: token })
      }
    };

    const result = await getSellerFromToken(mockRequest);
    expect(result).toBeNull();
  });

  it('should return null if token is malformed', async () => {
    const mockRequest = {
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'invalid-token' })
      }
    };

    const result = await getSellerFromToken(mockRequest);
    expect(result).toBeNull();
  });
});
