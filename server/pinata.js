require('dotenv').config();
const fetch = require('node-fetch');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;

if (!PINATA_API_KEY || !PINATA_SECRET) {
    console.warn('⚠️ Pinata credentials not configured - IPFS upload will fail');
}

async function uploadJSONToPinata(jsonData) {
    if (!PINATA_API_KEY || !PINATA_SECRET) {
        // Fallback: return mock IPFS URL
        console.warn('📦 Using mock IPFS URL (Pinata not configured)');
        return {
            ipfsHash: 'QmMockHash' + Date.now(),
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/QmMockHash${Date.now()}`
        };
    }

    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET
        },
        body: JSON.stringify({
            pinataContent: jsonData,
            pinataMetadata: {
                name: jsonData.name || 'Unnamed Persona',
                keyvalues: {
                    type: 'persona',
                    generated: new Date().toISOString()
                }
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
        ipfsHash: data.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    };
}

module.exports = { uploadJSONToPinata };
