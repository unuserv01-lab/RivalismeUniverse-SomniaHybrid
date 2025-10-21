require('dotenv').config();
const fetch = require('node-fetch');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;

if (!PINATA_API_KEY || !PINATA_SECRET) console.warn('Pinata keys not set in .env');

async function uploadJSONToPinata(jsonData) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET
    },
    body: JSON.stringify(jsonData)
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error('Pinata upload failed: ' + text);
  }

  const data = await r.json();
  return {
    ipfsHash: data.IpfsHash,
    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
  };
}

module.exports = { uploadJSONToPinata };
