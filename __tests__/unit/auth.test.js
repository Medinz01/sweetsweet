import { signToken, verifyToken } from '../../src/lib/auth';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'super-secret-key-123';
process.env.JWT_SECRET = TEST_SECRET;

describe('Auth Utility (Unit)', () => {
  const payload = { userId: 1, email: 'test@example.com', sellerId: 101 };

  it('should sign a valid JWT token', async () => {
    const token = await signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    // Verify with jsonwebtoken to ensure signToken used real logic via the mock
    const decoded = jwt.verify(token, TEST_SECRET);
    expect(decoded).toMatchObject(payload);
  });

  it('should verify a valid token and return payload', async () => {
    const token = await signToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded).toMatchObject(payload);
  });

  it('should return null for a malformed token', async () => {
    const result = await verifyToken('not.a.token');
    expect(result).toBeNull();
  });

  it('should return null for a token with an invalid signature', async () => {
    const token = await signToken(payload);
    const tamperedToken = token.substring(0, token.lastIndexOf('.') + 1) + 'tamperedSignature';
    const result = await verifyToken(tamperedToken);
    expect(result).toBeNull();
  });
});
