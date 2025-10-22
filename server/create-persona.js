require('dotenv').config();
const { callDeepseek } = require('./ai-client');
const { uploadJSONToPinata } = require('./pinata');

async function generateAndPublish(prompt) {
    console.log('🎭 Generating persona from prompt:', prompt);

    // 1. Generate persona JSON from Deepseek
    const personaData = await callDeepseek(prompt);
    personaData.origin_prompt = prompt;
    personaData.created_at = new Date().toISOString();

    // 2. Use placeholder image (you can integrate Freepik later)
    const imageUrl = `${process.env.SERVER_BASE_URL || 'http://localhost:3000'}/assets/images/placeholder.jpg`;
    personaData.image = imageUrl;

    // 3. Build NFT metadata
    const metadata = {
        name: personaData.name,
        description: personaData.description,
        image: imageUrl,
        attributes: personaData.traits.map(trait => ({
            trait_type: 'Trait',
            value: trait
        })),
        properties: {
            persona_id: `persona_${Date.now()}`,
            created_at: personaData.created_at,
            visual_prompt: personaData.visual_prompt,
            origin_prompt: prompt
        }
    };

    // 4. Upload to Pinata
    console.log('📤 Uploading to IPFS...');
    const pinataResult = await uploadJSONToPinata(metadata);

    // 5. Return complete result
    return {
        persona: personaData,
        metadata,
        ipfsUrl: pinataResult.ipfsUrl,
        ipfsHash: pinataResult.ipfsHash,
        imageUrl
    };
}

module.exports = { generateAndPublish };
