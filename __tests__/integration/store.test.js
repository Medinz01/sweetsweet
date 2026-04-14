import { GET } from '../../src/app/api/store/[slug]/route';
import { Seller } from '../../src/models';

// Mocking the model
jest.mock('../../src/models', () => ({
  Seller: {
    findOne: jest.fn(),
  },
}));

describe('Store API (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if slug is missing', async () => {
    const res = await GET({}, { params: {} });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Store slug is required.');
  });

  it('should return 404 if store is not found', async () => {
    Seller.findOne.mockResolvedValue(null);

    const res = await GET({}, { params: { slug: 'non-existent' } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe('Store not found.');
  });

  it('should return 200 and store name if found', async () => {
    Seller.findOne.mockResolvedValue({ storeName: 'Sweet Treats' });

    const res = await GET({}, { params: { slug: 'sweet-treats' } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.storeName).toBe('Sweet Treats');
    expect(Seller.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: { storeSlug: 'sweet-treats' }
    }));
  });

  it('should handle internal server errors gracefully', async () => {
    Seller.findOne.mockRejectedValue(new Error('DB Down'));

    const res = await GET({}, { params: { slug: 'error-case' } });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Internal Server Error');
  });
});
