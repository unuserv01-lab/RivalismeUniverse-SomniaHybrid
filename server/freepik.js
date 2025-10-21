require('dotenv').config();
const fetch = require('node-fetch');
const FREEPIK_KEY = process.env.FREEPIK_KEY;

async function searchFreepikImage(query) {
  if (!FREEPIK_KEY) return null;
  try {
    const url = `https://api.freepik.com/v1/search?term=${encodeURIComponent(query)}&limit=1`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${FREEPIK_KEY}` } });
    if (!r.ok) {
      console.warn('Freepik returned', await r.text());
      return null;
    }
    const data = await r.json();
    const imageUrl = data?.data?.[0]?.preview_url || null;
    return imageUrl;
  } catch (err) {
    console.warn('Freepik error', err.message);
    return null;
  }
}

module.exports = { searchFreepikImage };
