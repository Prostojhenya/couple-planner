'use client';

interface HubNodeProps {
  position: { x: number; y: number };
  clusterCount: number;
}

export function HubNode({ position, clusterCount }: HubNodeProps) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-32 h-32 rounded-full bg-black shadow-lg flex flex-col items-center justify-center">
        <div className="text-white text-2xl font-bold mb-1">Я | Ю</div>
        <div className="text-white text-xs opacity-75">{clusterCount} CLUSTERS</div>
      </div>
    </div>
  );
}
