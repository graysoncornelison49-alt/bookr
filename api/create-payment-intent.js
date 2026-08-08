const { randomUUID } = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { sourceId, amount, eventName, tierName, tierId, eventId, buyerEmail, buyerName, buyerPhone, quantity } = body || {};

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;

    if (!accessToken || !locationId) {
      return res.status(500).json({ error: 'Square credentials not configured' });
    }

    if (!sourceId || !amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Missing sourceId or invalid amount' });
    }

    // Check tier availability before charging
    if (tierId) {
      const tierRes = await fetch(`${SUPABASE_URL}/rest/v1/ticket_tiers?id=eq.${tierId}&select=sold,capacity,event_id`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      const tierData = await tierRes.json();
      if (!tierData || !tierData[0]) {
        return res.status(400).json({ error: 'Invalid ticket tier.' });
      }
      const { sold, capacity, event_id } = tierData[0];
      if (event_id !== eventId) {
        return res.status(400).json({ error: 'Ticket tier does not belong to this event.' });
      }
      const requestedQty = quantity || 1;
      if (capacity > 0 && (sold + requestedQty) > capacity) {
        return res.status(400).json({ error: 'Sorry, this ticket tier is sold out.' });
      }
    }

    // Charge via Square
    const amountCents = Math.round(Number(amount) * 100);
    const squareRes = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: randomUUID(),
        amount_money: { amount: amountCents, currency: 'USD' },
        location_id: locationId,
        buyer_email_address: buyerEmail || undefined,
        note: `${eventName || 'Event'} — ${tierName || 'Ticket'}`,
      }),
    });

    const squareData = await squareRes.json();
    if (squareData.errors && squareData.errors.length > 0) {
      return res.status(400).json({ error: squareData.errors[0].detail || 'Payment failed' });
    }

    res.status(200).json({
      paymentId: squareData.payment.id,
      status: squareData.payment.status,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
