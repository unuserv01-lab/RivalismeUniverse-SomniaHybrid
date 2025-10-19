const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class MetadataVerifier {
  constructor(providerUrl, contractAddress, contractABI) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
  }

  // Verify metadata matches on-chain data
  async verifyTokenMetadata(tokenId, expectedMetadata) {
    try {
      // Get on-chain token URI
      const tokenURI = await this.contract.tokenURI(tokenId);
      console.log(`📡 Token ${tokenId} URI: ${tokenURI}`);
      
      // Fetch actual metadata from IPFS
      const ipfsHash = tokenURI.replace('ipfs://', '');
      const actualMetadata = await this.fetchIPFSMetadata(ipfsHash);
      
      // Compare critical fields
      const verificationResult = this.compareMetadata(expectedMetadata, actualMetadata);
      
      return {
        tokenId,
        verified: verificationResult.verified,
        differences: verificationResult.differences,
        tokenURI,
        onChain: actualMetadata,
        expected: expectedMetadata
      };
    } catch (error) {
      console.error(`❌ Failed to verify token ${tokenId}:`, error);
      return {
        tokenId,
        verified: false,
        error: error.message
      };
    }
  }

  // Fetch metadata from IPFS
  async fetchIPFSMetadata(ipfsHash) {
    try {
      const gatewayURL = `https://ipfs.io/ipfs/${ipfsHash}`;
      const response = await axios.get(gatewayURL, { timeout: 10000 });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch IPFS metadata: ${error.message}`);
    }
  }

  // Compare two metadata objects
  compareMetadata(expected, actual) {
    const differences = [];
    let verified = true;

    // Check critical fields
    const criticalFields = ['name', 'description', 'image', 'attributes'];
    
    for (const field of criticalFields) {
      if (!this.deepEqual(expected[field], actual[field])) {
        differences.push({
          field,
          expected: expected[field],
          actual: actual[field]
        });
        verified = false;
      }
    }

    return { verified, differences };
  }

  // Deep equal comparison
  deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  // Verify all tokens for a specific persona
  async verifyPersonaTokens(personaId, expectedMetadataArray) {
    const results = [];
    
    for (const expectedMetadata of expectedMetadataArray) {
      const tokenId = expectedMetadata.properties.persona_id;
      const result = await this.verifyTokenMetadata(tokenId, expectedMetadata);
      results.push(result);
    }
    
    return this.generateVerificationReport(results, personaId);
  }

  // Generate verification report
  generateVerificationReport(results, personaId) {
    const total = results.length;
    const verified = results.filter(r => r.verified).length;
    const failed = total - verified;
    
    const report = {
      personaId,
      timestamp: new Date().toISOString(),
      summary: {
        total,
        verified,
        failed,
        successRate: (verified / total * 100).toFixed(2) + '%'
      },
      details: results
    };
    
    return report;
  }

  // Batch verify multiple tokens
  async batchVerify(tokenIds, expectedMetadataMap) {
    const results = [];
    
    for (const tokenId of tokenIds) {
      const expectedMetadata = expectedMetadataMap[tokenId];
      if (expectedMetadata) {
        const result = await this.verifyTokenMetadata(tokenId, expectedMetadata);
        results.push(result);
      }
    }
    
    return results;
  }

  // Verify certificate metadata
  async verifyCertificate(certificateId, studentWallet) {
    try {
      // Implementation for certificate verification
      // This would check certificate-specific fields
      return {
        certificateId,
        studentWallet,
        verified: true,
        message: 'Certificate verification logic to be implemented'
      };
    } catch (error) {
      return {
        certificateId,
        studentWallet,
        verified: false,
        error: error.message
      };
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const config = {
    providerUrl: process.env.RPC_URL || 'https://dream-rpc.somnia.network/',
    contractAddress: process.env.CONTRACT_ADDRESS,
    contractABI: require('../config/contracts.js').personaABI
  };

  const verifier = new MetadataVerifier(
    config.providerUrl,
    config.contractAddress,
    config.contractABI
  );

  switch (command) {
    case 'verify-token':
      const tokenId = args[1];
      const metadataPath = args[2];
      await verifySingleToken(verifier, tokenId, metadataPath);
      break;
      
    case 'verify-persona':
      const personaId = args[1];
      await verifyPersonaTokens(verifier, personaId);
      break;
      
    case 'batch-verify':
      const tokenListPath = args[1];
      await batchVerifyTokens(verifier, tokenListPath);
      break;
      
    case 'verify-certificate':
      const [certId, wallet] = args.slice(1);
      await verifier.verifyCertificate(certId, wallet);
      break;
      
    default:
      console.log(`
Usage:
  node verify-metadata.js verify-token <tokenId> <metadataPath>
  node verify-metadata.js verify-persona <personaId>
  node verify-metadata.js batch-verify <tokenListPath>
  node verify-metadata.js verify-certificate <certificateId> <studentWallet>
      `);
  }
}

async function verifySingleToken(verifier, tokenId, metadataPath) {
  // Implementation for single token verification
}

async function verifyPersonaTokens(verifier, personaId) {
  // Implementation for persona tokens verification
}

async function batchVerifyTokens(verifier, tokenListPath) {
  // Implementation for batch verification
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MetadataVerifier;
