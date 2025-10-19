const { NFTStorage, File } = require('nft.storage');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

class IPFSUploader {
  constructor() {
    this.client = new NFTStorage({ 
      token: "dd711f56.d6aea12bd1444fbcaef1929d05a8068f" 
    });
  }

  async uploadFile(filePath) {
    try {
      const fileContent = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';
      
      const file = new File([fileContent], fileName, { type: mimeType });
      const cid = await this.client.storeBlob(file);
      
      console.log(`✅ Uploaded ${fileName} to IPFS: ${cid}`);
      return `ipfs://${cid}`;
    } catch (error) {
      console.error(`❌ Failed to upload ${filePath}:`, error);
      throw error;
    }
  }

  async uploadDirectory(directoryPath) {
    try {
      const files = await this.getFilesFromDirectory(directoryPath);
      const cid = await this.client.storeDirectory(files);
      
      console.log(`✅ Uploaded directory ${directoryPath} to IPFS: ${cid}`);
      return `ipfs://${cid}`;
    } catch (error) {
      console.error(`❌ Failed to upload directory ${directoryPath}:`, error);
      throw error;
    }
  }

  async uploadJSONMetadata(metadata, fileName) {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      const file = new File([jsonString], fileName, { 
        type: 'application/json' 
      });
      
      const cid = await this.client.storeBlob(file);
      const ipfsUrl = `ipfs://${cid}`;
      
      console.log(`✅ Uploaded ${fileName} to IPFS: ${ipfsUrl}`);
      return ipfsUrl;
    } catch (error) {
      console.error(`❌ Failed to upload JSON metadata ${fileName}:`, error);
      throw error;
    }
  }

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
        console.log(`✅ Uploaded ${item.fileName}`);
      } catch (error) {
        results.push({
          ...item,
          ipfsUrl: null,
          status: 'failed',
          error: error.message
        });
        console.error(`❌ Failed ${item.fileName}:`, error.message);
      }
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

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
}

// CLI Usage
async function main() {
  const uploader = new IPFSUploader();
  
  try {
    // Upload single metadata file
    const result = await uploader.uploadFile('./metadata/personas/unuser.json');
    console.log('Upload result:', result);
    
    // Or upload entire directory
    // const dirResult = await uploader.uploadDirectory('./metadata');
    // console.log('Directory upload:', dirResult);
    
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = IPFSUploader;
