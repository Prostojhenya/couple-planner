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
  
  // Cluster creation state
  const [isCreatingCluster, setIsCreatingCluster] = useState(false);
  const [newClusterPosition, setNewClusterPosition] = useState<Position | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const touchStartPosition = useRef<Position>({ x: 0, y: 0 });

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
  const isOverHub = (x: number, y: number): boolean => {
    const hubRadius = 64; // 128px / 2
    const dx = x - hubPosition.x;
    const dy = y - hubPosition.y;
    return Math.sqrt(dx * dx + dy * dy) <= hubRadius;
  };

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
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      touchStartPosition.current = { x: touchX, y: touchY };

      // Check if touching the hub
      if (isOverHub(touchX, touchY)) {
        // Start long-press timer for cluster creation
        longPressTimer.current = setTimeout(() => {
          setIsCreatingCluster(true);
          setNewClusterPosition({ x: touchX, y: touchY });
        }, 500); // 500ms long press
      } else {
        // Start panning
        setIsPanning(true);
        setLastPanPosition({ x: touchX, y: touchY });
      }
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
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Check if moved significantly (more than 10px) - cancel long press
      const dx = touchX - touchStartPosition.current.x;
      const dy = touchY - touchStartPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      if (isCreatingCluster) {
        // Update new cluster position while dragging
        e.preventDefault();
        setNewClusterPosition({ x: touchX, y: touchY });
      } else if (isPanning) {
        // Pan the canvas
        e.preventDefault();
        const deltaX = touchX - lastPanPosition.x;
        const deltaY = touchY - lastPanPosition.y;

        setOffset({
          x: offset.x + deltaX,
          y: offset.y + deltaY,
        });

        setLastPanPosition({ x: touchX, y: touchY });
      }
    }
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // If was creating cluster, finalize it
    if (isCreatingCluster && newClusterPosition) {
      onCreateCluster(newClusterPosition);
      setIsCreatingCluster(false);
      setNewClusterPosition(null);
    }

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

        {/* Preview of new cluster being created */}
        {isCreatingCluster && newClusterPosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
            style={{ 
              left: newClusterPosition.x, 
              top: newClusterPosition.y,
              pointerEvents: 'none'
            }}
          >
            <div className="w-24 h-24 rounded-full bg-blue-400 opacity-50 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">+</span>
            </div>
          </div>
        )}

        {/* Connection line while creating cluster */}
        {isCreatingCluster && newClusterPosition && (
          <svg
            className="absolute inset-0 pointer-events-none z-20"
            style={{ width: '100%', height: '100%' }}
          >
            <line
              x1={hubPosition.x}
              y1={hubPosition.y}
              x2={newClusterPosition.x}
              y2={newClusterPosition.y}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          </svg>
        )}
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
