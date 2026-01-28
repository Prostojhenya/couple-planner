/**
 * Canvas Store - Zustand state management for Visual Mind-Map Task System
 * 
 * This store manages the state of the canvas including:
 * - Hub (central element)
 * - Clusters (groups of tasks)
 * - Tasks (individual items)
 * - Expanded clusters state
 * - Selected elements
 * - Member management
 * 
 * Requirements: 2.3, 3.1, 3.2, 6.4, 7.1, 8.3
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Hub,
  MindMapCluster,
  MindMapTask,
  ClusterMember,
  HubWithClusters,
  ClusterWithTasks,
  TaskWithChildren,
  Position,
  ClusterType,
  Role,
  Permission,
} from '@/types/mindmap';

// ============================================
// Store State Interface
// ============================================

interface CanvasState {
  // State
  hub: HubWithClusters | null;
  clusters: Map<string, ClusterWithTasks>;
  tasks: Map<string, TaskWithChildren>;
  expandedClusters: Set<string>;
  selectedElement: string | null;
  
  // Hub Actions
  initializeHub: (hub: HubWithClusters) => void;
  setHub: (hub: HubWithClusters | null) => void;
  
  // Cluster Actions
  createCluster: (cluster: MindMapCluster, members: ClusterMember[]) => void;
  updateCluster: (clusterId: string, updates: Partial<MindMapCluster>) => void;
  deleteCluster: (clusterId: string) => void;
  moveCluster: (clusterId: string, position: Position) => void;
  toggleCluster: (clusterId: string) => void;
  setClusterExpanded: (clusterId: string, isExpanded: boolean) => void;
  
  // Task Actions
  createTask: (task: MindMapTask) => void;
  updateTask: (taskId: string, updates: Partial<MindMapTask>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  
  // Member Actions
  addMember: (clusterId: string, member: ClusterMember) => void;
  removeMember: (clusterId: string, userId: string) => void;
  updateMemberRole: (clusterId: string, userId: string, role: Role) => void;
  updateMemberPermissions: (clusterId: string, userId: string, permissions: Permission[]) => void;
  
  // Selection Actions
  selectElement: (elementId: string | null) => void;
  
  // Utility Functions
  getCluster: (clusterId: string) => ClusterWithTasks | undefined;
  getTask: (taskId: string) => TaskWithChildren | undefined;
  getClusterTasks: (clusterId: string) => MindMapTask[];
  getTaskChildren: (taskId: string) => MindMapTask[];
  hasPermission: (clusterId: string, userId: string, permission: Permission) => boolean;
  isClusterOwner: (clusterId: string, userId: string) => boolean;
  getMemberRole: (clusterId: string, userId: string) => Role | null;
  
  // Bulk Operations
  loadCanvasState: (hub: HubWithClusters, clusters: ClusterWithTasks[], tasks: TaskWithChildren[]) => void;
  clearCanvas: () => void;
}

// ============================================
// Store Implementation
// ============================================

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // ============================================
      // Initial State
      // ============================================
      hub: null,
      clusters: new Map(),
      tasks: new Map(),
      expandedClusters: new Set(),
      selectedElement: null,

      // ============================================
      // Hub Actions
      // ============================================
      
      /**
       * Initialize the hub with data
       * Requirement 2.3: Hub management
       */
      initializeHub: (hub: HubWithClusters) => {
        set({ hub }, false, 'initializeHub');
      },

      /**
       * Set or clear the hub
       */
      setHub: (hub: HubWithClusters | null) => {
        set({ hub }, false, 'setHub');
      },

      // ============================================
      // Cluster Actions
      // ============================================
      
      /**
       * Create a new cluster
       * Requirement 2.3: Cluster creation
       * Requirement 7.1: Creator becomes admin
       */
      createCluster: (cluster: MindMapCluster, members: ClusterMember[]) => {
        set((state) => {
          const newClusters = new Map(state.clusters);
          const clusterWithTasks: ClusterWithTasks = {
            ...cluster,
            tasks: [],
            members: members,
          };
          newClusters.set(cluster.id, clusterWithTasks);
          
          return { clusters: newClusters };
        }, false, 'createCluster');
      },

      /**
       * Update cluster properties
       */
      updateCluster: (clusterId: string, updates: Partial<MindMapCluster>) => {
        set((state) => {
          const cluster = state.clusters.get(clusterId);
          if (!cluster) return state;
          
          const newClusters = new Map(state.clusters);
          newClusters.set(clusterId, {
            ...cluster,
            ...updates,
          });
          
          return { clusters: newClusters };
        }, false, 'updateCluster');
      },

      /**
       * Delete a cluster and all its tasks
       * Requirement 2.3: Cluster management
       */
      deleteCluster: (clusterId: string) => {
        set((state) => {
          const newClusters = new Map(state.clusters);
          const cluster = newClusters.get(clusterId);
          
          if (!cluster) return state;
          
          // Remove the cluster
          newClusters.delete(clusterId);
          
          // Remove all tasks belonging to this cluster
          const newTasks = new Map(state.tasks);
          for (const [taskId, task] of newTasks.entries()) {
            if (task.clusterId === clusterId) {
              newTasks.delete(taskId);
            }
          }
          
          // Remove from expanded clusters if present
          const newExpandedClusters = new Set(state.expandedClusters);
          newExpandedClusters.delete(clusterId);
          
          return {
            clusters: newClusters,
            tasks: newTasks,
            expandedClusters: newExpandedClusters,
          };
        }, false, 'deleteCluster');
      },

      /**
       * Move cluster to a new position
       * Requirement 2.3: Cluster positioning
       */
      moveCluster: (clusterId: string, position: Position) => {
        set((state) => {
          const cluster = state.clusters.get(clusterId);
          if (!cluster) return state;
          
          const newClusters = new Map(state.clusters);
          newClusters.set(clusterId, {
            ...cluster,
            positionX: position.x,
            positionY: position.y,
          });
          
          return { clusters: newClusters };
        }, false, 'moveCluster');
      },

      /**
       * Toggle cluster expanded/collapsed state
       * Requirement 3.1: Cluster expansion
       */
      toggleCluster: (clusterId: string) => {
        set((state) => {
          const newExpandedClusters = new Set(state.expandedClusters);
          
          if (newExpandedClusters.has(clusterId)) {
            newExpandedClusters.delete(clusterId);
          } else {
            newExpandedClusters.add(clusterId);
          }
          
          // Also update the cluster's isExpanded property
          const cluster = state.clusters.get(clusterId);
          if (cluster) {
            const newClusters = new Map(state.clusters);
            newClusters.set(clusterId, {
              ...cluster,
              isExpanded: !cluster.isExpanded,
            });
            
            return {
              expandedClusters: newExpandedClusters,
              clusters: newClusters,
            };
          }
          
          return { expandedClusters: newExpandedClusters };
        }, false, 'toggleCluster');
      },

      /**
       * Set cluster expanded state explicitly
       */
      setClusterExpanded: (clusterId: string, isExpanded: boolean) => {
        set((state) => {
          const newExpandedClusters = new Set(state.expandedClusters);
          
          if (isExpanded) {
            newExpandedClusters.add(clusterId);
          } else {
            newExpandedClusters.delete(clusterId);
          }
          
          const cluster = state.clusters.get(clusterId);
          if (cluster) {
            const newClusters = new Map(state.clusters);
            newClusters.set(clusterId, {
              ...cluster,
              isExpanded,
            });
            
            return {
              expandedClusters: newExpandedClusters,
              clusters: newClusters,
            };
          }
          
          return { expandedClusters: newExpandedClusters };
        }, false, 'setClusterExpanded');
      },

      // ============================================
      // Task Actions
      // ============================================
      
      /**
       * Create a new task
       * Requirement 3.1: Task creation
       * Requirement 3.2: Nested task support
       */
      createTask: (task: MindMapTask) => {
        set((state) => {
          const newTasks = new Map(state.tasks);
          const taskWithChildren: TaskWithChildren = {
            ...task,
            children: [],
          };
          newTasks.set(task.id, taskWithChildren);
          
          // Update the cluster's tasks array
          const cluster = state.clusters.get(task.clusterId);
          if (cluster) {
            const newClusters = new Map(state.clusters);
            newClusters.set(task.clusterId, {
              ...cluster,
              tasks: [...cluster.tasks, task],
            });
            
            return { tasks: newTasks, clusters: newClusters };
          }
          
          return { tasks: newTasks };
        }, false, 'createTask');
      },

      /**
       * Update task properties
       */
      updateTask: (taskId: string, updates: Partial<MindMapTask>) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          if (!task) return state;
          
          const newTasks = new Map(state.tasks);
          const updatedTask = {
            ...task,
            ...updates,
          };
          newTasks.set(taskId, updatedTask);
          
          // Update the task in the cluster's tasks array
          const cluster = state.clusters.get(task.clusterId);
          if (cluster) {
            const newClusters = new Map(state.clusters);
            newClusters.set(task.clusterId, {
              ...cluster,
              tasks: cluster.tasks.map(t => 
                t.id === taskId ? { ...t, ...updates } : t
              ),
            });
            
            return { tasks: newTasks, clusters: newClusters };
          }
          
          return { tasks: newTasks };
        }, false, 'updateTask');
      },

      /**
       * Delete a task
       * Requirement 3.1: Task management
       */
      deleteTask: (taskId: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          if (!task) return state;
          
          const newTasks = new Map(state.tasks);
          
          // Remove the task
          newTasks.delete(taskId);
          
          // Remove all child tasks recursively
          const removeChildren = (parentId: string) => {
            for (const [id, t] of newTasks.entries()) {
              if (t.parentTaskId === parentId) {
                newTasks.delete(id);
                removeChildren(id);
              }
            }
          };
          removeChildren(taskId);
          
          // Update the cluster's tasks array
          const cluster = state.clusters.get(task.clusterId);
          if (cluster) {
            const newClusters = new Map(state.clusters);
            const remainingTaskIds = new Set(newTasks.keys());
            newClusters.set(task.clusterId, {
              ...cluster,
              tasks: cluster.tasks.filter(t => remainingTaskIds.has(t.id)),
            });
            
            return { tasks: newTasks, clusters: newClusters };
          }
          
          return { tasks: newTasks };
        }, false, 'deleteTask');
      },

      /**
       * Toggle task completion status
       * Requirement 3.1: Task completion
       */
      toggleTaskComplete: (taskId: string) => {
        set((state) => {
          const task = state.tasks.get(taskId);
          if (!task) return state;
          
          const newTasks = new Map(state.tasks);
          const updatedTask = {
            ...task,
            completed: !task.completed,
          };
          newTasks.set(taskId, updatedTask);
          
          // Update the task in the cluster's tasks array
          const cluster = state.clusters.get(task.clusterId);
          if (cluster) {
            const newClusters = new Map(state.clusters);
            newClusters.set(task.clusterId, {
              ...cluster,
              tasks: cluster.tasks.map(t => 
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            });
            
            return { tasks: newTasks, clusters: newClusters };
          }
          
          return { tasks: newTasks };
        }, false, 'toggleTaskComplete');
      },

      // ============================================
      // Member Actions
      // ============================================
      
      /**
       * Add a member to a cluster
       * Requirement 6.4: Member management
       */
      addMember: (clusterId: string, member: ClusterMember) => {
        set((state) => {
          const cluster = state.clusters.get(clusterId);
          if (!cluster) return state;
          
          // Check if member already exists
          const existingMember = cluster.members.find(m => m.userId === member.userId);
          if (existingMember) return state;
          
          const newClusters = new Map(state.clusters);
          newClusters.set(clusterId, {
            ...cluster,
            members: [...cluster.members, member],
          });
          
          return { clusters: newClusters };
        }, false, 'addMember');
      },

      /**
       * Remove a member from a cluster
       * Requirement 6.4: Member management
       */
      removeMember: (clusterId: string, userId: string) => {
        set((state) => {
          const cluster = state.clusters.get(clusterId);
          if (!cluster) return state;
          
          // Don't allow removing the owner
          if (cluster.ownerId === userId) return state;
          
          const newClusters = new Map(state.clusters);
          newClusters.set(clusterId, {
            ...cluster,
            members: cluster.members.filter(m => m.userId !== userId),
          });
          
          return { clusters: newClusters };
        }, false, 'removeMember');
      },

      /**
       * Update a member's role
       * Requirement 6.4: Role management
       */
      updateMemberRole: (clusterId: string, userId: string, role: Role) => {
        set((state) => {
          const cluster = state.clusters.get(clusterId);
          if (!cluster) return state;
          
          const newClusters = new Map(state.clusters);
          newClusters.set(clusterId, {
            ...cluster,
            members: cluster.members.map(m =>
              m.userId === userId ? { ...m, role } : m
            ),
          });
          
          return { clusters: newClusters };
        }, false, 'updateMemberRole');
      },

      /**
       * Update a member's permissions
       * Requirement 6.4: Permission management
       */
      updateMemberPermissions: (clusterId: string, userId: string, permissions: Permission[]) => {
        set((state) => {
          const cluster = state.clusters.get(clusterId);
          if (!cluster) return state;
          
          const newClusters = new Map(state.clusters);
          newClusters.set(clusterId, {
            ...cluster,
            members: cluster.members.map(m =>
              m.userId === userId ? { ...m, permissions } : m
            ),
          });
          
          return { clusters: newClusters };
        }, false, 'updateMemberPermissions');
      },

      // ============================================
      // Selection Actions
      // ============================================
      
      /**
       * Select or deselect an element
       */
      selectElement: (elementId: string | null) => {
        set({ selectedElement: elementId }, false, 'selectElement');
      },

      // ============================================
      // Utility Functions
      // ============================================
      
      /**
       * Get a cluster by ID
       */
      getCluster: (clusterId: string) => {
        return get().clusters.get(clusterId);
      },

      /**
       * Get a task by ID
       */
      getTask: (taskId: string) => {
        return get().tasks.get(taskId);
      },

      /**
       * Get all tasks for a cluster
       * Requirement 3.1: Task retrieval
       */
      getClusterTasks: (clusterId: string) => {
        const state = get();
        const tasks: MindMapTask[] = [];
        
        for (const task of state.tasks.values()) {
          if (task.clusterId === clusterId) {
            tasks.push(task);
          }
        }
        
        return tasks;
      },

      /**
       * Get all child tasks for a parent task
       * Requirement 3.2: Nested task support
       */
      getTaskChildren: (taskId: string) => {
        const state = get();
        const children: MindMapTask[] = [];
        
        for (const task of state.tasks.values()) {
          if (task.parentTaskId === taskId) {
            children.push(task);
          }
        }
        
        return children;
      },

      /**
       * Check if a user has a specific permission in a cluster
       * Requirement 8.3: Permission checking
       */
      hasPermission: (clusterId: string, userId: string, permission: Permission) => {
        const state = get();
        const cluster = state.clusters.get(clusterId);
        
        if (!cluster) return false;
        
        // Owner (admin) has all permissions
        if (cluster.ownerId === userId) return true;
        
        // Find the member
        const member = cluster.members.find(m => m.userId === userId);
        if (!member) return false;
        
        // Admin role has all permissions
        if (member.role === 'admin') return true;
        
        // Viewer has no permissions (read-only)
        if (member.role === 'viewer') return false;
        
        // Check specific permission for user role
        return member.permissions.includes(permission);
      },

      /**
       * Check if a user is the owner of a cluster
       * Requirement 7.1: Owner identification
       */
      isClusterOwner: (clusterId: string, userId: string) => {
        const state = get();
        const cluster = state.clusters.get(clusterId);
        
        if (!cluster) return false;
        
        return cluster.ownerId === userId;
      },

      /**
       * Get a member's role in a cluster
       * Requirement 6.4: Role retrieval
       */
      getMemberRole: (clusterId: string, userId: string) => {
        const state = get();
        const cluster = state.clusters.get(clusterId);
        
        if (!cluster) return null;
        
        // Check if user is the owner
        if (cluster.ownerId === userId) return 'admin';
        
        // Find the member
        const member = cluster.members.find(m => m.userId === userId);
        
        return member ? member.role : null;
      },

      // ============================================
      // Bulk Operations
      // ============================================
      
      /**
       * Load complete canvas state
       * Used for initial load or sync
       */
      loadCanvasState: (hub: HubWithClusters, clusters: ClusterWithTasks[], tasks: TaskWithChildren[]) => {
        const clustersMap = new Map<string, ClusterWithTasks>();
        clusters.forEach(cluster => {
          clustersMap.set(cluster.id, cluster);
        });
        
        const tasksMap = new Map<string, TaskWithChildren>();
        tasks.forEach(task => {
          tasksMap.set(task.id, task);
        });
        
        // Determine which clusters are expanded
        const expandedClusters = new Set<string>();
        clusters.forEach(cluster => {
          if (cluster.isExpanded) {
            expandedClusters.add(cluster.id);
          }
        });
        
        set({
          hub,
          clusters: clustersMap,
          tasks: tasksMap,
          expandedClusters,
          selectedElement: null,
        }, false, 'loadCanvasState');
      },

      /**
       * Clear all canvas state
       */
      clearCanvas: () => {
        set({
          hub: null,
          clusters: new Map(),
          tasks: new Map(),
          expandedClusters: new Set(),
          selectedElement: null,
        }, false, 'clearCanvas');
      },
    }),
    {
      name: 'canvas-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// Selector Hooks for Performance
// ============================================

/**
 * Get all clusters as an array
 */
export const useClusters = () => useCanvasStore(state => Array.from(state.clusters.values()));

/**
 * Get all tasks as an array
 */
export const useTasks = () => useCanvasStore(state => Array.from(state.tasks.values()));

/**
 * Get a specific cluster
 */
export const useCluster = (clusterId: string) => useCanvasStore(state => state.clusters.get(clusterId));

/**
 * Get a specific task
 */
export const useTask = (taskId: string) => useCanvasStore(state => state.tasks.get(taskId));

/**
 * Check if a cluster is expanded
 */
export const useIsClusterExpanded = (clusterId: string) => 
  useCanvasStore(state => state.expandedClusters.has(clusterId));

/**
 * Get tasks for a specific cluster
 */
export const useClusterTasks = (clusterId: string) => 
  useCanvasStore(state => state.getClusterTasks(clusterId));

/**
 * Get children for a specific task
 */
export const useTaskChildren = (taskId: string) => 
  useCanvasStore(state => state.getTaskChildren(taskId));
