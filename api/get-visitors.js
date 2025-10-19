import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { page } = req.query;

  if (!page) {
    return res.status(400).json({ error: 'Missing "page" parameter. Usage: /api/get-visitors?page=your-page-name' });
  }

  try {
    // Get all visitor IPs for this page
    const visitorIps = await kv.smembers(`visitors-list:${page}`) || [];
    
    // Get details for each visitor
    const visitors = await Promise.all(
      visitorIps.map(async (ip) => {
        const data = await kv.get(`visitor:${page}:${ip}`);
        return data;
      })
    );

    // Filter out any null values and sort by visit count
    const validVisitors = visitors.filter(v => v !== null)
      .sort((a, b) => b.visits - a.visits);

    return res.status(200).json({
      page,
      totalUniqueVisitors: validVisitors.length,
      visitors: validVisitors
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get visitors' });
  }
}
