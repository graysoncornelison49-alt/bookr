const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const filePath = path.join(process.cwd(), '.well-known', 'apple-developer-merchantid-domain-association');
  
  let content;
  try {
    content = fs.readFileSync(filePath);
  } catch (err) {
    return res.status(404).json({ error: 'File not found', detail: err.message });
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Length', content.length);
  res.status(200).end(content);
};
