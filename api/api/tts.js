export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const EL_KEY = process.env.EL_KEY;
  const { voice_id } = req.query;
  if (!voice_id) return res.status(400).json({ error: 'voice_id required' });
  try {
    const { text, voice_settings } = req.body;
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: voice_settings || { stability: 0.45, similarity_boost: 0.9, style: 0.35, use_speaker_boost: true } }),
    });
    if (!upstream.ok) { const err = await upstream.text(); return res.status(upstream.status).json({ error: err }); }
    res.setHeader('Content-Type', 'audio/mpeg');
    const buf = await upstream.arrayBuffer();
    return res.send(Buffer.from(buf));
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };
