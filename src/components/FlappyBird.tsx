import React, { useState, useEffect, useCallback } from 'react';
import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { MintNFTReward } from './MintNFTReward';
import { WalletConnectButton } from './WalletConnectButton';
import { useLucid } from '../context/LucidProvider';

const GRAVITY = 0.3;
const JUMP_FORCE = -8;
const PIPE_SPEED = 1.5;
const PIPE_SPAWN_RATE = 2500;
const GAP_SIZE = 250;

interface Pipe {
    x: number;
    height: number;
    passed: boolean;
}

export const FlappyBird: React.FC = () => {
    const { address } = useLucid();
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [birdPosition, setBirdPosition] = useState(300);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [birdRotation, setBirdRotation] = useState(0);
    const [pipes, setPipes] = useState<Pipe[]>([]);

    const jump = useCallback(() => {
        if (!gameOver && gameStarted) {
            setBirdVelocity(JUMP_FORCE);
            setBirdRotation(-20);
        }
    }, [gameOver, gameStarted]);

    const startGame = () => {
        if (!address) return; // Prevent starting if wallet not connected
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setBirdPosition(300);
        setBirdVelocity(0);
        setBirdRotation(0);
        setPipes([]);
    };

    useEffect(() => {
        if (!gameStarted) return;

        const gameLoop = setInterval(() => {
            // Update bird position
            setBirdPosition((prev) => {
                const newPosition = prev + birdVelocity;
                if (newPosition < 0 || newPosition > window.innerHeight) {
                    setGameOver(true);
                }
                return newPosition;
            });

            // Update bird velocity and rotation
            setBirdVelocity((prev) => prev + GRAVITY);
            setBirdRotation((prev) => Math.min(prev + 2, 90));

            // Update pipes
            setPipes((prevPipes) => {
                return prevPipes
                    .map((pipe) => ({
                        ...pipe,
                        x: pipe.x - PIPE_SPEED,
                    }))
                    .filter((pipe) => pipe.x > -100);
            });

            // Check collisions
            pipes.forEach((pipe) => {
                const birdRect = {
                    left: window.innerWidth * 0.2,
                    right: window.innerWidth * 0.2 + 48,
                    top: birdPosition,
                    bottom: birdPosition + 48,
                };

                const topPipeRect = {
                    left: pipe.x,
                    right: pipe.x + 80,
                    top: 0,
                    bottom: pipe.height,
                };

                const bottomPipeRect = {
                    left: pipe.x,
                    right: pipe.x + 80,
                    top: pipe.height + GAP_SIZE,
                    bottom: window.innerHeight,
                };

                if (
                    checkCollision(birdRect, topPipeRect) ||
                    checkCollision(birdRect, bottomPipeRect)
                ) {
                    setGameOver(true);
                }

                // Update score
                if (!pipe.passed && pipe.x < window.innerWidth * 0.2) {
                    setScore((prev) => prev + 1);
                    pipe.passed = true;
                }
            });
        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [gameStarted, birdPosition, birdVelocity, pipes]);

    // Spawn pipes
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const spawnPipe = setInterval(() => {
            const minHeight = 100;
            const maxHeight = window.innerHeight - GAP_SIZE - 100;
            const height = Math.random() * (maxHeight - minHeight) + minHeight;

            setPipes((prev) => [...prev, {
                x: window.innerWidth,
                height,
                passed: false
            }]);
        }, PIPE_SPAWN_RATE);

        return () => clearInterval(spawnPipe);
    }, [gameStarted, gameOver]);

    useEffect(() => {
        if (gameStarted) {
            const initialDelay = setTimeout(() => {
                setPipes((prev) => [...prev, {
                    x: window.innerWidth,
                    height: window.innerHeight / 2 - GAP_SIZE / 2,
                    passed: false
                }]);
            }, 2000);

            return () => clearTimeout(initialDelay);
        }
    }, [gameStarted]);

    return (
        <div className="relative w-full h-screen bg-sky-300 overflow-hidden cursor-pointer"
             onClick={address ? (gameStarted ? jump : startGame) : undefined}>
            
            <WalletConnectButton />
            
            {/* Background elements */}
            <div className="absolute bottom-0 w-full h-24 bg-green-400"></div>

            {/* Game elements - only show if wallet is connected */}
            {address && (
                <>
                    <Bird position={birdPosition} rotation={birdRotation} />
                    {pipes.map((pipe, index) => (
                        <React.Fragment key={index}>
                            <Pipe height={pipe.height} isTop={true} position={pipe.x} />
                            <Pipe
                                height={window.innerHeight - pipe.height - GAP_SIZE}
                                isTop={false}
                                position={pipe.x}
                            />
                        </React.Fragment>
                    ))}

                    {/* Score */}
                    <div className="absolute top-8 left-0 w-full text-center text-6xl font-bold text-white 
                                shadow-lg pixel-font">
                        {score}
                    </div>
                </>
            )}

            {/* Welcome/Connect Screen */}
            {!address && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white pixel-font p-8 bg-black/40 rounded-xl backdrop-blur-sm">
                        <h1 className="text-4xl mb-6">Flappy Bird</h1>
                        <p className="text-xl mb-8">Connect your wallet to play!</p>
                        <div className="animate-bounce text-yellow-400 text-6xl mb-8">↑</div>
                        <p className="text-sm text-gray-400">
                            Get 3 or more points to earn an NFT reward!
                        </p>
                    </div>
                </div>
            )}

            {/* Start Game Instructions */}
            {address && !gameStarted && !gameOver && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              text-center text-white pixel-font">
                    <h1 className="text-4xl mb-4">Ready to Play?</h1>
                    <p className="text-xl mb-4">Click or Tap to make the bird fly</p>
                    <p className="text-lg mb-2">🎮 Tips:</p>
                    <ul className="text-sm space-y-2">
                        <li>• Tap gently for better control</li>
                        <li>• Stay in the middle when possible</li>
                        <li>• Get 3 points for an NFT reward!</li>
                    </ul>
                    <p className="text-xl mt-6 animate-bounce">Click to Start!</p>
                </div>
            )}

            {/* Game Over Screen */}
            {address && gameOver && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              text-center text-white pixel-font bg-black/80 p-8 rounded-xl">
                    <h1 className="text-4xl mb-4">Game Over</h1>
                    <p className="text-2xl mb-4">Score: {score}</p>

                    <MintNFTReward score={score} />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            startGame();
                        }}
                        className="mt-6 px-8 py-4 bg-yellow-400 rounded-lg text-xl hover:bg-yellow-500 
                                 transition-colors text-black"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

function checkCollision(rect1: any, rect2: any) {
    const margin = 5;
    return (
        rect1.left + margin < rect2.right &&
        rect1.right - margin > rect2.left &&
        rect1.top + margin < rect2.bottom &&
        rect1.bottom - margin > rect2.top
    );
} 