module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { amount, eventName, tierName, buyerEmail, tierId, quantity } = body || {};
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) return res.status(500).json({ error: 'Stripe secret key not configured' });
    if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Invalid amount: ' + amount });

    if (tierId) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
      if (supabaseUrl && supabaseKey) {
        const tierRes = await fetch(`${supabaseUrl}/rest/v1/ticket_tiers?id=eq.${tierId}&select=sold,capacity`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const tiers = await tierRes.json();
        if (tiers && tiers.length > 0) {
          const tier = tiers[0];
          const requestedQty = quantity || 1;
          const remaining = (tier.capacity || 999) - (tier.sold || 0);
          if (remaining <= 0) return res.status(400).json({ error: 'This ticket tier is sold out.' });
          if (requestedQty > remaining) return res.status(400).json({ error: `Only ${remaining} ticket(s) remaining for this tier.` });
        }
      }
    }

    const params = new URLSearchParams();
    params.append('amount', Math.round(Number(amount) * 100));
    params.append('currency', 'usd');
    params.append('automatic_payment_methods[enabled]', 'true');
    if (eventName) params.append('metadata[event]', eventName);
    if (tierName) params.append('metadata[tier]', tierName);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.status(200).json({ clientSecret: data.client_secret });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
