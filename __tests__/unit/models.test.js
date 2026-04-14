import { User } from '../../src/models/User';
import { Product } from '../../src/models/Product';
import { Order } from '../../src/models/Order';

// Manual check for Sequelize error names since we are testing validations
const isValidationError = (err) => err.name === 'SequelizeValidationError';

describe('Model Validations (Unit)', () => {

  describe('User Model', () => {
    it('should fail validation for an invalid email', async () => {
      const user = User.build({
        fullName: 'Test User',
        email: 'not-an-email',
        password_hash: 'hash'
      });
      
      let errorOccurred = false;
      try {
        await user.validate();
      } catch (error) {
        errorOccurred = true;
        expect(isValidationError(error)).toBe(true);
        expect(error.errors[0].path).toBe('email');
      }
      expect(errorOccurred).toBe(true);
    });

    it('should pass validation for a correct email', async () => {
      const user = User.build({
        fullName: 'Test User',
        email: 'valid@example.com',
        password_hash: 'hash'
      });
      const result = await user.validate();
      expect(result).toBeDefined();
    });
  });

  describe('Product Model', () => {
    it('should require a name and slug', async () => {
      const product = Product.build({
        categoryId: 1,
        sellerId: 1
      });
      
      let errorOccurred = false;
      try {
        await product.validate();
      } catch (error) {
        errorOccurred = true;
        expect(isValidationError(error)).toBe(true);
        const paths = error.errors.map(e => e.path);
        expect(paths).toContain('name');
        expect(paths).toContain('slug');
      }
      expect(errorOccurred).toBe(true);
    });
  });

  describe('Order Model', () => {
    it('should reject invalid status values', async () => {
      const order = Order.build({
        totalPrice: 100,
        sellerId: 1,
        status: 'InvalidStatus' // Not in ENUM
      });
      
      let errorOccurred = false;
      try {
        await order.validate();
      } catch (error) {
        errorOccurred = true;
        expect(isValidationError(error)).toBe(true);
        expect(error.errors[0].path).toBe('status');
      }
      expect(errorOccurred).toBe(true);
    });

    it('should accept valid status values', async () => {
      const order = Order.build({
        totalPrice: 100,
        sellerId: 1,
        status: 'Shipped'
      });
      const result = await order.validate();
      expect(result).toBeDefined();
    });
  });
});
