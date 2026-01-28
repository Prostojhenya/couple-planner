'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ShoppingCart, Calendar } from 'lucide-react';

interface Cluster {
  id: string;
  type: 'task' | 'shop' | 'event';
  position: { x: number; y: number };
  count: number;
  members: Array<{ id: string; name: string; role: string; avatar?: string }>;
  isExpanded: boolean;
  tasks?: Array<{ id: string; status: string }>;
  name?: string;
  size?: number;
  color?: string;
}

interface ClusterNodeProps {
  cluster: Cluster;
  onTap: () => void;
  onLongPress: () => void;
}

export function ClusterNode({ cluster, onTap, onLongPress }: ClusterNodeProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handleTouchStart = () => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = () => {
    onTap();
  };

  const getIcon = () => {
    switch (cluster.type) {
      case 'task':
        return <CheckCircle2 className="w-6 h-6 text-blue-500" />;
      case 'shop':
        return <ShoppingCart className="w-6 h-6 text-green-500" />;
      case 'event':
        return <Calendar className="w-6 h-6 text-purple-500" />;
    }
  };

  const getLabel = () => {
    switch (cluster.type) {
      case 'task':
        return 'TASKS';
      case 'shop':
        return 'SHOP';
      case 'event':
        return 'EVENTS';
    }
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{ left: cluster.position.x, top: cluster.position.y }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div
        className={`rounded-full shadow-md flex flex-col items-center justify-center transition-transform ${
          isPressed ? 'scale-95' : 'scale-100'
        } ${cluster.isExpanded ? 'ring-4 ring-blue-400' : ''}`}
        style={{
          width: cluster.size || 96,
          height: cluster.size || 96,
          backgroundColor: cluster.color || '#FFFFFF',
        }}
      >
        {cluster.name ? (
          <div className="text-white text-sm font-bold text-center px-2">
            {cluster.name}
          </div>
        ) : (
          <>
            {getIcon()}
            <div className="text-gray-900 text-xl font-bold mt-1">{cluster.count}</div>
            <div className="text-gray-500 text-[10px] font-medium">{getLabel()}</div>
          </>
        )}
      </div>

      {/* Member avatars */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex -space-x-2">
        {cluster.members.slice(0, 3).map((member, idx) => (
          <div
            key={member.id}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
          >
            {member.name.charAt(0)}
          </div>
        ))}
      </div>

      {/* Nested task nodes */}
      {cluster.isExpanded && cluster.tasks && (
        <div className="absolute top-full mt-4 flex gap-2">
          {cluster.tasks.slice(0, 5).map((task, idx) => (
            <div
              key={task.id}
              className={`w-8 h-8 rounded-full shadow-sm ${
                task.status === 'completed' ? 'bg-green-400' : 'bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
