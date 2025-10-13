```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SomniaPersonaNFT
 * @dev NFT contract for AI Personas in RivalismeUniverse
 */
contract SomniaPersonaNFT is ERC721, Ownable {
    uint256 public tokenIdCounter;
    
    struct Persona {
        string name;
        string specialization;
        string metadataURI;
        uint256 mintedAt;
    }
    
    mapping(uint256 => Persona) public personas;
    mapping(address => uint256[]) public userPersonas;
    
    event PersonaMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string name,
        string specialization
    );

    constructor() ERC721("SomniaPersona", "SPNFT") Ownable(msg.sender) {}

    function mintPersona(
        string calldata name,
        string calldata spec,
        string calldata uri
    ) external returns (uint256) {
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        personas[tokenId] = Persona({
            name: name,
            specialization: spec,
            metadataURI: uri,
            mintedAt: block.timestamp
        });
        
        userPersonas[msg.sender].push(tokenId);
        
        emit PersonaMinted(msg.sender, tokenId, name, spec);
        return tokenId;
    }

    function getPersonasByOwner(address owner) external view returns (uint256[] memory) {
        return userPersonas[owner];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return personas[tokenId].metadataURI;
    }

    function getPersona(uint256 tokenId) external view returns (Persona memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return personas[tokenId];
    }
}
