/**
 * Demo component showing how to use CanvasRenderer
 * This demonstrates the basic usage of the CanvasRenderer class
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasRenderer, CanvasState } from '@/lib/CanvasRenderer';
import { ClusterType } from '@/types/mindmap';

export function CanvasRendererDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current || rendererRef.current) return;

    const renderer = new CanvasRenderer();
    renderer.initialize(canvasRef.current);
    rendererRef.current = renderer;
    setIsInitialized(true);

    // Handle window resize
    const handleResize = () => {
      renderer.resize();
      renderDemo();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render demo state
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;
    renderDemo();
  }, [isInitialized]);

  const renderDemo = () => {
    if (!rendererRef.current) return;

    // Create demo state
    const demoState: CanvasState = {
      hub: {
        id: 'demo-hub',
        userId: 'demo-user',
        contextType: 'personal',
        participants: ['Я', 'Ю'],
        clusters: [
          { id: 'cluster-1' } as any,
          { id: 'cluster-2' } as any,
          { id: 'cluster-3' } as any,
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      clusters: new Map([
        ['cluster-1', {
          id: 'cluster-1',
          hubId: 'demo-hub',
          ownerId: 'demo-user',
          type: 'task' as ClusterType,
          positionX: 600,
          positionY: 200,
          isExpanded: false,
          tasks: [
            { id: 't1' } as any,
            { id: 't2' } as any,
            { id: 't3' } as any,
          ],
          members: [
            { id: 'm1' } as any,
            { id: 'm2' } as any,
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        ['cluster-2', {
          id: 'cluster-2',
          hubId: 'demo-hub',
          ownerId: 'demo-user',
          type: 'event' as ClusterType,
          positionX: 300,
          positionY: 400,
          isExpanded: false,
          tasks: [
            { id: 't4' } as any,
            { id: 't5' } as any,
          ],
          members: [
            { id: 'm1' } as any,
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        ['cluster-3', {
          id: 'cluster-3',
          hubId: 'demo-hub',
          ownerId: 'demo-user',
          type: 'shop' as ClusterType,
          positionX: 700,
          positionY: 450,
          isExpanded: true,
          tasks: [
            {
              id: 't6',
              clusterId: 'cluster-3',
              parentTaskId: null,
              title: 'Task 1',
              completed: false,
              icon: 'check',
              positionX: null,
              positionY: null,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              children: [],
            },
            {
              id: 't7',
              clusterId: 'cluster-3',
              parentTaskId: null,
              title: 'Task 2',
              completed: true,
              icon: 'check',
              positionX: null,
              positionY: null,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              children: [],
            },
            {
              id: 't8',
              clusterId: 'cluster-3',
              parentTaskId: null,
              title: 'Task 3',
              completed: false,
              icon: 'check',
              positionX: null,
              positionY: null,
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
              children: [],
            },
          ],
          members: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      ]),
      tasks: new Map(),
      expandedClusters: new Set(['cluster-3']),
      selectedElement: null,
    };

    // Render the state
    rendererRef.current.render(demoState);
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">CanvasRenderer Demo</h1>
        <p className="text-gray-600 mb-4">
          Demonstrating the CanvasRenderer component with HUB, Clusters, and Tasks
        </p>
      </div>
      <div className="relative w-full" style={{ height: 'calc(100vh - 120px)' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
