const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { Web3Storage } = require('web3.storage');

class BatchMinter {
  constructor(privateKey, contractAddress, contractABI, networkConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
    this.ipfsClient = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
  }

  // Mint single persona NFT
  async mintPersona(toAddress, personaMetadata, ipfsUrl) {
    try {
      const tx = await this.contract.mintPersona(
        toAddress,
        personaMetadata.name,
        personaMetadata.properties.persona_id,
        ipfsUrl,
        {
          gasLimit: 300000,
          gasPrice: ethers.utils.parseUnits('10', 'gwei')
        }
      );

      console.log(`⏳ Minting persona for ${toAddress}... TX: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Persona minted successfully! Block: ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId: this.extractTokenIdFromReceipt(receipt),
        toAddress,
        personaId: personaMetadata.properties.persona_id
      };
    } catch (error) {
      console.error(`❌ Failed to mint persona for ${toAddress}:`, error);
      return {
        success: false,
        toAddress,
        personaId: personaMetadata.properties.persona_id,
        error: error.message
      };
    }
  }

  // Mint certificate NFT (soulbound)
  async mintCertificate(studentWallet, certificateMetadata, ipfsUrl) {
    try {
      const tx = await this.contract.mintCertificate(
        studentWallet,
        certificateMetadata.name,
        certificateMetadata.properties.certificate_id,
        ipfsUrl,
        {
          gasLimit: 250000,
          gasPrice: ethers.utils.parseUnits('10', 'gwei')
        }
      );

      console.log(`⏳ Minting certificate for ${studentWallet}... TX: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Certificate minted successfully! Block: ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId: this.extractTokenIdFromReceipt(receipt),
        studentWallet,
        certificateId: certificateMetadata.properties.certificate_id
      };
    } catch (error) {
      console.error(`❌ Failed to mint certificate for ${studentWallet}:`, error);
      return {
        success: false,
        studentWallet,
        certificateId: certificateMetadata.properties.certificate_id,
        error: error.message
      };
    }
  }

  // Batch mint personas from CSV
  async batchMintPersonasFromCSV(csvFilePath, metadataMap) {
    const results = [];
    const mintData = await this.parseCSV(csvFilePath);
    
    for (const data of mintData) {
      const { walletAddress, personaId } = data;
      const personaMetadata = metadataMap[personaId];
      
      if (!personaMetadata) {
        console.warn(`⚠️  No metadata found for persona: ${personaId}`);
        continue;
      }

      // Upload metadata to IPFS
      const ipfsUrl = await this.uploadMetadataToIPFS(personaMetadata, `${personaId}_${walletAddress}.json`);
      
      // Mint NFT
      const result = await this.mintPersona(walletAddress, personaMetadata, ipfsUrl);
      results.push(result);
      
      // Add delay to avoid rate limiting
      await this.delay(2000);
    }
    
    return this.generateBatchReport(results, 'personas');
  }

  // Batch mint certificates
  async batchMintCertificates(certificateData) {
    const results = [];
    
    for (const data of certificateData) {
      const { studentWallet, personaId, achievementData } = data;
      
      // Generate certificate metadata
      const certificateMetadata = await this.generateCertificateMetadata(personaId, studentWallet, achievementData);
      
      // Upload to IPFS
      const ipfsUrl = await this.uploadMetadataToIPFS(
        certificateMetadata, 
        `certificate_${personaId}_${studentWallet}.json`
      );
      
      // Mint certificate
      const result = await this.mintCertificate(studentWallet, certificateMetadata, ipfsUrl);
      results.push(result);
      
      await this.delay(2000);
    }
    
    return this.generateBatchReport(results, 'certificates');
  }

  // Upload metadata to IPFS
  async uploadMetadataToIPFS(metadata, fileName) {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      const file = new File([jsonString], fileName, { type: 'application/json' });
      
      const cid = await this.ipfsClient.put([file], { name: fileName });
      return `ipfs://${cid}/${fileName}`;
    } catch (error) {
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  // Parse CSV file
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Extract token ID from transaction receipt
  extractTokenIdFromReceipt(receipt) {
    // Implementation depends on your contract events
    // This is a placeholder - adjust based on your contract
    if (receipt.events && receipt.events[0]) {
      return receipt.events[0].args.tokenId.toString();
    }
    return 'unknown';
  }

  // Generate batch minting report
  generateBatchReport(results, type) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    
    return {
      type,
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

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const config = {
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
    network: {
      rpcUrl: process.env.RPC_URL || 'https://dream-rpc.somnia.network/',
      chainId: 50312
    }
  };

  if (!config.privateKey) {
    console.error('❌ PRIVATE_KEY environment variable required');
    process.exit(1);
  }

  const minter = new BatchMinter(
    config.privateKey,
    config.contractAddress,
    require('../config/contracts.js').personaABI,
    config.network
  );

  switch (command) {
    case 'mint-persona':
      const [toAddress, personaId] = args.slice(1);
      await mintSinglePersona(minter, toAddress, personaId);
      break;
      
    case 'batch-mint-personas':
      const csvPath = args[1];
      await batchMintPersonas(minter, csvPath);
      break;
      
    case 'mint-certificate':
      const [studentWallet, certPersonaId, txHash, blockNum] = args.slice(1);
      await mintCertificate(minter, studentWallet, certPersonaId, txHash, blockNum);
      break;
      
    case 'batch-mint-certificates':
      const certDataPath = args[1];
      await batchMintCertificates(minter, certDataPath);
      break;
      
    default:
      console.log(`
Usage:
  node batch-mint.js mint-persona <toAddress> <personaId>
  node batch-mint.js batch-mint-personas <csvFilePath>
  node batch-mint.js mint-certificate <studentWallet> <personaId> <txHash> <blockNumber>
  node batch-mint.js batch-mint-certificates <certificateDataPath>
      `);
  }
}

async function mintSinglePersona(minter, toAddress, personaId) {
  // Implementation for single persona mint
}

async function batchMintPersonas(minter, csvPath) {
  // Implementation for batch persona mint
}

async function mintCertificate(minter, studentWallet, personaId, txHash, blockNumber) {
  // Implementation for certificate mint
}

async function batchMintCertificates(minter, certDataPath) {
  // Implementation for batch certificate mint
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BatchMinter;
