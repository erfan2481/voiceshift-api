export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const EL_KEY = process.env.EL_KEY;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || 'multipart/form-data';
    const upstream = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': EL_KEY,
        'Content-Type': contentType,
      },
      body: rawBody,
    });
    const text = await upstream.text();
    try {
      return res.status(upstream.status).json(JSON.parse(text));
    } catch {
      return res.status(upstream.status).send(text);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
export const config = { api: { bodyParser: false, sizeLimit: '50mb' } };
