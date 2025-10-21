const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MetadataGenerator {
  constructor(config) {
    this.config = config;
    this.baseURI = config.baseURI;
  }

  generateTokenId(personaId) {
    return `${personaId}_${uuidv4().slice(0, 8)}`;
    
  }

  replaceTemplateVariables(metadata, variables) {
    const jsonString = JSON.stringify(metadata);
    const replacedString = jsonString.replace(
      /\[(WALLET_ADDRESS|TOKEN_ID|TX_HASH|UNIQUE_ID)\]/g, 
      (match, variable) => variables[variable] || match
    );
    return JSON.parse(replacedString);
  }

  async generatePersonaMetadata(personaData, walletAddress) {
    const tokenId = this.generateTokenId(personaData.persona_id);
    
    const variables = {
      WALLET_ADDRESS: walletAddress,
      TOKEN_ID: tokenId,
      UNIQUE_ID: tokenId
    };

    const metadata = this.replaceTemplateVariables(personaData, variables);
    metadata.generated_at = new Date().toISOString();
    metadata.generator_version = "1.0.0";
    
    return {
      metadata,
      tokenId,
      fileName: `${personaData.properties.persona_id}_${walletAddress}.json`
    };
  }

  async generateCertificateMetadata(certificateTemplate, studentWallet, achievementData) {
    const tokenId = this.generateTokenId(certificateTemplate.properties.certificate_id);
    
    const variables = {
      WALLET_ADDRESS: studentWallet,
      TOKEN_ID: tokenId,
      TX_HASH: achievementData.txHash,
      UNIQUE_ID: tokenId
    };

    const metadata = this.replaceTemplateVariables(certificateTemplate, variables);
    metadata.student_achievements = {
      ...metadata.student_achievements,
      ...achievementData.achievements
    };

    metadata.properties.blockchain_proof = {
      ...metadata.properties.blockchain_proof,
      transaction_hash: achievementData.txHash,
      block_number: achievementData.blockNumber
    };

    metadata.generated_at = new Date().toISOString();
    metadata.generator_version = "1.0.0";

    return {
      metadata,
      tokenId,
      fileName: `${certificateTemplate.properties.certificate_id}_${studentWallet}.json`
    };
  }

  async saveMetadata(metadata, fileName, outputPath) {
    const fullPath = path.join(outputPath, fileName);
    await fs.writeFile(fullPath, JSON.stringify(metadata, null, 2));
    return fullPath;
  }
}

// Example usage
async function main() {
  const config = {
    baseURI: "ipfs://QmRivalismeUniverse",
    outputPath: "./generated-metadata"
  };

  const generator = new MetadataGenerator(config);
  
  // Example: Generate for specific wallet
  const walletAddress = "0x742C2c8BF8eE6e6d0A463d6E6E2bA4b4b192e6e6";
  const results = await generator.batchGeneratePersonas(walletAddress, ['all']);
  
  console.log(`Generated ${results.length} metadata files`);
}

module.exports = MetadataGenerator;


// Exported helper to build metadata from personaData (for server integration)
if (typeof module !== 'undefined' && module.exports) {
  module.exports.buildMetadataFromPersona = function(personaData, overrides = {}) {
    // Reuse existing generateMetadata logic by calling the main function if present
    // If the original file exported a function, prefer that. Otherwise, implement a lightweight builder.
    try {
      if (typeof generateMetadata === 'function') {
        // if original had a generateMetadata function that returns metadata, call it
        return generateMetadata(personaData, overrides);
      }
    } catch (e) {
      // fallthrough to simple builder
    }

    // Simple fallback metadata builder
    const name = personaData.name || overrides.name || `Unnamed Persona ${Date.now()}`;
    const description = personaData.description || overrides.description || '';
    const traits = personaData.traits || overrides.traits || [];
    const visual = personaData.visual_prompt || personaData.visual || '';
    const timestamp = new Date().toISOString();

    const metadata = {
      name,
      description,
      image: personaData.image || overrides.image || '',
      attributes: traits.map(t => ({ trait_type: 'trait', value: t })),
      properties: {
        visual_prompt: visual,
        created_at: timestamp
      }
    };

    return metadata;
  };
}
