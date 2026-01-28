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

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-100 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />
      
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
  );
}
