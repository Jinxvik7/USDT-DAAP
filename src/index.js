import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiConfig, createClient } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import App from './App';

// Create wagmi client for v0.12.9
const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains: [mainnet] }),
    new CoinbaseWalletConnector({
      chains: [mainnet],
      options: {
        appName: 'USDT dApp',
      }
    })
  ],
  provider: publicProvider()
});

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </StrictMode>
);
