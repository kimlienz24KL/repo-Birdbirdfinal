interface PipeProps {
    height: number;
    isTop: boolean;
    position: number;
}

export const Pipe: React.FC<PipeProps> = ({ height, isTop, position }) => {
    return (
        <div
            className="absolute w-20 bg-green-600 border-4 border-green-800"
            style={{
                height: `${height}px`,
                left: `${position}px`,
                top: isTop ? 0 : 'auto',
                bottom: isTop ? 'auto' : 0
            }}
        >
            <div className={`w-24 h-8 bg-green-600 border-4 border-green-800 absolute left-1/2 transform -translate-x-1/2 
                      ${isTop ? 'bottom-0' : 'top-0'}`}>
            </div>
        </div>
    );
}; 