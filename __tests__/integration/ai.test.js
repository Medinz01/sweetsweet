import { POST as ChatPOST } from '../../src/app/api/chat/route';
import { POST as McpPOST } from '../../src/app/api/mcp/route';
import { getSellerFromToken } from '../../src/lib/get-seller-from-token';
import { NextResponse } from 'next/server';

jest.mock('../../src/lib/get-seller-from-token', () => ({
  getSellerFromToken: jest.fn(),
}));

// Mock fetch globally for ollama and mcp calls
global.fetch = jest.fn();

describe('AI API (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should return 401 if unauthorized', async () => {
      getSellerFromToken.mockResolvedValue(null);
      const res = await ChatPOST({});
      expect(res.status).toBe(401);
    });

    it('should communicate with Ollama and return response', async () => {
      getSellerFromToken.mockResolvedValue({ sellerId: 1 });
      const req = { json: async () => ({ messages: [{ role: 'user', content: 'test' }] }) };
      
      // Mock Ollama response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: { content: 'hello from LLM', role: 'assistant' } })
      });

      const res = await ChatPOST(req);
      const data = await res.json();
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(data.response.content).toBe('hello from LLM');
    });

    it('should handle tool calls from Ollama', async () => {
        getSellerFromToken.mockResolvedValue({ sellerId: 1 });
        const req = { json: async () => ({ messages: [{ role: 'user', content: 'test' }] }) };
        
        // 1. Mock Ollama returning a tool call
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
              message: { 
                  role: 'assistant', 
                  tool_calls: [{ function: { name: 'get_order_stats', arguments: {} } }] 
              } 
          })
        });

        // 2. Mock MCP internal call returning data
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ content: JSON.stringify({ totalOrdersToday: 5 }) })
        });

        // 3. Mock final Ollama response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: { content: 'You have 5 orders.', role: 'assistant' } })
        });
  
        const res = await ChatPOST(req);
        const data = await res.json();
        
        expect(global.fetch).toHaveBeenCalledTimes(3);
        expect(data.response.content).toBe('You have 5 orders.');
      });
  });

  describe('POST /api/mcp', () => {
    it('should return 400 if sellerId is missing', async () => {
      const req = { json: async () => ({ params: {} }) };
      const res = await McpPOST(req);
      expect(res.status).toBe(400);
    });
  });
});
