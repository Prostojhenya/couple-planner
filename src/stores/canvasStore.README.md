# CanvasStore - State Management for Visual Mind-Map Task System

## Overview

The `CanvasStore` is a Zustand-based state management solution for the Visual Mind-Map Task System. It provides centralized state management for the canvas, including hubs, clusters, tasks, and member permissions.

## Features

- **Hub Management**: Initialize and manage the central hub element
- **Cluster Operations**: Create, update, delete, move, and toggle clusters
- **Task Operations**: Create, update, delete, and manage nested tasks
- **Member Management**: Add, remove, and update cluster members and their permissions
- **Permission System**: Role-based access control (Admin, User, Viewer)
- **Utility Functions**: Helper methods for querying state and checking permissions
- **DevTools Integration**: Redux DevTools support for debugging in development

## Requirements Satisfied

- **Requirement 2.3**: Cluster creation and management
- **Requirement 3.1**: Task creation from clusters
- **Requirement 3.2**: Nested task support
- **Requirement 6.4**: Member and permission management
- **Requirement 7.1**: Creator becomes admin automatically
- **Requirement 8.3**: Permission checking before actions

## Installation

The store is already set up with Zustand. To use it in your components:

```typescript
import { useCanvasStore } from '@/stores/canvasStore';
```

## Usage

### Basic Usage

```typescript
import { useCanvasStore } from '@/stores/canvasStore';

function MyComponent() {
  // Access state
  const hub = useCanvasStore(state => state.hub);
  const clusters = useCanvasStore(state => state.clusters);
  
  // Access actions
  const createCluster = useCanvasStore(state => state.createCluster);
  const createTask = useCanvasStore(state => state.createTask);
  
  // Use in your component
  const handleCreateCluster = () => {
    const cluster = {
      id: 'cluster-1',
      hubId: 'hub-1',
      ownerId: 'user-1',
      type: 'task',
      positionX: 100,
      positionY: 100,
      isExpanded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const members = [{
      id: 'member-1',
      clusterId: 'cluster-1',
      userId: 'user-1',
      role: 'admin',
      permissions: ['add_tasks', 'complete_tasks', 'delete_tasks', 'invite_members', 'manage_permissions'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    
    createCluster(cluster, members);
  };
  
  return (
    <button onClick={handleCreateCluster}>Create Cluster</button>
  );
}
```

### Using Selector Hooks

For better performance, use the provided selector hooks:

```typescript
import { 
  useClusters, 
  useTasks, 
  useCluster, 
  useTask,
  useIsClusterExpanded,
  useClusterTasks,
  useTaskChildren
} from '@/stores/canvasStore';

function ClusterList() {
  // Get all clusters as an array
  const clusters = useClusters();
  
  return (
    <div>
      {clusters.map(cluster => (
        <ClusterItem key={cluster.id} clusterId={cluster.id} />
      ))}
    </div>
  );
}

function ClusterItem({ clusterId }: { clusterId: string }) {
  // Get a specific cluster
  const cluster = useCluster(clusterId);
  
  // Check if expanded
  const isExpanded = useIsClusterExpanded(clusterId);
  
  // Get tasks for this cluster
  const tasks = useClusterTasks(clusterId);
  
  if (!cluster) return null;
  
  return (
    <div>
      <h3>{cluster.type}</h3>
      <p>Tasks: {tasks.length}</p>
      <p>Expanded: {isExpanded ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## API Reference

### State

| Property | Type | Description |
|----------|------|-------------|
| `hub` | `HubWithClusters \| null` | The central hub element |
| `clusters` | `Map<string, ClusterWithTasks>` | Map of all clusters by ID |
| `tasks` | `Map<string, TaskWithChildren>` | Map of all tasks by ID |
| `expandedClusters` | `Set<string>` | Set of expanded cluster IDs |
| `selectedElement` | `string \| null` | Currently selected element ID |

### Hub Actions

#### `initializeHub(hub: HubWithClusters): void`
Initialize the hub with data.

```typescript
const hub = {
  id: 'hub-1',
  userId: 'user-1',
  contextType: 'personal',
  participants: ['U1'],
  clusters: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

useCanvasStore.getState().initializeHub(hub);
```

#### `setHub(hub: HubWithClusters | null): void`
Set or clear the hub.

### Cluster Actions

#### `createCluster(cluster: MindMapCluster, members: ClusterMember[]): void`
Create a new cluster. The creator is automatically added as admin (Requirement 7.1).

```typescript
const cluster = {
  id: 'cluster-1',
  hubId: 'hub-1',
  ownerId: 'user-1',
  type: 'task',
  positionX: 100,
  positionY: 100,
  isExpanded: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const members = [{
  id: 'member-1',
  clusterId: 'cluster-1',
  userId: 'user-1',
  role: 'admin',
  permissions: ['add_tasks', 'complete_tasks', 'delete_tasks', 'invite_members', 'manage_permissions'],
  createdAt: new Date(),
  updatedAt: new Date(),
}];

useCanvasStore.getState().createCluster(cluster, members);
```

#### `updateCluster(clusterId: string, updates: Partial<MindMapCluster>): void`
Update cluster properties.

```typescript
useCanvasStore.getState().updateCluster('cluster-1', { type: 'event' });
```

#### `deleteCluster(clusterId: string): void`
Delete a cluster and all its tasks.

```typescript
useCanvasStore.getState().deleteCluster('cluster-1');
```

#### `moveCluster(clusterId: string, position: Position): void`
Move cluster to a new position.

```typescript
useCanvasStore.getState().moveCluster('cluster-1', { x: 200, y: 300 });
```

#### `toggleCluster(clusterId: string): void`
Toggle cluster expanded/collapsed state.

```typescript
useCanvasStore.getState().toggleCluster('cluster-1');
```

#### `setClusterExpanded(clusterId: string, isExpanded: boolean): void`
Set cluster expanded state explicitly.

```typescript
useCanvasStore.getState().setClusterExpanded('cluster-1', true);
```

### Task Actions

#### `createTask(task: MindMapTask): void`
Create a new task. Supports nested tasks via `parentTaskId` (Requirement 3.2).

```typescript
const task = {
  id: 'task-1',
  clusterId: 'cluster-1',
  parentTaskId: null, // or parent task ID for nested tasks
  title: 'My Task',
  completed: false,
  icon: 'check',
  positionX: null,
  positionY: null,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

useCanvasStore.getState().createTask(task);
```

#### `updateTask(taskId: string, updates: Partial<MindMapTask>): void`
Update task properties.

```typescript
useCanvasStore.getState().updateTask('task-1', { title: 'Updated Task' });
```

#### `deleteTask(taskId: string): void`
Delete a task and all its children recursively.

```typescript
useCanvasStore.getState().deleteTask('task-1');
```

#### `toggleTaskComplete(taskId: string): void`
Toggle task completion status.

```typescript
useCanvasStore.getState().toggleTaskComplete('task-1');
```

### Member Actions

#### `addMember(clusterId: string, member: ClusterMember): void`
Add a member to a cluster (Requirement 6.4).

```typescript
const member = {
  id: 'member-2',
  clusterId: 'cluster-1',
  userId: 'user-2',
  role: 'user',
  permissions: ['add_tasks', 'complete_tasks'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

useCanvasStore.getState().addMember('cluster-1', member);
```

#### `removeMember(clusterId: string, userId: string): void`
Remove a member from a cluster. Cannot remove the owner.

```typescript
useCanvasStore.getState().removeMember('cluster-1', 'user-2');
```

#### `updateMemberRole(clusterId: string, userId: string, role: Role): void`
Update a member's role.

```typescript
useCanvasStore.getState().updateMemberRole('cluster-1', 'user-2', 'admin');
```

#### `updateMemberPermissions(clusterId: string, userId: string, permissions: Permission[]): void`
Update a member's permissions.

```typescript
useCanvasStore.getState().updateMemberPermissions('cluster-1', 'user-2', ['add_tasks', 'delete_tasks']);
```

### Utility Functions

#### `getCluster(clusterId: string): ClusterWithTasks | undefined`
Get a cluster by ID.

```typescript
const cluster = useCanvasStore.getState().getCluster('cluster-1');
```

#### `getTask(taskId: string): TaskWithChildren | undefined`
Get a task by ID.

```typescript
const task = useCanvasStore.getState().getTask('task-1');
```

#### `getClusterTasks(clusterId: string): MindMapTask[]`
Get all tasks for a cluster.

```typescript
const tasks = useCanvasStore.getState().getClusterTasks('cluster-1');
```

#### `getTaskChildren(taskId: string): MindMapTask[]`
Get all child tasks for a parent task.

```typescript
const children = useCanvasStore.getState().getTaskChildren('parent-task-1');
```

#### `hasPermission(clusterId: string, userId: string, permission: Permission): boolean`
Check if a user has a specific permission in a cluster (Requirement 8.3).

```typescript
const canAddTasks = useCanvasStore.getState().hasPermission('cluster-1', 'user-2', 'add_tasks');
```

**Permission Logic:**
- Owner (admin) has all permissions
- Admin role has all permissions
- Viewer role has no permissions (read-only)
- User role has only the permissions explicitly granted

#### `isClusterOwner(clusterId: string, userId: string): boolean`
Check if a user is the owner of a cluster.

```typescript
const isOwner = useCanvasStore.getState().isClusterOwner('cluster-1', 'user-1');
```

#### `getMemberRole(clusterId: string, userId: string): Role | null`
Get a member's role in a cluster.

```typescript
const role = useCanvasStore.getState().getMemberRole('cluster-1', 'user-2');
// Returns: 'admin' | 'user' | 'viewer' | null
```

### Bulk Operations

#### `loadCanvasState(hub: HubWithClusters, clusters: ClusterWithTasks[], tasks: TaskWithChildren[]): void`
Load complete canvas state. Used for initial load or sync.

```typescript
useCanvasStore.getState().loadCanvasState(hub, clusters, tasks);
```

#### `clearCanvas(): void`
Clear all canvas state.

```typescript
useCanvasStore.getState().clearCanvas();
```

## Permission System

The store implements a role-based permission system:

### Roles

1. **Admin**: Full access to all operations
   - Can create, update, delete clusters and tasks
   - Can invite and manage members
   - Can change permissions

2. **User**: Limited access based on granted permissions
   - Default permissions: `add_tasks`, `complete_tasks`
   - Can be granted additional permissions by admin

3. **Viewer**: Read-only access
   - Cannot perform any write operations
   - Can only view clusters and tasks

### Permissions

- `add_tasks`: Can create new tasks
- `complete_tasks`: Can mark tasks as complete
- `delete_tasks`: Can delete tasks
- `invite_members`: Can invite new members
- `manage_permissions`: Can change member permissions

### Permission Checking Example

```typescript
function TaskActions({ taskId, clusterId, userId }: Props) {
  const canDelete = useCanvasStore(state => 
    state.hasPermission(clusterId, userId, 'delete_tasks')
  );
  
  const handleDelete = () => {
    if (!canDelete) {
      alert('You do not have permission to delete tasks');
      return;
    }
    
    useCanvasStore.getState().deleteTask(taskId);
  };
  
  return (
    <button onClick={handleDelete} disabled={!canDelete}>
      Delete Task
    </button>
  );
}
```

## Best Practices

1. **Use Selector Hooks**: Use the provided selector hooks (`useClusters`, `useCluster`, etc.) for better performance and automatic re-renders.

2. **Check Permissions**: Always check permissions before performing actions that modify data.

3. **Handle Nested Tasks**: When deleting tasks, remember that all children are deleted recursively.

4. **Owner Protection**: The owner cannot be removed from a cluster.

5. **DevTools**: Use Redux DevTools in development to debug state changes.

## Testing

The store includes comprehensive unit tests covering:
- Hub management
- Cluster CRUD operations
- Task CRUD operations
- Member management
- Permission checking
- Utility functions
- Bulk operations

Run tests with:
```bash
npm test -- src/stores/__tests__/canvasStore.test.ts
```

## Integration with API

The store is designed to work with the API layer. Typical flow:

1. **Client Action**: User performs an action (e.g., create cluster)
2. **API Call**: Send request to API endpoint
3. **Update Store**: On success, update the store with the new data
4. **WebSocket Sync**: Broadcast change to other users via WebSocket

Example:
```typescript
async function createClusterWithAPI(clusterData: CreateClusterDto) {
  try {
    // 1. Call API
    const response = await fetch('/api/clusters', {
      method: 'POST',
      body: JSON.stringify(clusterData),
    });
    
    const cluster = await response.json();
    
    // 2. Update store
    useCanvasStore.getState().createCluster(cluster, cluster.members);
    
    // 3. WebSocket will sync to other users automatically
  } catch (error) {
    console.error('Failed to create cluster:', error);
  }
}
```

## Related Files

- **Types**: `src/types/mindmap.ts` - TypeScript types and interfaces
- **Tests**: `src/stores/__tests__/canvasStore.test.ts` - Unit tests
- **Design**: `.kiro/specs/visual-mind-map-task-system/design.md` - System design document
- **Requirements**: `.kiro/specs/visual-mind-map-task-system/requirements.md` - Requirements document

## Future Enhancements

Potential improvements for future iterations:

1. **Undo/Redo**: Add history tracking for undo/redo functionality
2. **Optimistic Updates**: Implement optimistic UI updates before API confirmation
3. **Persistence**: Add local storage persistence for offline support
4. **Computed Values**: Add memoized selectors for expensive computations
5. **Middleware**: Add custom middleware for logging, analytics, etc.
