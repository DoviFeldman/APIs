import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { page } = req.query;

  if (!page) {
    return res.status(400).json({ error: 'Missing "page" parameter. Usage: /api/visitor-tracker?page=your-page-name' });
  }

  try {
    // Get IP address
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               'unknown';

    // Get location from Vercel headers
    const city = req.headers['x-vercel-ip-city'] || 'Unknown';
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const region = req.headers['x-vercel-ip-country-region'] || 'Unknown';

    // Create unique visitor ID
    const visitorKey = `visitor:${page}:${ip}`;
    const visitorsListKey = `visitors-list:${page}`;

    // Get or create visitor data
    const existingVisitor = await kv.get(visitorKey);
    
    if (existingVisitor) {
      // Increment visit count
      existingVisitor.visits += 1;
      existingVisitor.lastVisit = new Date().toISOString();
      await kv.set(visitorKey, existingVisitor);
    } else {
      // New visitor
      const newVisitor = {
        ip,
        city,
        region,
        country,
        visits: 1,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString()
      };
      await kv.set(visitorKey, newVisitor);
      
      // Add to visitors list
      await kv.sadd(visitorsListKey, ip);
    }

    // Get total unique visitors
    const uniqueVisitors = await kv.scard(visitorsListKey) || 0;

    return res.status(200).json({
      success: true,
      uniqueVisitors,
      yourVisits: existingVisitor ? existingVisitor.visits + 1 : 1,
      location: `${city}, ${region}, ${country}`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to track visitor' });
  }
}
