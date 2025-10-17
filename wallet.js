/*************** wallet.js (shared) ***************/
const SOMNIA_NETWORK = {
  chainId: '0xC468', // 50312 in hex ✅ SESUAI SCREENSHOT
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
const ADDR = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const ABI  = ["function mintMyPersona(string memory name,string memory specialization,string memory uri) public returns (uint256)",
              "function getPersonasByOwner(address owner) public view returns (uint256[] memory)",
              "function ownerOf(uint256 tokenId) public view returns (address)",
              "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"];

let provider, signer, contract, userAddr;

async function connectWallet(){
  if(!window.ethereum){alert("Install MetaMask / Brave");return null;}
  try{
    await ethereum.request({method:'wallet_addEthereumChain',params:[SOMNIA]});
    const accounts = await ethereum.request({method:'eth_requestAccounts'});
    userAddr = accounts[0];
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer   = provider.getSigner();
    contract = new ethers.Contract(ADDR,ABI,signer);
    localStorage.setItem("walletAddress",userAddr);
    localStorage.setItem("walletConnected","true");
    return userAddr;
  }catch(e){console.error(e);return null;}
}

async function autoConnect(){
  if(localStorage.getItem("walletConnected")!=="true")return;
  const addr = localStorage.getItem("walletAddress");
  if(!addr)return;
  userAddr = addr;
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer   = provider.getSigner();
  contract = new ethers.Contract(ADDR,ABI,signer);
}
// otomatis coba connect saat halaman load
autoConnect();

async function voteOnChain(personaId){
  if(!contract){alert("Connect wallet first");return;}
  try{
    const tx = await contract.mintMyPersona("Vote-"+personaId,"Arena-Vote","https://rivalismeuniverse.com/vote/"+personaId);
    console.log("TX sent:",tx.hash);
    alert("⏳ Voting…\n"+tx.hash.slice(0,20)+'…');
    await tx.wait();
    alert("✅ Voted on-chain!\n\nLihat: https://shannon-explorer.somnia.network/tx/"+tx.hash);
    window.open("https://shannon-explorer.somnia.network/tx/"+tx.hash,'_blank');
  }catch(e){alert("❌ "+(e.reason||e.message));}
}
