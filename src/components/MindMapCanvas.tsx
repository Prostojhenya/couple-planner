'use client';

import { useEffect, useRef, useState } from 'react';
import { ClusterNode } from './ClusterNode';
import { HubNode } from './HubNode';

interface Position {
  x: number;
  y: number;
}

interface Cluster {
  id: string;
  type: 'task' | 'shop' | 'event';
  position: Position;
  count: number;
  members: Array<{ id: string; name: string; role: string; avatar?: string }>;
  isExpanded: boolean;
  tasks?: Array<{ id: string; status: string }>;
}

interface MindMapCanvasProps {
  clusters: Cluster[];
  onClusterTap: (clusterId: string) => void;
  onClusterLongPress: (clusterId: string) => void;
  onCreateCluster: (position: Position) => void;
}

export function MindMapCanvas({ 
  clusters, 
  onClusterTap, 
  onClusterLongPress,
  onCreateCluster 
}: MindMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hubPosition, setHubPosition] = useState<Position>({ x: 0, y: 0 });
  
  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState<Position>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number>(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setHubPosition({ x: width / 2, y: height / 2 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Touch handlers for pinch-to-zoom and pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      // Pan gesture
      setIsPanning(true);
      setLastPanPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance.current > 0) {
        const delta = distance - lastTouchDistance.current;
        const newScale = Math.max(0.5, Math.min(3, scale + delta * 0.01));
        setScale(newScale);
      }

      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && isPanning) {
      // Pan
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPosition.x;
      const deltaY = touch.clientY - lastPanPosition.y;

      setOffset({
        x: offset.x + deltaX,
        y: offset.y + deltaY,
      });

      setLastPanPosition({
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    lastTouchDistance.current = 0;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw grid background
    drawGrid(ctx, dimensions.width, dimensions.height);

    // Draw connections from hub to clusters
    clusters.forEach(cluster => {
      drawConnection(ctx, hubPosition, cluster.position);
    });
  }, [clusters, dimensions, hubPosition]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    const gridSize = 40;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawConnection = (ctx: CanvasRenderingContext2D, from: Position, to: Position) => {
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const controlOffset = 50;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(
      midX + controlOffset,
      midY - controlOffset,
      to.x,
      to.y
    );
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Transform position based on scale and offset
  const transformPosition = (pos: Position): Position => ({
    x: pos.x * scale + offset.x,
    y: pos.y * scale + offset.y,
  });

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-gray-100 overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
          transformOrigin: '0 0',
        }}
      />
      
      <div
        style={{
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
          transformOrigin: '0 0',
        }}
      >
        {/* Hub Node */}
        <HubNode
          position={hubPosition}
          clusterCount={clusters.length}
        />

        {/* Cluster Nodes */}
        {clusters.map(cluster => (
          <ClusterNode
            key={cluster.id}
            cluster={cluster}
            onTap={() => onClusterTap(cluster.id)}
            onLongPress={() => onClusterLongPress(cluster.id)}
          />
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={() => setScale(Math.min(3, scale + 0.2))}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold hover:bg-gray-100"
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold hover:bg-gray-100"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold hover:bg-gray-100"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
