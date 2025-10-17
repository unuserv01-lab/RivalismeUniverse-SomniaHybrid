// ============================================
// SOMNIA TESTNET CONTRACT CONFIGURATION
// ============================================

const SOMNIA_NETWORK = {
  chainId: '0xC468',
  chainIdDecimal: 50312,
  chainName: 'Somnia Testnet',
  rpcUrls: ['https://dream-rpc.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'], // Sesuai screenshot
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18
  }
};

  // Contract Info
  contract: {
    address: "0xd9145CCE52D386f254917e481eB44e9943F39138",
    deployedDate: "October 14, 2025"
  },

  // Contract ABI (simplified for key functions)
  abi: [
    // Read Functions
    "function totalSupply() public view returns (uint256)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function getPersona(uint256 tokenId) public view returns (string memory name, string memory specialization, uint256 mintedAt, address creator, address currentOwner)",
    "function getPersonasByOwner(address owner) public view returns (uint256[] memory)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    
    // Write Functions
    "function mintMyPersona(string memory name, string memory specialization, string memory uri) public returns (uint256)",
    "function approve(address to, uint256 tokenId) public",
    "function transferFrom(address from, address to, uint256 tokenId) public"
  ]
};

// Export untuk dipakai di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SOMNIA_CONFIG;
}
