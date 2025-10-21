require('dotenv').config();
const { generatePersonaJSON } = require('./ai-client');
const { searchFreepikImage } = require('./freepik');
const { uploadJSONToPinata } = require('./pinata');
const { buildMetadataFromPersona } = require('../scripts/generate-metadata');
const path = require('path');
const fs = require('fs').promises;

function buildMetadata(personaData) {
  // Use existing generator if available, otherwise fallback
  try {
    if (typeof buildMetadataFromPersona === 'function') {
      return buildMetadataFromPersona(personaData);
    }
  } catch (e) {
    console.warn('generate-metadata builder not available, using fallback');
  }
  // fallback
  const timestamp = new Date().toISOString();
  return {
    name: personaData.name || `Unnamed Persona ${Date.now()}`,
    description: personaData.description || '',
    image: personaData.image || '',
    attributes: (personaData.traits || []).map(t => ({ trait_type: 'Trait', value: t })),
    properties: { created_at: timestamp }
  };
}

async function generateAndPublish(prompt) {
  // 1. Generate persona JSON from AI
  const personaData = await generatePersonaJSON(prompt);
  personaData.origin_prompt = prompt;

  // 2. Get image (freepik) or fallback to local asset
  let imageUrl = await searchFreepikImage(personaData.visual_prompt || personaData.name);
  if (!imageUrl) {
    imageUrl = `${process.env.SERVER_BASE_URL || 'http://localhost:3000'}/assets/placeholder.jpg`;
  }
  personaData.image = imageUrl;

  // 3. Build metadata (NFT friendly)
  const metadata = buildMetadata(personaData);
  metadata.image = personaData.image;

  // 4. Upload metadata to Pinata
  const pinRes = await uploadJSONToPinata(metadata);

  // 5. Save a local copy of metadata for record
  const savePath = path.join(__dirname, '..', 'generated_metadata');
  await fs.mkdir(savePath, { recursive: true });
  const uniqueId = metadata.properties && metadata.properties.unique_id ? metadata.properties.unique_id : `persona-${Date.now()}`;
  await fs.writeFile(path.join(savePath, `${uniqueId}.json`), JSON.stringify({ metadata, pinRes, personaData }, null, 2));

  // 6. Return result for frontend
  return {
    persona: personaData,
    metadata,
    ipfsUrl: pinRes.ipfsUrl,
    ipfsHash: pinRes.ipfsHash,
    imageUrl
  };
}

module.exports = { generateAndPublish };
