const { ethers } = require('ethers');
const { NFTStorage, File } = require('nft.storage');

class BatchMinter {
  constructor() {
    // Setup blockchain connection
    this.provider = new ethers.providers.JsonRpcProvider('https://dream-rpc.somnia.network/');
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Contract setup
    this.contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
    this.contractABI = [
      "function mintMyPersona(string name, string specialization, string uri) external returns (uint256)",
      "function tokenURI(uint256 tokenId) external view returns (string memory)",
      "event PersonaMinted(address indexed owner, uint256 indexed tokenId, string name, string specialization)"
    ];
    
    this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
    
    // IPFS setup
    this.ipfsClient = new NFTStorage({ 
      token: "dd711f56.d6aea12bd1444fbcaef1929d05a8068f" 
    });
  }

  async mintPersona(personaMetadata) {
    try {
      console.log(`🎯 Minting ${personaMetadata.name}...`);
      
      // Upload metadata to IPFS first
      const ipfsUrl = await this.uploadMetadataToIPFS(personaMetadata);
      console.log(`📦 Metadata uploaded: ${ipfsUrl}`);
      
      // Mint NFT
      const tx = await this.contract.mintMyPersona(
        personaMetadata.name,
        personaMetadata.properties.persona_id,
        ipfsUrl,
        {
          gasLimit: 300000,
          gasPrice: ethers.utils.parseUnits('10', 'gwei')
        }
      );

      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Minted successfully! Block: ${receipt.blockNumber}`);
      
      // Extract token ID from event
      const tokenId = this.extractTokenIdFromReceipt(receipt);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId: tokenId,
        ipfsUrl: ipfsUrl,
        persona: personaMetadata.name
      };
    } catch (error) {
      console.error(`❌ Failed to mint ${personaMetadata.name}:`, error.message);
      return {
        success: false,
        persona: personaMetadata.name,
        error: error.message
      };
    }
  }

  async uploadMetadataToIPFS(metadata) {
    try {
      const fileName = `${metadata.properties.persona_id}_${Date.now()}.json`;
      const jsonString = JSON.stringify(metadata, null, 2);
      const file = new File([jsonString], fileName, { type: 'application/json' });
      
      const cid = await this.ipfsClient.storeBlob(file);
      return `ipfs://${cid}`;
    } catch (error) {
      throw new Error(`NFT.Storage upload failed: ${error.message}`);
    }
  }

  extractTokenIdFromReceipt(receipt) {
    try {
      // Look for PersonaMinted event
      const event = receipt.events.find(e => e.event === 'PersonaMinted');
      return event ? event.args.tokenId.toString() : 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  async batchMintPersonas(personaMetadataArray) {
    const results = [];
    
    for (const personaMetadata of personaMetadataArray) {
      const result = await this.mintPersona(personaMetadata);
      results.push(result);
      
      // Add delay between mints
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return this.generateBatchReport(results);
  }

  generateBatchReport(results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        successful,
        failed,
        successRate: (successful / total * 100).toFixed(2) + '%'
      },
      details: results
    };
  }
}

// Example usage
async function main() {
  const minter = new BatchMinter();
  
  // Example persona metadata
  const personaMetadata = {
    name: "Unuser - Chaos Critic",
    description: "An AI persona embodying brutal honesty and satirical social critique...",
    properties: {
      persona_id: "unuser_001",
      // ... other properties
    }
  };
  
  const result = await minter.mintPersona(personaMetadata);
  console.log('Mint result:', result);
}

module.exports = BatchMinter;
