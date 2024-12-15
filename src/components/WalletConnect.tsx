import { useLucid } from '../context/LucidProvider';
import { useState } from 'react';

export function WalletConnect() {
  const { connectWallet, disconnectWallet, address, walletType } = useLucid();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletName: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectWallet(walletName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <div className="mb-8 p-6 rounded-lg bg-gray-800 shadow-xl">
      {!address ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <div className="flex flex-wrap gap-4">
            {['Nami', 'Eternl', 'Flint'].map((wallet) => (
              <button
                key={wallet}
                onClick={() => handleConnect(wallet.toLowerCase())}
                disabled={isConnecting}
                className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 
                         text-white font-medium transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : `Connect ${wallet}`}
              </button>
            ))}
          </div>
          {error && (
            <div className="mt-4 p-4 rounded bg-red-500/10 border border-red-500 text-red-500">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-300">Connected Wallet</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white font-mono">{formatAddress(address)}</span>
              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-sm">
                {walletType}
              </span>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 
                     text-white font-medium transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 