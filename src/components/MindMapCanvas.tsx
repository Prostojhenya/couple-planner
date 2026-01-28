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
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hubPosition, setHubPosition] = useState<Position>({ x: 0, y: 0 });
  
  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  // Gesture state
  const [isPanning, setIsPanning] = useState(false);
  const [lastTouchPos, setLastTouchPos] = useState<Position>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number>(0);
  const lastFocalPoint = useRef<Position>({ x: 0, y: 0 });
  
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

  const isOverHub = (x: number, y: number): boolean => {
    const hubRadius = 64;
    // Transform screen coordinates to canvas coordinates
    const canvasX = (x - translateX) / scale;
    const canvasY = (y - translateY) / scale;
    const dx = canvasX - hubPosition.x;
    const dy = canvasY - hubPosition.y;
    return Math.sqrt(dx * dx + dy * dy) <= hubRadius;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture - store initial distance and focal point
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
      
      const focalX = (touch1.clientX + touch2.clientX) / 2;
      const focalY = (touch1.clientY + touch2.clientY) / 2;
      lastFocalPoint.current = { x: focalX, y: focalY };
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
        }, 500);
      } else {
        // Start panning
        setIsPanning(true);
        setLastTouchPos({ x: touchX, y: touchY });
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

      const focalX = (touch1.clientX + touch2.clientX) / 2;
      const focalY = (touch1.clientY + touch2.clientY) / 2;

      if (lastTouchDistance.current > 0) {
        // Calculate scale change
        const scaleChange = distance / lastTouchDistance.current;
        const newScale = Math.max(0.5, Math.min(3, scale * scaleChange));
        
        // Calculate focal point in canvas space before zoom
        const focalCanvasX = (lastFocalPoint.current.x - translateX) / scale;
        const focalCanvasY = (lastFocalPoint.current.y - translateY) / scale;
        
        // Calculate new translation to keep focal point stationary
        const newTranslateX = focalX - focalCanvasX * newScale;
        const newTranslateY = focalY - focalCanvasY * newScale;
        
        setScale(newScale);
        setTranslateX(newTranslateX);
        setTranslateY(newTranslateY);
      }

      lastTouchDistance.current = distance;
      lastFocalPoint.current = { x: focalX, y: focalY };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Check if moved significantly - cancel long press
      const dx = touchX - touchStartPosition.current.x;
      const dy = touchY - touchStartPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      if (isCreatingCluster) {
        // Update new cluster position
        e.preventDefault();
        setNewClusterPosition({ x: touchX, y: touchY });
      } else if (isPanning) {
        // Pan the canvas
        e.preventDefault();
        const deltaX = touchX - lastTouchPos.x;
        const deltaY = touchY - lastTouchPos.y;

        setTranslateX(translateX + deltaX);
        setTranslateY(translateY + deltaY);
        setLastTouchPos({ x: touchX, y: touchY });
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isCreatingCluster && newClusterPosition) {
      // Transform screen coordinates to canvas coordinates
      const canvasX = (newClusterPosition.x - translateX) / scale;
      const canvasY = (newClusterPosition.y - translateY) / scale;
      onCreateCluster({ x: canvasX, y: canvasY });
      setIsCreatingCluster(false);
      setNewClusterPosition(null);
    }

    setIsPanning(false);
    lastTouchDistance.current = 0;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -e.deltaY * 0.001;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate focal point in canvas space
    const focalCanvasX = (mouseX - translateX) / scale;
    const focalCanvasY = (mouseY - translateY) / scale;
    
    // Calculate new translation
    const newTranslateX = mouseX - focalCanvasX * newScale;
    const newTranslateY = mouseY - focalCanvasY * newScale;
    
    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  };

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
      />
      
      <div
        ref={contentRef}
        className="absolute inset-0"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
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

        {/* Preview of new cluster */}
        {isCreatingCluster && newClusterPosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            style={{ 
              left: (newClusterPosition.x - translateX) / scale, 
              top: (newClusterPosition.y - translateY) / scale,
            }}
          >
            <div className="w-24 h-24 rounded-full bg-blue-400 opacity-50 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">+</span>
            </div>
          </div>
        )}

        {/* Connection line while creating */}
        {isCreatingCluster && newClusterPosition && (
          <svg
            className="absolute inset-0 pointer-events-none z-20"
            style={{ width: dimensions.width / scale, height: dimensions.height / scale }}
          >
            <line
              x1={hubPosition.x}
              y1={hubPosition.y}
              x2={(newClusterPosition.x - translateX) / scale}
              y2={(newClusterPosition.y - translateY) / scale}
              stroke="#3B82F6"
              strokeWidth={2 / scale}
              strokeDasharray={`${5 / scale},${5 / scale}`}
              opacity="0.5"
            />
          </svg>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={() => {
            const newScale = Math.min(3, scale + 0.2);
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const focalCanvasX = (centerX - translateX) / scale;
            const focalCanvasY = (centerY - translateY) / scale;
            
            const newTranslateX = centerX - focalCanvasX * newScale;
            const newTranslateY = centerY - focalCanvasY * newScale;
            
            setScale(newScale);
            setTranslateX(newTranslateX);
            setTranslateY(newTranslateY);
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold hover:bg-gray-100"
        >
          +
        </button>
        <button
          onClick={() => {
            const newScale = Math.max(0.5, scale - 0.2);
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const focalCanvasX = (centerX - translateX) / scale;
            const focalCanvasY = (centerY - translateY) / scale;
            
            const newTranslateX = centerX - focalCanvasX * newScale;
            const newTranslateY = centerY - focalCanvasY * newScale;
            
            setScale(newScale);
            setTranslateX(newTranslateX);
            setTranslateY(newTranslateY);
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold hover:bg-gray-100"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setTranslateX(0);
            setTranslateY(0);
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold hover:bg-gray-100"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
