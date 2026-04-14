/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from '../../../src/app/admin/page';
import axios from 'axios';

jest.mock('axios');

describe('Admin Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with stats', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        totalOrdersToday: 10,
        pendingOrders: 2,
        totalProducts: 50,
        totalCategories: 5,
      }
    });

    render(<AdminPanel />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('handles AI Assistant form submission', async () => {
    axios.get.mockResolvedValueOnce({ data: {} }); // Mock stats
    
    axios.post.mockResolvedValueOnce({
      data: { response: { content: 'AI Answer' } }
    });

    render(<AdminPanel />);

    const input = screen.getByPlaceholderText('Ask a question about your store...');
    fireEvent.change(input, { target: { value: 'How many orders?' } });
    
    // MUI / Native form submit
    fireEvent.submit(input);

    await waitFor(() => {
      expect(screen.getByText('How many orders?')).toBeInTheDocument();
      expect(screen.getByText('AI Answer')).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith('/api/chat', expect.any(Object));
  });
});
