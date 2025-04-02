import React from 'react';
import ReactDOM from 'react-dom';
import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import App from './App';

// Remove unused 'chains' assignment
const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet], // Chains are defined here but not assigned to a variable
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root')
);
