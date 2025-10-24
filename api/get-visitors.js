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

  const { page } = req.query;

  if (!page) {
    return res.status(400).json({ error: 'Missing "page" parameter. Usage: /api/get-visitors?page=your-page-name' });
  }

  try {
    const client = await getRedis();
    
    const visitorIps = await client.sMembers(`visitors-list:${page}`) || [];
    
    const visitors = await Promise.all(
      visitorIps.map(async (ip) => {
        const data = await client.get(`visitor:${page}:${ip}`);
        return data ? JSON.parse(data) : null;
      })
    );

    const validVisitors = visitors.filter(v => v !== null)
      .sort((a, b) => b.visits - a.visits);

    return res.status(200).json({
      page,
      totalUniqueVisitors: validVisitors.length,
      visitors: validVisitors
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get visitors', details: error.message });
  }
}
