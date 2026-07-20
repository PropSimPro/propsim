export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ valid: false });

  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ valid: false });

  try {
    // Use listMembership filtered by product IDs
    const PRODUCT_IDS = 'prod_iyujHoZ5nCTT8,prod_aBcDeFgHiJkLmN'; // Replace second ID with your recurring product ID
    
    const response = await fetch(
      `https://api.whop.com/api/v2/memberships?product_ids=${PRODUCT_IDS}&license_key=${encodeURIComponent(licenseKey)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log('Whop response:', JSON.stringify(data));

    // Check if any membership matches and is active
    if (data.data && data.data.length > 0) {
      const membership = data.data[0];
      const isValid = membership.status === 'active' || membership.status === 'completed';
      return res.status(200).json({ valid: isValid, status: membership.status });
    }

    return res.status(200).json({ valid: false });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ valid: false, error: error.message });
  }
}
