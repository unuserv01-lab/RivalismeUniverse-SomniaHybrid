const { Web3Storage } = require('web3.storage');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

class IPFSUploader {
  constructor(apiToken) {
    this.client = new Web3Storage({ token: apiToken });
  }

  // Upload single file to IPFS
  async uploadFile(filePath) {
    try {
      const fileContent = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';
      
      const file = new File([fileContent], fileName, { type: mimeType });
      const cid = await this.client.put([file], {
        name: fileName,
        maxRetries: 3
      });
      
      console.log(`✅ Uploaded ${fileName} to IPFS: ${cid}`);
      return `ipfs://${cid}/${fileName}`;
    } catch (error) {
      console.error(`❌ Failed to upload ${filePath}:`, error);
      throw error;
    }
  }

  // Upload directory to IPFS
  async uploadDirectory(directoryPath) {
    try {
      const files = await this.getFilesFromDirectory(directoryPath);
      const cid = await this.client.put(files, {
        name: path.basename(directoryPath),
        maxRetries: 3
      });
      
      console.log(`✅ Uploaded directory ${directoryPath} to IPFS: ${cid}`);
      return `ipfs://${cid}`;
    } catch (error) {
      console.error(`❌ Failed to upload directory ${directoryPath}:`, error);
      throw error;
    }
  }

  // Upload JSON metadata
  async uploadJSONMetadata(metadata, fileName) {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      const file = new File([jsonString], fileName, { 
        type: 'application/json' 
      });
      
      const cid = await this.client.put([file], {
        name: fileName,
        maxRetries: 3
      });
      
      const ipfsUrl = `ipfs://${cid}/${fileName}`;
      console.log(`✅ Uploaded ${fileName} to IPFS: ${ipfsUrl}`);
      return ipfsUrl;
    } catch (error) {
      console.error(`❌ Failed to upload JSON metadata ${fileName}:`, error);
      throw error;
    }
  }

  // Batch upload metadata files
  async batchUploadMetadata(metadataArray, basePath = 'metadata') {
    const results = [];
    
    for (const item of metadataArray) {
      try {
        const ipfsUrl = await this.uploadJSONMetadata(
          item.metadata, 
          `${basePath}/${item.fileName}`
        );
        results.push({
          ...item,
          ipfsUrl,
          status: 'success'
        });
      } catch (error) {
        results.push({
          ...item,
          ipfsUrl: null,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get files from directory recursively
  async getFilesFromDirectory(dirPath) {
    const files = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subFiles = await this.getFilesFromDirectory(fullPath);
        files.push(...subFiles);
      } else {
        const content = await fs.readFile(fullPath);
        const relativePath = path.relative(process.cwd(), fullPath);
        const file = new File([content], relativePath, {
          type: mime.lookup(fullPath) || 'application/octet-stream'
        });
        files.push(file);
      }
    }
    
    return files;
  }

  // Check upload status
  async checkStatus(cid) {
    try {
      const status = await this.client.status(cid);
      return status;
    } catch (error) {
      console.error(`❌ Failed to check status for ${cid}:`, error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const apiToken = process.env.WEB3_STORAGE_TOKEN;
  if (!apiToken) {
    console.error('❌ WEB3_STORAGE_TOKEN environment variable required');
    process.exit(1);
  }

  const uploader = new IPFSUploader(apiToken);

  switch (command) {
    case 'upload-file':
      const filePath = args[1];
      await uploader.uploadFile(filePath);
      break;
      
    case 'upload-dir':
      const dirPath = args[1];
      await uploader.uploadDirectory(dirPath);
      break;
      
    case 'upload-metadata':
      const metadataPath = args[1];
      await uploadMetadataBatch(uploader, metadataPath);
      break;
      
    case 'check-status':
      const cid = args[1];
      const status = await uploader.checkStatus(cid);
      console.log('Upload status:', status);
      break;
      
    default:
      console.log(`
Usage:
  node upload-to-ipfs.js upload-file <filePath>
  node upload-to-ipfs.js upload-dir <directoryPath>
  node upload-to-ipfs.js upload-metadata <metadataDirectory>
  node upload-to-ipfs.js check-status <cid>
      `);
  }
}

async function uploadMetadataBatch(uploader, metadataPath) {
  // Implementation for batch metadata upload
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = IPFSUploader;
