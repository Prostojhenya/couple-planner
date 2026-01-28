/**
 * Prisma client utilities for Visual Mind-Map Task System
 */

import { PrismaClient } from '@prisma/client';

// Use existing Prisma client instance or create new one
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================
// Helper Functions for Mind-Map Models
// ============================================

/**
 * Get a hub with all its clusters
 */
export async function getHubWithClusters(hubId: string) {
  return prisma.hub.findUnique({
    where: { id: hubId },
    include: {
      clusters: {
        include: {
          tasks: true,
          members: true,
        },
      },
    },
  });
}

/**
 * Get a cluster with all its tasks and members
 */
export async function getClusterWithRelations(clusterId: string) {
  return prisma.mindMapCluster.findUnique({
    where: { id: clusterId },
    include: {
      tasks: {
        include: {
          children: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      inviteLinks: true,
      hub: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get a task with its children and parent
 */
export async function getTaskWithRelations(taskId: string) {
  return prisma.mindMapTask.findUnique({
    where: { id: taskId },
    include: {
      children: true,
      parent: true,
      cluster: true,
    },
  });
}

/**
 * Get all tasks in a cluster (including nested tasks)
 */
export async function getAllClusterTasks(clusterId: string) {
  return prisma.mindMapTask.findMany({
    where: { clusterId },
    include: {
      children: true,
    },
    orderBy: {
      order: 'asc',
    },
  });
}

/**
 * Count total tasks in a cluster (including nested)
 */
export async function countClusterTasks(clusterId: string): Promise<number> {
  return prisma.mindMapTask.count({
    where: { clusterId },
  });
}

/**
 * Check if a user has a specific permission in a cluster
 */
export async function hasPermission(
  userId: string,
  clusterId: string,
  permission: string
): Promise<boolean> {
  const member = await prisma.clusterMember.findUnique({
    where: {
      clusterId_userId: {
        clusterId,
        userId,
      },
    },
  });

  if (!member) return false;

  // Admin has all permissions
  if (member.role === 'admin') return true;

  // Viewer has no permissions (only read)
  if (member.role === 'viewer') return false;

  // Check if user has the specific permission
  return member.permissions.includes(permission);
}

/**
 * Get all hubs for a user
 */
export async function getUserHubs(userId: string) {
  return prisma.hub.findMany({
    where: { userId },
    include: {
      clusters: {
        include: {
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get all clusters where user is a member
 */
export async function getUserClusters(userId: string) {
  const memberships = await prisma.clusterMember.findMany({
    where: { userId },
    include: {
      cluster: {
        include: {
          tasks: true,
          hub: true,
        },
      },
    },
  });

  return memberships.map(m => m.cluster);
}

/**
 * Validate invite link
 */
export async function validateInviteLink(token: string) {
  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: {
      cluster: true,
    },
  });

  if (!invite) {
    return { valid: false, error: 'Invite not found' };
  }

  if (invite.usedBy) {
    return { valid: false, error: 'Invite already used' };
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, error: 'Invite expired' };
  }

  return { valid: true, invite };
}

export default prisma;
