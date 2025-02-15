import { ethers } from "ethers";

// Contract details
const CONTRACT_ADDRESS = "0x7f6575CC92465D24C1091a5b252a93f6a7Ff8108";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "electionEnded",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_candidateId", "type": "uint256"}],
    "name": "getCandidate",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const getContract = async () => {
  if (!window.ethereum) {
    alert("MetaMask not found!");
    return;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
