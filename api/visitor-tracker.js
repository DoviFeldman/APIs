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
    return res.status(400).json({ error: 'Missing "page" parameter. Usage: /api/visitor-tracker?page=your-page-name' });
  }

  try {
    const client = await getRedis();
    
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               'unknown';

    const city = req.headers['x-vercel-ip-city'] || 'Unknown';
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const region = req.headers['x-vercel-ip-country-region'] || 'Unknown';

    const visitorKey = `visitor:${page}:${ip}`;
    const visitorsListKey = `visitors-list:${page}`;

    const existingVisitor = await client.get(visitorKey);
    
    if (existingVisitor) {
      const visitor = JSON.parse(existingVisitor);
      visitor.visits += 1;
      visitor.lastVisit = new Date().toISOString();
      await client.set(visitorKey, JSON.stringify(visitor));
    } else {
      const newVisitor = {
        ip,
        city,
        region,
        country,
        visits: 1,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString()
      };
      await client.set(visitorKey, JSON.stringify(newVisitor));
      await client.sAdd(visitorsListKey, ip);
    }

    const uniqueVisitors = await client.sCard(visitorsListKey) || 0;
    const currentVisitor = JSON.parse(await client.get(visitorKey));

    return res.status(200).json({
      success: true,
      uniqueVisitors,
      yourVisits: currentVisitor.visits,
      location: `${city}, ${region}, ${country}`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to track visitor', details: error.message });
  }
}
