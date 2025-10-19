import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing "id" parameter. Usage: /api/counter?id=your-button-name' });
  }

  try {
    // Increment counter
    const count = await kv.incr(`counter:${id}`);
    
    return res.status(200).json({ 
      id,
      count,
      message: 'Counter incremented successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to increment counter' });
  }
}
