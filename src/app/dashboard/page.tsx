'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MindMapCanvas } from '@/components/MindMapCanvas';
import { ClusterDetailPanel } from '@/components/ClusterDetailPanel';
import { FloatingNavBar } from '@/components/FloatingNavBar';

interface Cluster {
  id: string;
  type: 'task' | 'shop' | 'event';
  position: { x: number; y: number };
  count: number;
  members: Array<{ id: string; name: string; role: string; avatar?: string }>;
  isExpanded: boolean;
  tasks?: Array<{ id: string; status: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Generate initial cluster positions in radial layout
    const generateClusters = () => {
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
      const radius = 200;
      const clusterCount = 10;

      const newClusters: Cluster[] = [];

      for (let i = 0; i < clusterCount; i++) {
        const angle = (i / clusterCount) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const types: Array<'task' | 'shop' | 'event'> = ['task', 'shop', 'event'];
        const type = types[i % 3];

        newClusters.push({
          id: `cluster-${i}`,
          type,
          position: { x, y },
          count: Math.floor(Math.random() * 20) + 1,
          members: [
            { id: '1', name: 'Я', role: 'admin' },
            { id: '2', name: 'Ю', role: 'user' },
          ],
          isExpanded: false,
          tasks: Array.from({ length: 5 }, (_, idx) => ({
            id: `task-${i}-${idx}`,
            status: Math.random() > 0.5 ? 'completed' : 'active',
          })),
        });
      }

      setClusters(newClusters);
      setLoading(false);
    };

    generateClusters();
  }, [router]);

  const handleClusterTap = (clusterId: string) => {
    setClusters(prev =>
      prev.map(c =>
        c.id === clusterId ? { ...c, isExpanded: !c.isExpanded } : c
      )
    );
  };

  const handleClusterLongPress = (clusterId: string) => {
    setSelectedCluster(clusterId);
    setIsPanelOpen(true);
  };

  const handleCreateCluster = (position: { x: number; y: number }) => {
    const newCluster: Cluster = {
      id: `cluster-${Date.now()}`,
      type: 'task',
      position,
      count: 0,
      members: [{ id: '1', name: 'Я', role: 'admin' }],
      isExpanded: false,
      tasks: [],
    };
    setClusters(prev => [...prev, newCluster]);
  };

  const handleInvite = () => {
    console.log('Invite members');
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    console.log('Role change:', memberId, newRole);
  };

  const selectedClusterData = clusters.find(c => c.id === selectedCluster);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white font-semibold mt-4 text-lg">Загрузка mind-map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <MindMapCanvas
        clusters={clusters}
        onClusterTap={handleClusterTap}
        onClusterLongPress={handleClusterLongPress}
        onCreateCluster={handleCreateCluster}
      />

      <ClusterDetailPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        clusterType={selectedClusterData?.type || 'task'}
        members={selectedClusterData?.members || []}
        onInvite={handleInvite}
        onRoleChange={handleRoleChange}
      />

      <FloatingNavBar />
    </div>
  );
}
