import { createClient } from 'redis';

let redis;

async function getRedis() {
  if (!redis) {
    redis = createClient({
      url: process.env.KV_REDIS_URL || process.env.REDIS_URL
    });
    await redis.connect();
  }
  return redis;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing "id" parameter. Usage: /api/counter?id=your-button-name' });
  }

  try {
    const client = await getRedis();
    const count = await client.incr(`counter:${id}`);
    
    return res.status(200).json({ 
      id,
      count,
      message: 'Counter incremented successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to increment counter', details: error.message });
  }
}
