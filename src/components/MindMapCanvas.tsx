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
  name?: string;
  size?: number;
  color?: string;
}

interface MindMapCanvasProps {
  clusters: Cluster[];
  onClusterTap: (clusterId: string) => void;
  onClusterLongPress: (clusterId: string) => void;
  onCreateCluster: (position: Position) => void;
  onClusterMove?: (clusterId: string, position: Position) => void;
}

export function MindMapCanvas({ 
  clusters, 
  onClusterTap, 
  onClusterLongPress,
  onCreateCluster,
  onClusterMove
}: MindMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hubPosition, setHubPosition] = useState<Position>({ x: 0, y: 0 });
  
  // Transform state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  // Gesture state
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingCluster, setIsDraggingCluster] = useState(false);
  const [draggedClusterId, setDraggedClusterId] = useState<string | null>(null);
  const [lastTouchPos, setLastTouchPos] = useState<Position>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number>(0);
  const lastFocalPoint = useRef<Position>({ x: 0, y: 0 });
  
  // Cluster creation state
  const [isCreatingCluster, setIsCreatingCluster] = useState(false);
  const [newClusterPosition, setNewClusterPosition] = useState<Position | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const touchStartPosition = useRef<Position>({ x: 0, y: 0 });
  const touchedElement = useRef<'hub' | 'cluster' | 'empty' | null>(null);

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

  const screenToCanvas = (screenX: number, screenY: number): Position => {
    return {
      x: (screenX - translateX) / scale,
      y: (screenY - translateY) / scale,
    };
  };

  const isOverHub = (screenX: number, screenY: number): boolean => {
    const canvas = screenToCanvas(screenX, screenY);
    const hubRadius = 64;
    const dx = canvas.x - hubPosition.x;
    const dy = canvas.y - hubPosition.y;
    return Math.sqrt(dx * dx + dy * dy) <= hubRadius;
  };

  const getClusterAt = (screenX: number, screenY: number): string | null => {
    const canvas = screenToCanvas(screenX, screenY);
    
    for (const cluster of clusters) {
      const radius = (cluster.size || 96) / 2;
      const dx = canvas.x - cluster.position.x;
      const dy = canvas.y - cluster.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        return cluster.id;
      }
    }
    
    return null;
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
      
      const focalX = (touch1.clientX + touch2.clientX) / 2;
      const focalY = (touch1.clientY + touch2.clientY) / 2;
      lastFocalPoint.current = { x: focalX, y: focalY };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      touchStartPosition.current = { x: touchX, y: touchY };

      // Determine what was touched
      const clusterId = getClusterAt(touchX, touchY);
      
      if (clusterId) {
        touchedElement.current = 'cluster';
        // Start long-press timer for cluster drag
        longPressTimer.current = setTimeout(() => {
          setIsDraggingCluster(true);
          setDraggedClusterId(clusterId);
        }, 500);
      } else if (isOverHub(touchX, touchY)) {
        touchedElement.current = 'hub';
        // Start long-press timer for cluster creation
        longPressTimer.current = setTimeout(() => {
          setIsCreatingCluster(true);
          setNewClusterPosition({ x: touchX, y: touchY });
        }, 500);
      } else {
        touchedElement.current = 'empty';
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
        const scaleChange = distance / lastTouchDistance.current;
        const newScale = Math.max(0.5, Math.min(3, scale * scaleChange));
        
        const focalCanvasX = (lastFocalPoint.current.x - translateX) / scale;
        const focalCanvasY = (lastFocalPoint.current.y - translateY) / scale;
        
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

      if (isDraggingCluster && draggedClusterId) {
        // Drag cluster
        e.preventDefault();
        const canvasPos = screenToCanvas(touchX, touchY);
        if (onClusterMove) {
          onClusterMove(draggedClusterId, canvasPos);
        }
      } else if (isCreatingCluster) {
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
      const canvasPos = screenToCanvas(newClusterPosition.x, newClusterPosition.y);
      onCreateCluster(canvasPos);
      setIsCreatingCluster(false);
      setNewClusterPosition(null);
    }

    setIsPanning(false);
    setIsDraggingCluster(false);
    setDraggedClusterId(null);
    touchedElement.current = null;
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
    
    const focalCanvasX = (mouseX - translateX) / scale;
    const focalCanvasY = (mouseY - translateY) / scale;
    
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
      {/* Transformed content (canvas + nodes) */}
      <div
        ref={contentRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Canvas with grid and connections */}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Connections */}
          {clusters.map(cluster => {
            const midX = (hubPosition.x + cluster.position.x) / 2;
            const midY = (hubPosition.y + cluster.position.y) / 2;
            const controlOffset = 50;
            
            return (
              <path
                key={cluster.id}
                d={`M ${hubPosition.x} ${hubPosition.y} Q ${midX + controlOffset} ${midY - controlOffset} ${cluster.position.x} ${cluster.position.y}`}
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            );
          })}
          
          {/* Connection for new cluster */}
          {isCreatingCluster && newClusterPosition && (
            <line
              x1={hubPosition.x}
              y1={hubPosition.y}
              x2={screenToCanvas(newClusterPosition.x, newClusterPosition.y).x}
              y2={screenToCanvas(newClusterPosition.x, newClusterPosition.y).y}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          )}
        </svg>

        {/* Hub Node */}
        <div className="pointer-events-auto">
          <HubNode
            position={hubPosition}
            clusterCount={clusters.length}
          />
        </div>

        {/* Cluster Nodes */}
        {clusters.map(cluster => (
          <div key={cluster.id} className="pointer-events-auto">
            <ClusterNode
              cluster={cluster}
              onTap={() => onClusterTap(cluster.id)}
              onLongPress={() => onClusterLongPress(cluster.id)}
            />
          </div>
        ))}

        {/* Preview of new cluster */}
        {isCreatingCluster && newClusterPosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            style={{ 
              left: screenToCanvas(newClusterPosition.x, newClusterPosition.y).x,
              top: screenToCanvas(newClusterPosition.x, newClusterPosition.y).y,
            }}
          >
            <div className="w-24 h-24 rounded-full bg-blue-400 opacity-50 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">+</span>
            </div>
          </div>
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
