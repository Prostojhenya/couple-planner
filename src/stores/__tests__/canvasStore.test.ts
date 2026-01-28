/**
 * Unit tests for CanvasStore
 * 
 * Tests cover:
 * - Hub initialization
 * - Cluster CRUD operations
 * - Task CRUD operations
 * - Member management
 * - Permission checking
 * - Utility functions
 * 
 * Requirements: 2.3, 3.1, 3.2, 6.4, 7.1, 8.3
 */

import { useCanvasStore } from '../canvasStore';
import type {
  Hub,
  MindMapCluster,
  MindMapTask,
  ClusterMember,
  HubWithClusters,
  ClusterWithTasks,
  TaskWithChildren,
} from '@/types/mindmap';

// Helper function to create test data
const createTestHub = (id: string = 'hub-1'): HubWithClusters => ({
  id,
  userId: 'user-1',
  contextType: 'personal',
  participants: ['U1'],
  clusters: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createTestCluster = (id: string = 'cluster-1', ownerId: string = 'user-1'): MindMapCluster => ({
  id,
  hubId: 'hub-1',
  ownerId,
  type: 'task',
  positionX: 100,
  positionY: 100,
  isExpanded: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createTestClusterWithTasks = (id: string = 'cluster-1', ownerId: string = 'user-1'): ClusterWithTasks => ({
  ...createTestCluster(id, ownerId),
  tasks: [],
  members: [],
});

const createTestTask = (id: string = 'task-1', clusterId: string = 'cluster-1'): MindMapTask => ({
  id,
  clusterId,
  parentTaskId: null,
  title: 'Test Task',
  completed: false,
  icon: 'check',
  positionX: null,
  positionY: null,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createTestTaskWithChildren = (id: string = 'task-1', clusterId: string = 'cluster-1'): TaskWithChildren => ({
  ...createTestTask(id, clusterId),
  children: [],
});

const createTestMember = (userId: string = 'user-2', role: 'admin' | 'user' | 'viewer' = 'user'): ClusterMember => ({
  id: `member-${userId}`,
  clusterId: 'cluster-1',
  userId,
  role,
  permissions: role === 'admin' ? ['add_tasks', 'complete_tasks', 'delete_tasks', 'invite_members', 'manage_permissions'] : ['add_tasks', 'complete_tasks'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('CanvasStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCanvasStore.getState().clearCanvas();
  });

  describe('Hub Management', () => {
    it('should initialize hub', () => {
      const hub = createTestHub();
      useCanvasStore.getState().initializeHub(hub);
      
      expect(useCanvasStore.getState().hub).toEqual(hub);
    });

    it('should set hub to null', () => {
      const hub = createTestHub();
      useCanvasStore.getState().initializeHub(hub);
      useCanvasStore.getState().setHub(null);
      
      expect(useCanvasStore.getState().hub).toBeNull();
    });
  });

  describe('Cluster Management', () => {
    it('should create a cluster', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      
      useCanvasStore.getState().createCluster(cluster, members);
      
      const storedCluster = useCanvasStore.getState().clusters.get(cluster.id);
      expect(storedCluster).toBeDefined();
      expect(storedCluster?.id).toBe(cluster.id);
      expect(storedCluster?.members).toEqual(members);
    });

    it('should update cluster properties', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      
      useCanvasStore.getState().createCluster(cluster, members);
      useCanvasStore.getState().updateCluster(cluster.id, { type: 'event' });
      
      const updatedCluster = useCanvasStore.getState().clusters.get(cluster.id);
      expect(updatedCluster?.type).toBe('event');
    });

    it('should delete a cluster', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      
      useCanvasStore.getState().createCluster(cluster, members);
      useCanvasStore.getState().deleteCluster(cluster.id);
      
      const deletedCluster = useCanvasStore.getState().clusters.get(cluster.id);
      expect(deletedCluster).toBeUndefined();
    });

    it('should delete cluster and all its tasks', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      const task = createTestTask('task-1', cluster.id);
      
      useCanvasStore.getState().createCluster(cluster, members);
      useCanvasStore.getState().createTask(task);
      useCanvasStore.getState().deleteCluster(cluster.id);
      
      const deletedTask = useCanvasStore.getState().tasks.get(task.id);
      expect(deletedTask).toBeUndefined();
    });

    it('should move cluster to new position', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      
      useCanvasStore.getState().createCluster(cluster, members);
      useCanvasStore.getState().moveCluster(cluster.id, { x: 200, y: 300 });
      
      const movedCluster = useCanvasStore.getState().clusters.get(cluster.id);
      expect(movedCluster?.positionX).toBe(200);
      expect(movedCluster?.positionY).toBe(300);
    });

    it('should toggle cluster expanded state', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      
      useCanvasStore.getState().createCluster(cluster, members);
      
      // Initially not expanded
      expect(useCanvasStore.getState().expandedClusters.has(cluster.id)).toBe(false);
      
      // Toggle to expanded
      useCanvasStore.getState().toggleCluster(cluster.id);
      expect(useCanvasStore.getState().expandedClusters.has(cluster.id)).toBe(true);
      
      // Toggle back to collapsed
      useCanvasStore.getState().toggleCluster(cluster.id);
      expect(useCanvasStore.getState().expandedClusters.has(cluster.id)).toBe(false);
    });

    it('should set cluster expanded state explicitly', () => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      
      useCanvasStore.getState().createCluster(cluster, members);
      useCanvasStore.getState().setClusterExpanded(cluster.id, true);
      
      expect(useCanvasStore.getState().expandedClusters.has(cluster.id)).toBe(true);
      
      useCanvasStore.getState().setClusterExpanded(cluster.id, false);
      expect(useCanvasStore.getState().expandedClusters.has(cluster.id)).toBe(false);
    });
  });

  describe('Task Management', () => {
    beforeEach(() => {
      // Create a cluster for tasks
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      useCanvasStore.getState().createCluster(cluster, members);
    });

    it('should create a task', () => {
      const task = createTestTask();
      
      useCanvasStore.getState().createTask(task);
      
      const storedTask = useCanvasStore.getState().tasks.get(task.id);
      expect(storedTask).toBeDefined();
      expect(storedTask?.id).toBe(task.id);
      expect(storedTask?.title).toBe('Test Task');
    });

    it('should create a nested task', () => {
      const parentTask = createTestTask('parent-task');
      const childTask = createTestTask('child-task');
      childTask.parentTaskId = parentTask.id;
      
      useCanvasStore.getState().createTask(parentTask);
      useCanvasStore.getState().createTask(childTask);
      
      const storedChild = useCanvasStore.getState().tasks.get(childTask.id);
      expect(storedChild?.parentTaskId).toBe(parentTask.id);
    });

    it('should update task properties', () => {
      const task = createTestTask();
      
      useCanvasStore.getState().createTask(task);
      useCanvasStore.getState().updateTask(task.id, { title: 'Updated Task' });
      
      const updatedTask = useCanvasStore.getState().tasks.get(task.id);
      expect(updatedTask?.title).toBe('Updated Task');
    });

    it('should delete a task', () => {
      const task = createTestTask();
      
      useCanvasStore.getState().createTask(task);
      useCanvasStore.getState().deleteTask(task.id);
      
      const deletedTask = useCanvasStore.getState().tasks.get(task.id);
      expect(deletedTask).toBeUndefined();
    });

    it('should delete task and all its children recursively', () => {
      const parentTask = createTestTask('parent-task');
      const childTask = createTestTask('child-task');
      childTask.parentTaskId = parentTask.id;
      const grandchildTask = createTestTask('grandchild-task');
      grandchildTask.parentTaskId = childTask.id;
      
      useCanvasStore.getState().createTask(parentTask);
      useCanvasStore.getState().createTask(childTask);
      useCanvasStore.getState().createTask(grandchildTask);
      
      useCanvasStore.getState().deleteTask(parentTask.id);
      
      expect(useCanvasStore.getState().tasks.get(parentTask.id)).toBeUndefined();
      expect(useCanvasStore.getState().tasks.get(childTask.id)).toBeUndefined();
      expect(useCanvasStore.getState().tasks.get(grandchildTask.id)).toBeUndefined();
    });

    it('should toggle task completion', () => {
      const task = createTestTask();
      
      useCanvasStore.getState().createTask(task);
      
      // Initially not completed
      expect(useCanvasStore.getState().tasks.get(task.id)?.completed).toBe(false);
      
      // Toggle to completed
      useCanvasStore.getState().toggleTaskComplete(task.id);
      expect(useCanvasStore.getState().tasks.get(task.id)?.completed).toBe(true);
      
      // Toggle back to not completed
      useCanvasStore.getState().toggleTaskComplete(task.id);
      expect(useCanvasStore.getState().tasks.get(task.id)?.completed).toBe(false);
    });
  });

  describe('Member Management', () => {
    beforeEach(() => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      useCanvasStore.getState().createCluster(cluster, members);
    });

    it('should add a member to cluster', () => {
      const newMember = createTestMember('user-2', 'user');
      
      useCanvasStore.getState().addMember('cluster-1', newMember);
      
      const cluster = useCanvasStore.getState().clusters.get('cluster-1');
      expect(cluster?.members).toHaveLength(2);
      expect(cluster?.members.find(m => m.userId === 'user-2')).toBeDefined();
    });

    it('should not add duplicate member', () => {
      const member = createTestMember('user-1', 'admin');
      
      useCanvasStore.getState().addMember('cluster-1', member);
      
      const cluster = useCanvasStore.getState().clusters.get('cluster-1');
      expect(cluster?.members).toHaveLength(1); // Still only 1 member
    });

    it('should remove a member from cluster', () => {
      const newMember = createTestMember('user-2', 'user');
      
      useCanvasStore.getState().addMember('cluster-1', newMember);
      useCanvasStore.getState().removeMember('cluster-1', 'user-2');
      
      const cluster = useCanvasStore.getState().clusters.get('cluster-1');
      expect(cluster?.members.find(m => m.userId === 'user-2')).toBeUndefined();
    });

    it('should not remove cluster owner', () => {
      useCanvasStore.getState().removeMember('cluster-1', 'user-1');
      
      const cluster = useCanvasStore.getState().clusters.get('cluster-1');
      expect(cluster?.members).toHaveLength(1); // Owner still present
    });

    it('should update member role', () => {
      const newMember = createTestMember('user-2', 'user');
      
      useCanvasStore.getState().addMember('cluster-1', newMember);
      useCanvasStore.getState().updateMemberRole('cluster-1', 'user-2', 'admin');
      
      const cluster = useCanvasStore.getState().clusters.get('cluster-1');
      const member = cluster?.members.find(m => m.userId === 'user-2');
      expect(member?.role).toBe('admin');
    });

    it('should update member permissions', () => {
      const newMember = createTestMember('user-2', 'user');
      
      useCanvasStore.getState().addMember('cluster-1', newMember);
      useCanvasStore.getState().updateMemberPermissions('cluster-1', 'user-2', ['add_tasks', 'delete_tasks']);
      
      const cluster = useCanvasStore.getState().clusters.get('cluster-1');
      const member = cluster?.members.find(m => m.userId === 'user-2');
      expect(member?.permissions).toEqual(['add_tasks', 'delete_tasks']);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      const cluster = createTestCluster('cluster-1', 'user-1');
      const members = [
        createTestMember('user-1', 'admin'),
        createTestMember('user-2', 'user'),
        createTestMember('user-3', 'viewer'),
      ];
      useCanvasStore.getState().createCluster(cluster, members);
    });

    it('should grant all permissions to owner', () => {
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-1', 'add_tasks')).toBe(true);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-1', 'delete_tasks')).toBe(true);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-1', 'invite_members')).toBe(true);
    });

    it('should grant all permissions to admin', () => {
      // Update user-2 to admin
      useCanvasStore.getState().updateMemberRole('cluster-1', 'user-2', 'admin');
      
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'add_tasks')).toBe(true);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'delete_tasks')).toBe(true);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'invite_members')).toBe(true);
    });

    it('should grant only specific permissions to user', () => {
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'add_tasks')).toBe(true);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'complete_tasks')).toBe(true);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'delete_tasks')).toBe(false);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'invite_members')).toBe(false);
    });

    it('should deny all permissions to viewer', () => {
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-3', 'add_tasks')).toBe(false);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-3', 'complete_tasks')).toBe(false);
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-3', 'delete_tasks')).toBe(false);
    });

    it('should deny permissions to non-members', () => {
      expect(useCanvasStore.getState().hasPermission('cluster-1', 'user-999', 'add_tasks')).toBe(false);
    });

    it('should identify cluster owner correctly', () => {
      expect(useCanvasStore.getState().isClusterOwner('cluster-1', 'user-1')).toBe(true);
      expect(useCanvasStore.getState().isClusterOwner('cluster-1', 'user-2')).toBe(false);
    });

    it('should get member role correctly', () => {
      expect(useCanvasStore.getState().getMemberRole('cluster-1', 'user-1')).toBe('admin');
      expect(useCanvasStore.getState().getMemberRole('cluster-1', 'user-2')).toBe('user');
      expect(useCanvasStore.getState().getMemberRole('cluster-1', 'user-3')).toBe('viewer');
      expect(useCanvasStore.getState().getMemberRole('cluster-1', 'user-999')).toBeNull();
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      useCanvasStore.getState().createCluster(cluster, members);
    });

    it('should get cluster by id', () => {
      const cluster = useCanvasStore.getState().getCluster('cluster-1');
      expect(cluster).toBeDefined();
      expect(cluster?.id).toBe('cluster-1');
    });

    it('should get task by id', () => {
      const task = createTestTask();
      useCanvasStore.getState().createTask(task);
      
      const retrievedTask = useCanvasStore.getState().getTask(task.id);
      expect(retrievedTask).toBeDefined();
      expect(retrievedTask?.id).toBe(task.id);
    });

    it('should get all tasks for a cluster', () => {
      const task1 = createTestTask('task-1', 'cluster-1');
      const task2 = createTestTask('task-2', 'cluster-1');
      const task3 = createTestTask('task-3', 'cluster-1');
      
      useCanvasStore.getState().createTask(task1);
      useCanvasStore.getState().createTask(task2);
      useCanvasStore.getState().createTask(task3);
      
      const clusterTasks = useCanvasStore.getState().getClusterTasks('cluster-1');
      expect(clusterTasks).toHaveLength(3);
    });

    it('should get child tasks for a parent task', () => {
      const parentTask = createTestTask('parent-task');
      const childTask1 = createTestTask('child-1');
      childTask1.parentTaskId = parentTask.id;
      const childTask2 = createTestTask('child-2');
      childTask2.parentTaskId = parentTask.id;
      
      useCanvasStore.getState().createTask(parentTask);
      useCanvasStore.getState().createTask(childTask1);
      useCanvasStore.getState().createTask(childTask2);
      
      const children = useCanvasStore.getState().getTaskChildren(parentTask.id);
      expect(children).toHaveLength(2);
    });
  });

  describe('Bulk Operations', () => {
    it('should load complete canvas state', () => {
      const hub = createTestHub();
      const clusters = [createTestClusterWithTasks('cluster-1'), createTestClusterWithTasks('cluster-2')];
      const tasks = [createTestTaskWithChildren('task-1'), createTestTaskWithChildren('task-2')];
      
      useCanvasStore.getState().loadCanvasState(hub, clusters, tasks);
      
      expect(useCanvasStore.getState().hub).toEqual(hub);
      expect(useCanvasStore.getState().clusters.size).toBe(2);
      expect(useCanvasStore.getState().tasks.size).toBe(2);
    });

    it('should clear all canvas state', () => {
      const hub = createTestHub();
      const cluster = createTestCluster();
      const members = [createTestMember('user-1', 'admin')];
      const task = createTestTask();
      
      useCanvasStore.getState().initializeHub(hub);
      useCanvasStore.getState().createCluster(cluster, members);
      useCanvasStore.getState().createTask(task);
      
      useCanvasStore.getState().clearCanvas();
      
      expect(useCanvasStore.getState().hub).toBeNull();
      expect(useCanvasStore.getState().clusters.size).toBe(0);
      expect(useCanvasStore.getState().tasks.size).toBe(0);
      expect(useCanvasStore.getState().expandedClusters.size).toBe(0);
    });
  });

  describe('Selection Management', () => {
    it('should select an element', () => {
      useCanvasStore.getState().selectElement('cluster-1');
      expect(useCanvasStore.getState().selectedElement).toBe('cluster-1');
    });

    it('should deselect an element', () => {
      useCanvasStore.getState().selectElement('cluster-1');
      useCanvasStore.getState().selectElement(null);
      expect(useCanvasStore.getState().selectedElement).toBeNull();
    });
  });
});
