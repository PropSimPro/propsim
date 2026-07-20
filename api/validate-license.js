export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ valid: false, error: 'Method not allowed' });

  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ valid: false, error: 'No license key provided' });

  try {
    // Try license key validation endpoint
    const response = await fetch('https://api.whop.com/api/v2/licenses/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ license_key: licenseKey })
    });

    const data = await response.json();
    console.log('Whop response:', JSON.stringify(data));

    // Valid if membership is active
    if (data.valid || data.status === 'active' || (data.membership && data.membership.status === 'active')) {
      return res.status(200).json({ valid: true });
    }

    return res.status(200).json({ valid: false, debug: data });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ valid: false, error: error.message });
  }
}
