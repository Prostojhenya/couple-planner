/**
 * TypeScript types for Visual Mind-Map Task System
 * Generated from Prisma schema
 */

import { Hub, MindMapCluster, MindMapTask, ClusterMember, InviteLink } from '@prisma/client';

// ============================================
// Base Types from Prisma
// ============================================

export type { Hub, MindMapCluster, MindMapTask, ClusterMember, InviteLink };

// ============================================
// Enums and Constants
// ============================================

export type ContextType = 'personal' | 'shared' | 'group';

export type ClusterType = 'task' | 'event' | 'shop' | 'custom';

export type Role = 'admin' | 'user' | 'viewer';

export type Permission = 
  | 'add_tasks'
  | 'complete_tasks'
  | 'delete_tasks'
  | 'invite_members'
  | 'manage_permissions';

export const PERMISSIONS: Permission[] = [
  'add_tasks',
  'complete_tasks',
  'delete_tasks',
  'invite_members',
  'manage_permissions',
];

// ============================================
// Visual Element Sizes (in pixels)
// ============================================

export const BUBBLE_SIZES = {
  TASK: 32,
  CLUSTER: 96,
  HUB: 128,
} as const;

// ============================================
// Position Interface
// ============================================

export interface Position {
  x: number;
  y: number;
}

// ============================================
// Extended Types with Relations
// ============================================

export interface HubWithClusters extends Hub {
  clusters: MindMapCluster[];
}

export interface ClusterWithTasks extends MindMapCluster {
  tasks: MindMapTask[];
  members: ClusterMember[];
}

export interface ClusterWithRelations extends MindMapCluster {
  tasks: MindMapTask[];
  members: ClusterMember[];
  inviteLinks: InviteLink[];
  hub: Hub;
}

export interface TaskWithChildren extends MindMapTask {
  children: MindMapTask[];
}

export interface TaskWithRelations extends MindMapTask {
  children: MindMapTask[];
  parent: MindMapTask | null;
  cluster: MindMapCluster;
}

// ============================================
// DTO Types for API
// ============================================

export interface CreateHubDto {
  contextType: ContextType;
  participants: string[];
}

export interface CreateClusterDto {
  hubId: string;
  type: ClusterType;
  positionX: number;
  positionY: number;
}

export interface UpdateClusterDto {
  type?: ClusterType;
  positionX?: number;
  positionY?: number;
  isExpanded?: boolean;
}

export interface CreateTaskDto {
  clusterId: string;
  title: string;
  parentTaskId?: string;
  icon?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateTaskDto {
  title?: string;
  completed?: boolean;
  icon?: string;
  positionX?: number;
  positionY?: number;
  order?: number;
}

export interface AddMemberDto {
  userId: string;
  role: Role;
  permissions?: Permission[];
}

export interface UpdateMemberDto {
  role?: Role;
  permissions?: Permission[];
}

export interface CreateInviteLinkDto {
  clusterId: string;
  expiresIn?: number; // milliseconds from now
}

export interface InviteLinkResponse {
  token: string;
  clusterId: string;
  expiresAt: Date;
  url: string;
}

// ============================================
// Canvas State Types
// ============================================

export interface CanvasState {
  hub: HubWithClusters | null;
  clusters: Map<string, ClusterWithTasks>;
  tasks: Map<string, TaskWithChildren>;
  expandedClusters: Set<string>;
  selectedElement: string | null;
}

// ============================================
// Gesture Types
// ============================================

export type GestureType = 'tap' | 'long-press' | 'drag';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: 'hub' | 'cluster' | 'task';
  bounds: Bounds;
}

// ============================================
// WebSocket Event Types
// ============================================

export interface ClusterCreatedEvent {
  cluster: MindMapCluster;
}

export interface ClusterUpdatedEvent {
  cluster: MindMapCluster;
}

export interface ClusterDeletedEvent {
  clusterId: string;
}

export interface ClusterMovedEvent {
  clusterId: string;
  position: Position;
}

export interface ClusterToggledEvent {
  clusterId: string;
  isExpanded: boolean;
}

export interface TaskCreatedEvent {
  task: MindMapTask;
}

export interface TaskUpdatedEvent {
  task: MindMapTask;
}

export interface TaskDeletedEvent {
  taskId: string;
}

export interface TaskCompletedEvent {
  taskId: string;
  completed: boolean;
}

export interface MemberAddedEvent {
  clusterId: string;
  member: ClusterMember;
}

export interface MemberRemovedEvent {
  clusterId: string;
  userId: string;
}

export interface MemberUpdatedEvent {
  clusterId: string;
  member: ClusterMember;
}

export interface SyncRequestEvent {
  userId: string;
}

export interface SyncResponseEvent {
  state: CanvasState;
}

// ============================================
// Error Types
// ============================================

export enum ErrorCode {
  // Authentication and Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_POSITION = 'INVALID_POSITION',
  INVALID_HIERARCHY = 'INVALID_HIERARCHY',
  
  // Resources
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CLUSTER_NOT_FOUND = 'CLUSTER_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  HUB_NOT_FOUND = 'HUB_NOT_FOUND',
  
  // Business Logic
  CLUSTER_LIMIT_REACHED = 'CLUSTER_LIMIT_REACHED',
  MEMBER_ALREADY_EXISTS = 'MEMBER_ALREADY_EXISTS',
  CANNOT_REMOVE_OWNER = 'CANNOT_REMOVE_OWNER',
  INVITE_EXPIRED = 'INVITE_EXPIRED',
  INVITE_ALREADY_USED = 'INVITE_ALREADY_USED',
  
  // System
  DATABASE_ERROR = 'DATABASE_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

// ============================================
// Utility Types
// ============================================

export interface ClusterTaskCount {
  clusterId: string;
  count: number;
}

export interface PermissionCheck {
  userId: string;
  clusterId: string;
  permission: Permission;
  hasPermission: boolean;
}

// ============================================
// Animation Configuration
// ============================================

export const ANIMATION_CONFIG = {
  MAX_DURATION: 300, // milliseconds
  EXPAND_DURATION: 250,
  COLLAPSE_DURATION: 200,
  CREATE_DURATION: 150,
  MOVE_DURATION: 200,
} as const;

// ============================================
// Visual Style Configuration
// ============================================

export const VISUAL_STYLE = {
  colors: {
    primary: '#1F2937',
    secondary: '#6B7280',
    accent: '#3B82F6',
    success: '#22C55E',
    connection: '#D1D5DB',
  },
  grid: {
    color: '#F3F4F6',
    size: 20,
  },
  shadow: {
    blur: 10,
    color: 'rgba(0, 0, 0, 0.1)',
    offsetX: 0,
    offsetY: 2,
  },
} as const;
