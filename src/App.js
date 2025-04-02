import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

const TOKEN_CONTRACT_ADDRESS = "0xA2e8975EF5344e1cE15732E660ce6bBDE7CFCe0A";
const TOKEN_ABI = [
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
  const { connect, connectors } = useConnect({
    connectors: [
      new InjectedConnector(), // For Trust Wallet/MetaMask
      new CoinbaseWalletConnector({
        options: {
          appName: 'USDT dApp',
          jsonRpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
        }
      })
    ]
  });
  const { disconnect } = useDisconnect();

  const [balance, setBalance] = useState("0");
  const [price, setPrice] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    setIsMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
    
    if (isConnected && address) {
      fetchTokenData(address);
      fetchPrice();
    }
  }, [isConnected, address]);

  const fetchTokenData = async (userAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);
      const balance = await tokenContract.balanceOf(userAddress);
      setBalance(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
      const data = await response.json();
      setPrice(data.tether.usd);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  const addTokenToWallet = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: TOKEN_CONTRACT_ADDRESS,
            symbol: "USDT",
            decimals: 6,
            image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png", // USDT logo
          },
        },
      });
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

  const handleCoinbaseWallet = () => {
    if (isMobile) {
      window.location.href = `https://go.cb-w.com/dapp?url=${encodeURIComponent(window.location.href)}`;
    } else {
      connect({ connector: connectors[1] });
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif",
      maxWidth: "500px",
      margin: "0 auto",
      textAlign: "center"
    }}>
      <h1>USDT dApp</h1>
      
      {!isConnected ? (
        <div>
          <p>Connect your wallet to view USDT details</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2775ca",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Trust Wallet
            </button>
            <button 
              onClick={handleCoinbaseWallet}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1652F0",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Coinbase Wallet
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <p>USDT Balance: {balance}</p>
          {price && <p>Current Price: ${price} USD</p>}
          
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
            <button 
              onClick={addTokenToWallet}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Add USDT to Wallet
            </button>
            <button 
              onClick={disconnect}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
