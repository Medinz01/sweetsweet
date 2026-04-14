import jwt from 'jsonwebtoken';

// Mock jose globally for all tests to handle ESM issues
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation((payload) => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockImplementation(async (secret) => {
        const s = secret || process.env.JWT_SECRET || 'super-secret-key-123';
        return jwt.sign(payload, s);
    }),
  })),
  jwtVerify: jest.fn().mockImplementation(async (token, secret) => {
    try {
        const s = secret || process.env.JWT_SECRET || 'super-secret-key-123';
        const payload = jwt.verify(token, s);
        return { payload };
    } catch (e) {
        throw e;
    }
  }),
}));
