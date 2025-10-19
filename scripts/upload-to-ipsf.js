const { NFTStorage, File } = require('nft.storage');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

class IPFSUploader {
  constructor(apiToken) {
    this.client = new NFTStorage({ token: apiToken });
  }

  // Upload single file to IPFS
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

  // Upload directory to IPFS (NFT.Storage handle directories well)
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

  // Upload JSON metadata (special method for NFT metadata)
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

  // Upload complete NFT with metadata and image
  async uploadNFT(metadata, imagePath, fileName) {
    try {
      const imageContent = await fs.readFile(imagePath);
      const imageFile = new File([imageContent], path.basename(imagePath), {
        type: mime.lookup(imagePath) || 'image/png'
      });

      const metadataFile = new File(
        [JSON.stringify(metadata, null, 2)], 
        fileName,
        { type: 'application/json' }
      );

      const cid = await this.client.storeDirectory([imageFile, metadataFile]);
      
      console.log(`✅ Uploaded NFT to IPFS: ${cid}`);
      return {
        metadataUrl: `ipfs://${cid}/${fileName}`,
        imageUrl: `ipfs://${cid}/${path.basename(imagePath)}`
      };
    } catch (error) {
      console.error(`❌ Failed to upload NFT:`, error);
      throw error;
    }
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

  // Check storage status (NFT.Storage specific)
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
