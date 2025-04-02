import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const TOKEN_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
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
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const [balance, setBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        if (isConnected && address) {
          await fetchTokenData(address);
          await fetchPrice();
        }
      } catch (err) {
        setError('Failed to initialize application');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isConnected, address]);

  const fetchTokenData = async (userAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);
      const balance = await tokenContract.balanceOf(userAddress);
      setBalance(ethers.utils.formatUnits(balance, 6));
    } catch (err) {
      setError('Failed to fetch balance');
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
      const data = await response.json();
      setPrice(data.tether.usd);
    } catch (err) {
      setError('Failed to fetch price');
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
            image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
          },
        },
      });
    } catch (err) {
      setError('Failed to add token to wallet');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1>Loading USDT dApp...</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>USDT dApp</h1>
      
      {error && <p style={styles.error}>{error}</p>}
      {connectError && <p style={styles.error}>{connectError.message}</p>}

      {!isConnected ? (
        <div style={styles.section}>
          <p>Connect your wallet to view USDT details</p>
          <div style={styles.buttonContainer}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={styles.button}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.section}>
          <p>Connected: {`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
          {balance !== null && <p>USDT Balance: {balance}</p>}
          {price !== null && <p>Current Price: ${price} USD</p>}

          <div style={styles.buttonContainer}>
            <button 
              onClick={addTokenToWallet}
              style={styles.successButton}
            >
              Add USDT to Wallet
            </button>
            <button 
              onClick={disconnect}
              style={styles.dangerButton}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center"
  },
  title: {
    color: "#2775ca",
    marginBottom: "30px"
  },
  section: {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    borderRadius: "10px",
    margin: "20px 0"
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px"
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#2775ca",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
  },
  successButton: {
    backgroundColor: "#28a745",
    padding: "12px 24px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
  },
  dangerButton: {
    backgroundColor: "#dc3545",
    padding: "12px 24px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
  },
  error: {
    color: "#dc3545",
    margin: "10px 0"
  }
};

export default App;
