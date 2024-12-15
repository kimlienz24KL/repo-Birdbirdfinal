import React, { useState } from 'react';
import { useLucid } from '../context/LucidProvider';
import { fromText } from 'lucid-cardano';

interface MintNFTRewardProps {
  score: number;
}

export const MintNFTReward: React.FC<MintNFTRewardProps> = ({ score }) => {
  const { lucid } = useLucid();
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTokenInfo = () => {
    let rating;
    if (score >= 10) rating = "S";
    else if (score >= 7) rating = "A";
    else if (score >= 5) rating = "B";
    else rating = "C";

    const tokenName = `FlappyBird_${score}_${rating}_${Date.now()}`;
    
    return {
      name: tokenName,
      image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
      mediaType: "image/png",
      description: `Flappy Bird Score Achievement - Score: ${score}, Rating: ${rating}`,
      files: [{
        name: "icon.png",
        mediaType: "image/png",
        src: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua"
      }],
      attributes: {
        score: score,
        rating: rating,
        timestamp: new Date().toISOString()
      }
    };
  };

  const mintNFT = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!lucid) throw new Error("Wallet not connected");

      // Get wallet address
      const address = await lucid.wallet.address();
      
      // Create minting policy
      const { paymentCredential } = lucid.utils.getAddressDetails(address);
      if (!paymentCredential) throw new Error("No payment credential");

      const mintingPolicy = lucid.utils.nativeScriptFromJson({
        type: "all",
        scripts: [
          { type: "sig", keyHash: paymentCredential.hash }
        ],
      });

      const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
      const tokenInfo = generateTokenInfo();
      const assetName = fromText(tokenInfo.name);
      const unit = policyId + assetName;

      // Build transaction
      const tx = await lucid
        .newTx()
        .mintAssets({
          [unit]: BigInt(1)
        })
        .attachMintingPolicy(mintingPolicy)
        .attachMetadata(721, {
          [policyId]: {
            [tokenInfo.name]: tokenInfo
          }
        })
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      // Wait for confirmation
      await lucid.awaitTx(txHash);
      setTxHash(txHash);
      
    } catch (error) {
      console.error("Minting error:", error);
      setError(error instanceof Error ? error.message : "Failed to mint NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {score >= 3 ? (
        <div className="space-y-4">
          <h3 className="text-2xl text-yellow-400 pixel-font">
            🎉 You've earned an NFT reward! 🎉
          </h3>
          <button
            onClick={mintNFT}
            disabled={loading}
            className={`px-6 py-3 rounded-lg pixel-font transition-all
              ${loading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-yellow-400 hover:bg-yellow-500 text-black'}`}
          >
            {loading ? 'Minting...' : 'Claim NFT Reward'}
          </button>
          
          {error && (
            <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {txHash && (
            <div className="mt-4 text-sm">
              <p className="text-green-400 mb-2">NFT Minted Successfully!</p>
              <p className="text-gray-400">Transaction Hash:</p>
              <a
                href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500 break-all"
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      ) : (
        <p className="text-white pixel-font">
          Get 3 or more points to earn an NFT reward!
        </p>
      )}
    </div>
  );
}; 