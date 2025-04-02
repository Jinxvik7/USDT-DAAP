import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

// Replace with your token contract address and ABI
const TOKEN_CONTRACT_ADDRESS = "0xA2e8975EF5344e1cE15732E660ce6bBDE7CFCe0A";
const TOKEN_ABI = [
  // Paste your ABI here
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
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
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
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
    "name": "totalSupply",
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
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (isConnected && address) {
      fetchTokenData(address);
    }
  }, [isConnected, address]);

  const fetchTokenData = async (userAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);

    // Fetch token balance
    const balance = await tokenContract.balanceOf(userAddress);
    setBalance(ethers.utils.formatUnits(balance, 6)); // Adjust decimals (6 for USDT)
  };

  const addTokenToWallet = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: TOKEN_CONTRACT_ADDRESS,
            symbol: "USDT", // Replace with your token symbol
            decimals: 6, // Replace with your token decimals
            image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png", // Optional: Add a URL to your token logo
          },
        },
      });
      alert("Token added to wallet successfully!");
    } catch (error) {
      console.error("Error adding token to wallet:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>My Token dApp</h1>
      {isConnected ? (
        <div>
          <p>Connected Wallet: {address}</p>
          <p>Token Balance: {balance} USDT</p>
          <button onClick={addTokenToWallet} style={{ marginTop: "10px", padding: "10px" }}>
            Add USDT to Wallet
          </button>
          <button onClick={disconnect} style={{ marginTop: "10px", padding: "10px", marginLeft: "10px" }}>
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <p>Connect your wallet to view token details</p>
          <button onClick={() => connect()} style={{ padding: "10px" }}>
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
