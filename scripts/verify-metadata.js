const { ethers } = require('ethers');
const axios = require('axios');

class MetadataVerifier {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider('https://dream-rpc.somnia.network/');
    this.contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
    
    // Minimal ABI for tokenURI
    this.contractABI = [
      "function tokenURI(uint256 tokenId) external view returns (string memory)"
    ];
    
    this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
  }

  async verifyTokenMetadata(tokenId, expectedMetadata) {
    try {
      console.log(`🔍 Verifying token ${tokenId}...`);
      
      const tokenURI = await this.contract.tokenURI(tokenId);
      console.log(`📡 On-chain URI: ${tokenURI}`);
      
      const ipfsHash = tokenURI.replace('ipfs://', '');
      const actualMetadata = await this.fetchIPFSMetadata(ipfsHash);
      
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
      console.error(`❌ Failed to verify token ${tokenId}:`, error.message);
      return {
        tokenId,
        verified: false,
        error: error.message
      };
    }
  }

  async fetchIPFSMetadata(ipfsHash) {
    try {
      const gatewayURL = `https://ipfs.io/ipfs/${ipfsHash}`;
      const response = await axios.get(gatewayURL, { timeout: 10000 });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch IPFS metadata: ${error.message}`);
    }
  }

  compareMetadata(expected, actual) {
    const differences = [];
    let verified = true;

    const criticalFields = ['name', 'description', 'image'];
    
    for (const field of criticalFields) {
      if (expected[field] !== actual[field]) {
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

  async verifyPersonaTokens(personaId, expectedMetadataArray) {
    const results = [];
    
    for (const expectedMetadata of expectedMetadataArray) {
      const result = await this.verifyTokenMetadata(expectedMetadata.tokenId, expectedMetadata);
      results.push(result);
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return this.generateVerificationReport(results, personaId);
  }

  generateVerificationReport(results, personaId) {
    const total = results.length;
    const verified = results.filter(r => r.verified).length;
    const failed = total - verified;
    
    return {
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
  }
}

// Example usage
async function main() {
  const verifier = new MetadataVerifier();
  
  // Example token verification
  const tokenId = 1;
  const expectedMetadata = {
    name: "Unuser - Chaos Critic",
    description: "An AI persona embodying brutal honesty and satirical social critique...",
    image: "ipfs://QmUnuserOrigami/unuser.png"
  };
  
  const result = await verifier.verifyTokenMetadata(tokenId, expectedMetadata);
  console.log('Verification result:', result);
}

module.exports = MetadataVerifier;
