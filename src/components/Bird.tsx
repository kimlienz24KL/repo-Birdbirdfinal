interface BirdProps {
  position: number;
  rotation: number;
}

export const Bird: React.FC<BirdProps> = ({ position, rotation }) => {
  return (
    <div
      className="absolute w-12 h-12 transition-transform"
      style={{
        top: `${position}px`,
        transform: `rotate(${rotation}deg)`,
        left: '20%'
      }}
    >
      <div className="w-full h-full bg-yellow-400 rounded-full relative">
        {/* Bird's eye */}
        <div className="absolute w-3 h-3 bg-white rounded-full top-2 right-2">
          <div className="absolute w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
        {/* Bird's beak */}
        <div className="absolute w-4 h-3 bg-orange-500 right-0 top-1/2 transform -translate-y-1/2 clip-beak"></div>
      </div>
    </div>
  );
}; 