module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { buyerEmail, buyerName, eventName, tierName, quantity, total, ref, eventDate, eventVenue } = body || {};

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return res.status(500).json({ error: 'Resend API key not configured' });
    if (!buyerEmail) return res.status(400).json({ error: 'Buyer email required' });

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 520px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1C1C1C, #141414); padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .logo-dot { width: 28px; height: 28px; border-radius: 8px; background: #FF6B6B; display: inline-block; }
  .logo-text { font-size: 20px; font-weight: 700; color: #F5F2EE; }
  .title { font-size: 28px; font-weight: 700; color: #F5F2EE; margin: 0 0 8px; letter-spacing: -0.02em; }
  .subtitle { font-size: 15px; color: #A8A39B; margin: 0; }
  .body { padding: 28px 32px; }
  .event-name { font-size: 22px; font-weight: 700; color: #F5F2EE; margin: 0 0 16px; letter-spacing: -0.015em; }
  .details { background: #1C1C1C; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .detail-row:last-child { border-bottom: none; }
  .detail-key { font-size: 13px; color: #6B6760; }
  .detail-val { font-size: 13px; color: #F5F2EE; font-weight: 500; }
  .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2); border-radius: 12px; margin-bottom: 24px; }
  .total-key { font-size: 14px; color: #F5F2EE; font-weight: 600; }
  .total-val { font-size: 22px; font-weight: 700; color: #FF6B6B; letter-spacing: -0.02em; }
  .ref { text-align: center; font-family: monospace; font-size: 13px; color: #6B6760; letter-spacing: 0.1em; margin-bottom: 24px; }
  .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
  .footer-text { font-size: 12px; color: #6B6760; margin: 0; }
  .footer-text a { color: #FF6B6B; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo">
        <span class="logo-dot"></span>
        <span class="logo-text">Bookr</span>
      </div>
      <h1 class="title">You're in. 🎟</h1>
      <p class="subtitle">Your ticket is confirmed. See you there.</p>
    </div>
    <div class="body">
      <div class="event-name">${eventName || 'Your Event'}</div>
      <div class="details">
        <div class="detail-row">
          <span class="detail-key">Name</span>
          <span class="detail-val">${buyerName || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">Ticket</span>
          <span class="detail-val">${tierName || '—'} × ${quantity || 1}</span>
        </div>
        ${eventDate ? `<div class="detail-row">
          <span class="detail-key">Date</span>
          <span class="detail-val">${eventDate}</span>
        </div>` : ''}
        ${eventVenue ? `<div class="detail-row">
          <span class="detail-key">Venue</span>
          <span class="detail-val">${eventVenue}</span>
        </div>` : ''}
        <div class="detail-row">
          <span class="detail-key">Order ref</span>
          <span class="detail-val" style="font-family:monospace;font-size:12px;">${ref || '—'}</span>
        </div>
      </div>
      <div class="total-row">
        <span class="total-key">Total paid</span>
        <span class="total-val">$${total || '0.00'}</span>
      </div>
      <p class="ref">${ref || ''}</p>
    </div>
    <div class="footer">
      <p class="footer-text">Powered by <a href="https://bookr.events">Bookr</a> · Questions? Reply to this email.</p>
    </div>
  </div>
</div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bookr Tickets <onboarding@resend.dev>',
        to: [buyerEmail],
        subject: `Your ticket for ${eventName || 'the event'} — ${ref}`,
        html,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message || data.error });

    res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
