export const E_VOTING_CONTRACT_ADDRESS = "0x9e93Fa26D51289863c5AEE7a68f5a1c4354eE623";

export const E_VOTING_ABI = [
 {
   "inputs": [],
   "stateMutability": "nonpayable",
   "type": "constructor"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": true,
       "internalType": "address",
       "name": "previousOwner",
       "type": "address"
     },
     {
       "indexed": true,
       "internalType": "address",
       "name": "newOwner",
       "type": "address"
     }
   ],
   "name": "OwnershipTransferred",
   "type": "event"
 },
 {
   "inputs": [],
   "name": "endElection",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "owner",
   "outputs": [
     {
       "internalType": "address",
       "name": "",
       "type": "address"
     }
   ],
   "stateMutability": "view",
   "type": "function"
 },
 {
   "inputs": [
     {
       "internalType": "address",
       "name": "_Address",
       "type": "address"
     },
     {
       "internalType": "string",
       "name": "_name",
       "type": "string"
     }
   ],
   "name": "registerCandidate",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "renounceOwnership",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "startElection",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "state",
   "outputs": [
     {
       "internalType": "enum E_Voting.State",
       "name": "",
       "type": "uint8"
     }
   ],
   "stateMutability": "view",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "totalCandidates",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "totalElections",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function"
 },
 {
   "inputs": [],
   "name": "totalVoters",
   "outputs": [
     {
       "internalType": "uint256",
       "name": "",
       "type": "uint256"
     }
   ],
   "stateMutability": "view",
   "type": "function"
 },
 {
   "inputs": [
     {
       "internalType": "address",
       "name": "newOwner",
       "type": "address"
     }
   ],
   "name": "transferOwnership",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "inputs": [
     {
       "internalType": "uint256",
       "name": "_CandidateId",
       "type": "uint256"
     },
     {
       "internalType": "address",
       "name": "voterAddress",
       "type": "address"
     }
   ],
   "name": "vote",
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
 }
];