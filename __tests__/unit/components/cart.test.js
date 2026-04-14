/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartPage from '../../../src/app/(main)/cart/page';
import { useCart } from '../../../src/context/CartContext';

jest.mock('../../../src/context/CartContext', () => ({
  useCart: jest.fn(),
}));

// Mock next/navigation router
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() })
}));

describe('Cart Page Component', () => {
  it('renders generic empty state', () => {
    useCart.mockReturnValue({
      cart: [],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      getTotal: () => 0,
    });

    render(<CartPage />);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('renders cart items and handles removal', () => {
    const mockRemove = jest.fn();
    useCart.mockReturnValue({
      cart: [{
        id: 1,
        name: 'Truffle',
        pricePerUnit: 100,
        pricePerKg: null,
        sellerId: 1,
        storeName: 'Test Store',
        quantity: 2,
        purchaseType: 'unit',
      }],
      removeFromCart: mockRemove,
      updateQuantity: jest.fn(),
      getTotal: () => 200,
    });

    render(<CartPage />);
    
    expect(screen.getByText('Truffle')).toBeInTheDocument();
    
    // Test remove
    const removeBtn = screen.getByText('✖').closest('button');
    fireEvent.click(removeBtn);
    
    expect(mockRemove).toHaveBeenCalledWith(1);
  });
});
