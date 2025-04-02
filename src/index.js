import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiConfig, createClient, configureChains, chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import App from './App';

// Configure chains and providers
const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet],
  [publicProvider()]
);

// Create wagmi client
const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'USDT dApp',
      }
    })
  ],
  provider,
  webSocketProvider,
});

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </StrictMode>
);
