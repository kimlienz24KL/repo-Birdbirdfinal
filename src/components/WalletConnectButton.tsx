import { useLucid } from '../context/LucidProvider';
import { useState } from 'react';

export function WalletConnectButton() {
    const { connectWallet, disconnectWallet, address, walletType } = useLucid();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const SUPPORTED_WALLETS = [
        {
            name: 'Nami',
            icon: '🦊',
        },
        {
            name: 'Lace',
            icon: '💠',
        }
    ];

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
        <div className="absolute top-4 right-4 z-50">
            {!address ? (
                <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
                    <div className="flex gap-2">
                        {SUPPORTED_WALLETS.map(({ name, icon }) => (
                            <button
                                key={name}
                                onClick={() => handleConnect(name.toLowerCase())}
                                disabled={isConnecting}
                                className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 
                         text-black font-medium transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         pixel-font text-sm flex items-center gap-2"
                            >
                                <span>{icon}</span>
                                <span>{isConnecting ? '...' : name}</span>
                            </button>
                        ))}
                    </div>
                    {error && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500 text-red-500 text-xs">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-mono text-sm">{formatAddress(address)}</span>
                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                                {SUPPORTED_WALLETS.find(w => w.name.toLowerCase() === walletType)?.icon}
                                <span>{walletType}</span>
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 
                     text-white text-sm transition-colors duration-200
                     pixel-font"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
} 