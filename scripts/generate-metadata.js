const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MetadataGenerator {
  constructor(config) {
    this.config = config;
    this.baseURI = config.baseURI;
  }

  // Generate unique ID for each token
  generateTokenId(personaId) {
    return `${personaId}_${uuidv4().slice(0, 8)}`;
  }

  // Replace template variables in metadata
  replaceTemplateVariables(metadata, variables) {
    const jsonString = JSON.stringify(metadata);
    const replacedString = jsonString.replace(
      /\[(WALLET_ADDRESS|TOKEN_ID|TX_HASH|UNIQUE_ID)\]/g, 
      (match, variable) => variables[variable] || match
    );
    return JSON.parse(replacedString);
  }

  // Generate persona NFT metadata
  async generatePersonaMetadata(personaData, walletAddress) {
    const tokenId = this.generateTokenId(personaData.persona_id);
    
    const variables = {
      WALLET_ADDRESS: walletAddress,
      TOKEN_ID: tokenId,
      UNIQUE_ID: tokenId
    };

    const metadata = this.replaceTemplateVariables(personaData, variables);
    
    // Add generation timestamp
    metadata.generated_at = new Date().toISOString();
    metadata.generator_version = "1.0.0";
    
    return {
      metadata,
      tokenId,
      fileName: `${personaData.properties.persona_id}_${walletAddress}.json`
    };
  }

  // Generate certificate metadata
  async generateCertificateMetadata(certificateTemplate, studentWallet, achievementData) {
    const tokenId = this.generateTokenId(certificateTemplate.properties.certificate_id);
    
    const variables = {
      WALLET_ADDRESS: studentWallet,
      TOKEN_ID: tokenId,
      TX_HASH: achievementData.txHash,
      UNIQUE_ID: tokenId
    };

    const metadata = this.replaceTemplateVariables(certificateTemplate, variables);
    
    // Merge achievement data
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

  // Batch generate all personas for a wallet
  async batchGeneratePersonas(walletAddress, personaTypes = ['all']) {
    const results = [];
    
    for (const personaType of personaTypes) {
      const personas = await this.loadPersonasByType(personaType);
      
      for (const persona of personas) {
        try {
          const result = await this.generatePersonaMetadata(persona, walletAddress);
          results.push(result);
          console.log(`✅ Generated ${persona.name} metadata`);
        } catch (error) {
          console.error(`❌ Failed to generate ${persona.name}:`, error);
        }
      }
    }
    
    return results;
  }

  // Load personas by type
  async loadPersonasByType(personaType) {
    const basePath = path.join(__dirname, '../metadata/personas');
    let personas = [];

    if (personaType === 'all' || personaType === 'content-creator') {
      const contentCreatorPath = path.join(basePath, 'content-creator');
      const files = await fs.readdir(contentCreatorPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(contentCreatorPath, file), 'utf8');
          personas.push(JSON.parse(content));
        }
      }
    }

    if (personaType === 'all' || personaType === 'academic-hall') {
      const academicPath = path.join(basePath, 'academic-hall');
      const files = await fs.readdir(academicPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(academicPath, file), 'utf8');
          personas.push(JSON.parse(content));
        }
      }
    }

    if (personaType === 'all' || personaType === 'easter-egg') {
      const easterEggPath = path.join(basePath, 'easter-egg');
      const files = await fs.readdir(easterEggPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(easterEggPath, file), 'utf8');
          personas.push(JSON.parse(content));
        }
      }
    }

    return personas;
  }

  // Save metadata to file
  async saveMetadata(metadata, fileName, outputPath) {
    const fullPath = path.join(outputPath, fileName);
    await fs.writeFile(fullPath, JSON.stringify(metadata, null, 2));
    return fullPath;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const config = {
    baseURI: "ipfs://QmRivalismeUniverse",
    outputPath: "./generated-metadata"
  };

  const generator = new MetadataGenerator(config);

  switch (command) {
    case 'generate-persona':
      const [personaName, walletAddress] = args.slice(1);
      await generateSinglePersona(generator, personaName, walletAddress);
      break;
      
    case 'batch-generate':
      const [wallet, types = 'all'] = args.slice(1);
      await batchGenerate(generator, wallet, types.split(','));
      break;
      
    case 'generate-certificate':
      const [personaId, studentWallet, txHash, blockNumber] = args.slice(1);
      await generateCertificate(generator, personaId, studentWallet, txHash, blockNumber);
      break;
      
    default:
      console.log(`
Usage:
  node generate-metadata.js generate-persona <personaName> <walletAddress>
  node generate-metadata.js batch-generate <walletAddress> [types]
  node generate-metadata.js generate-certificate <personaId> <studentWallet> <txHash> <blockNumber>
  
Types: content-creator, academic-hall, easter-egg, all
      `);
  }
}

async function generateSinglePersona(generator, personaName, walletAddress) {
  // Implementation for single persona generation
}

async function batchGenerate(generator, walletAddress, types) {
  // Implementation for batch generation
}

async function generateCertificate(generator, personaId, studentWallet, txHash, blockNumber) {
  // Implementation for certificate generation
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MetadataGenerator;
