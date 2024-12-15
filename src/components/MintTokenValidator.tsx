import { fromText, Script } from "lucid-cardano";
import React, { useState } from 'react';
import { useLucid } from '../context/LucidProvider';

interface MintTokenValidatorProps {
    level: number;
    timeLeft: number;
    clickCount: number;
    requiredClicks: number;
}

export const MintTokenValidator: React.FC<MintTokenValidatorProps> = ({
    level,
    timeLeft,
    clickCount,
    requiredClicks
}) => {
    const { lucid } = useLucid();
    const [txHash, setTxHash] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Tự động tạo thông tin token dựa trên thành tích
    const generateTokenInfo = () => {
        const performance = (timeLeft / clickCount) * 100;
        const rating = performance >= 80 ? "S" :
            performance >= 60 ? "A" :
                performance >= 40 ? "B" : "C";

        const tokenName = `CM${level}${rating}`;
        const tokenDescription = `L${level}|${clickCount}/${requiredClicks}|${timeLeft}s|${rating}`;

        // Chọn hình ảnh dựa trên rating
        const imageUrls = {
            S: "ipfs://QmS...",
            A: "ipfs://QmA...",
            B: "ipfs://QmB...",
            C: "ipfs://QmC..."
        };

        return {
            name: tokenName,
            desc: tokenDescription,
            img: imageUrls[rating as keyof typeof imageUrls],
            attr: {
                lvl: level,
                time: timeLeft,
                clicks: clickCount,
                req: requiredClicks,
                rate: rating,
                perf: Math.round(performance)
            }
        };
    };

    const mintingPolicyId = async function () {
        if (!lucid) throw new Error("Lucid instance not found");

        const { paymentCredential } = lucid.utils.getAddressDetails(
            await lucid.wallet.address()
        );

        if (!paymentCredential) throw new Error("Payment credential not found");

        const mintingPolicy: Script = lucid.utils.nativeScriptFromJson({
            type: "all",
            scripts: [
                { type: "sig", keyHash: paymentCredential.hash },
                {
                    type: "before",
                    slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000)
                },
            ],
        });

        return {
            policyId: lucid.utils.mintingPolicyToId(mintingPolicy),
            mintingPolicy
        };
    };

    const mintAchievementNFT = async () => {
        try {
            setLoading(true);
            if (!lucid) throw new Error("Lucid instance not found");

            const tokenInfo = generateTokenInfo();
            const { mintingPolicy, policyId } = await mintingPolicyId();
            const assetName = fromText(tokenInfo.name);

            const tx = await lucid
                .newTx()
                .mintAssets({ [policyId + assetName]: BigInt(1) })
                .attachMetadata(721, {
                    [policyId]: {
                        [tokenInfo.name]: tokenInfo
                    },
                })
                .validTo(Date.now() + 200000)
                .attachMintingPolicy(mintingPolicy)
                .complete();

            const signedTx = await tx.sign().complete();
            const txHash = await signedTx.submit();
            await lucid.awaitTx(txHash);

            setTxHash(txHash);
        } catch (error) {
            console.error("Minting error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 p-6 bg-[#2A2D3E] rounded-xl border-2 border-[#4A5568]">
            <h2 className="text-2xl font-bold text-[#98FB98] mb-4 pixel-font">
                Claim Your Achievement NFT
            </h2>

            <div className="bg-[#343747] p-4 rounded-lg mb-4 text-[#B8C0E0]">
                <p className="mb-2">Level {level} Achievement Badge</p>
                <p className="mb-2">Performance: {Math.round((timeLeft / clickCount) * 100)}%</p>
                <p>Rating: {
                    (timeLeft / clickCount) * 100 >= 80 ? "S" :
                        (timeLeft / clickCount) * 100 >= 60 ? "A" :
                            (timeLeft / clickCount) * 100 >= 40 ? "B" : "C"
                }</p>
            </div>

            <button
                onClick={mintAchievementNFT}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg pixel-font transition-all duration-300
                    ${loading
                        ? 'bg-[#4A5568] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FFA07A] to-[#FF6B6B] hover:shadow-[0_0_15px_rgba(255,107,107,0.3)]'
                    } text-white font-bold`}
            >
                {loading ? 'Minting...' : 'Mint Achievement NFT'}
            </button>

            {txHash && (
                <div className="mt-4 p-4 bg-[#2A2D3E] rounded-lg border border-[#4A5568]">
                    <p className="text-sm text-[#B8C0E0]">
                        Transaction hash:
                        <a
                            href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono ml-2 break-all text-[#FFA07A] hover:text-[#FF6B6B]"
                        >
                            {txHash}
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
};
