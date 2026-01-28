/**
 * Tests for Prisma Mind-Map utilities
 * Validates: Requirements 14.2, 14.3
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import {
  getHubWithClusters,
  getClusterWithRelations,
  getTaskWithRelations,
  countClusterTasks,
  hasPermission,
} from '../prisma-mindmap';

const prisma = new PrismaClient();

describe('Prisma Mind-Map Models', () => {
  let testUserId: string;
  let testHubId: string;
  let testClusterId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-mindmap-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
        name: 'Test User',
      },
    });
    testUserId = user.id;

    // Create a test hub
    const hub = await prisma.hub.create({
      data: {
        userId: testUserId,
        contextType: 'personal',
        participants: ['TU'],
      },
    });
    testHubId = hub.id;

    // Create a test cluster
    const cluster = await prisma.mindMapCluster.create({
      data: {
        hubId: testHubId,
        ownerId: testUserId,
        type: 'task',
        positionX: 100,
        positionY: 100,
      },
    });
    testClusterId = cluster.id;

    // Create cluster member (owner as admin)
    await prisma.clusterMember.create({
      data: {
        clusterId: testClusterId,
        userId: testUserId,
        role: 'admin',
        permissions: [],
      },
    });

    // Create a test task
    const task = await prisma.mindMapTask.create({
      data: {
        clusterId: testClusterId,
        title: 'Test Task',
        icon: 'check',
      },
    });
    testTaskId = task.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prisma.mindMapTask.deleteMany({ where: { clusterId: testClusterId } });
      await prisma.clusterMember.deleteMany({ where: { clusterId: testClusterId } });
      await prisma.mindMapCluster.deleteMany({ where: { hubId: testHubId } });
      await prisma.hub.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
    }
    await prisma.$disconnect();
  });

  describe('Hub Model', () => {
    it('should create and retrieve a hub', async () => {
      const hub = await prisma.hub.findUnique({
        where: { id: testHubId },
      });

      expect(hub).toBeDefined();
      expect(hub?.userId).toBe(testUserId);
      expect(hub?.contextType).toBe('personal');
      expect(hub?.participants).toEqual(['TU']);
    });

    it('should get hub with clusters', async () => {
      const hub = await getHubWithClusters(testHubId);

      expect(hub).toBeDefined();
      expect(hub?.clusters).toBeDefined();
      expect(hub?.clusters.length).toBeGreaterThan(0);
    });
  });

  describe('Cluster Model', () => {
    it('should create and retrieve a cluster', async () => {
      const cluster = await prisma.mindMapCluster.findUnique({
        where: { id: testClusterId },
      });

      expect(cluster).toBeDefined();
      expect(cluster?.hubId).toBe(testHubId);
      expect(cluster?.ownerId).toBe(testUserId);
      expect(cluster?.type).toBe('task');
      expect(cluster?.positionX).toBe(100);
      expect(cluster?.positionY).toBe(100);
      expect(cluster?.isExpanded).toBe(false);
    });

    it('should get cluster with relations', async () => {
      const cluster = await getClusterWithRelations(testClusterId);

      expect(cluster).toBeDefined();
      expect(cluster?.tasks).toBeDefined();
      expect(cluster?.members).toBeDefined();
      expect(cluster?.hub).toBeDefined();
    });
  });

  describe('Task Model', () => {
    it('should create and retrieve a task', async () => {
      const task = await prisma.mindMapTask.findUnique({
        where: { id: testTaskId },
      });

      expect(task).toBeDefined();
      expect(task?.clusterId).toBe(testClusterId);
      expect(task?.title).toBe('Test Task');
      expect(task?.completed).toBe(false);
      expect(task?.icon).toBe('check');
    });

    it('should get task with relations', async () => {
      const task = await getTaskWithRelations(testTaskId);

      expect(task).toBeDefined();
      expect(task?.cluster).toBeDefined();
      expect(task?.children).toBeDefined();
    });

    it('should support nested tasks', async () => {
      // Create a child task
      const childTask = await prisma.mindMapTask.create({
        data: {
          clusterId: testClusterId,
          parentTaskId: testTaskId,
          title: 'Child Task',
          icon: 'check',
        },
      });

      const parentTask = await getTaskWithRelations(testTaskId);
      expect(parentTask?.children.length).toBe(1);
      expect(parentTask?.children[0].id).toBe(childTask.id);

      // Clean up
      await prisma.mindMapTask.delete({ where: { id: childTask.id } });
    });

    it('should count cluster tasks', async () => {
      const count = await countClusterTasks(testClusterId);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('ClusterMember Model', () => {
    it('should create and retrieve cluster members', async () => {
      const member = await prisma.clusterMember.findUnique({
        where: {
          clusterId_userId: {
            clusterId: testClusterId,
            userId: testUserId,
          },
        },
      });

      expect(member).toBeDefined();
      expect(member?.role).toBe('admin');
    });

    it('should check admin permissions', async () => {
      const canAddTasks = await hasPermission(testUserId, testClusterId, 'add_tasks');
      expect(canAddTasks).toBe(true); // Admin has all permissions
    });

    it('should check user permissions', async () => {
      // Create another user with limited permissions
      const user2 = await prisma.user.create({
        data: {
          email: `test-mindmap-user2-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          name: 'Test User 2',
        },
      });

      await prisma.clusterMember.create({
        data: {
          clusterId: testClusterId,
          userId: user2.id,
          role: 'user',
          permissions: ['add_tasks', 'complete_tasks'],
        },
      });

      const canAddTasks = await hasPermission(user2.id, testClusterId, 'add_tasks');
      expect(canAddTasks).toBe(true);

      const canDeleteTasks = await hasPermission(user2.id, testClusterId, 'delete_tasks');
      expect(canDeleteTasks).toBe(false);

      // Clean up
      await prisma.clusterMember.delete({
        where: {
          clusterId_userId: {
            clusterId: testClusterId,
            userId: user2.id,
          },
        },
      });
      await prisma.user.delete({ where: { id: user2.id } });
    });

    it('should check viewer permissions', async () => {
      // Create a viewer
      const viewer = await prisma.user.create({
        data: {
          email: `test-mindmap-viewer-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          name: 'Test Viewer',
        },
      });

      await prisma.clusterMember.create({
        data: {
          clusterId: testClusterId,
          userId: viewer.id,
          role: 'viewer',
          permissions: [],
        },
      });

      const canAddTasks = await hasPermission(viewer.id, testClusterId, 'add_tasks');
      expect(canAddTasks).toBe(false); // Viewer has no permissions

      // Clean up
      await prisma.clusterMember.delete({
        where: {
          clusterId_userId: {
            clusterId: testClusterId,
            userId: viewer.id,
          },
        },
      });
      await prisma.user.delete({ where: { id: viewer.id } });
    });
  });

  describe('InviteLink Model', () => {
    it('should create and retrieve invite links', async () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      const invite = await prisma.inviteLink.create({
        data: {
          clusterId: testClusterId,
          token: `test-token-${Date.now()}`,
          expiresAt,
          createdById: testUserId,
        },
      });

      expect(invite).toBeDefined();
      expect(invite.clusterId).toBe(testClusterId);
      expect(invite.createdById).toBe(testUserId);
      expect(invite.usedBy).toBeNull();

      // Clean up
      await prisma.inviteLink.delete({ where: { id: invite.id } });
    });

    it('should enforce unique token constraint', async () => {
      const token = `unique-token-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.inviteLink.create({
        data: {
          clusterId: testClusterId,
          token,
          expiresAt,
          createdById: testUserId,
        },
      });

      // Try to create another invite with the same token
      await expect(
        prisma.inviteLink.create({
          data: {
            clusterId: testClusterId,
            token, // Same token
            expiresAt,
            createdById: testUserId,
          },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.inviteLink.deleteMany({ where: { token } });
    });
  });

  describe('Data Persistence', () => {
    it('should persist hub data across queries', async () => {
      const hub1 = await prisma.hub.findUnique({ where: { id: testHubId } });
      const hub2 = await prisma.hub.findUnique({ where: { id: testHubId } });

      expect(hub1).toEqual(hub2);
    });

    it('should persist cluster positions', async () => {
      const newX = 200;
      const newY = 300;

      await prisma.mindMapCluster.update({
        where: { id: testClusterId },
        data: { positionX: newX, positionY: newY },
      });

      const cluster = await prisma.mindMapCluster.findUnique({
        where: { id: testClusterId },
      });

      expect(cluster?.positionX).toBe(newX);
      expect(cluster?.positionY).toBe(newY);
    });
  });

  describe('Cascade Deletes', () => {
    it('should cascade delete tasks when cluster is deleted', async () => {
      // Create a temporary cluster with tasks
      const tempCluster = await prisma.mindMapCluster.create({
        data: {
          hubId: testHubId,
          ownerId: testUserId,
          type: 'task',
          positionX: 50,
          positionY: 50,
        },
      });

      const tempTask = await prisma.mindMapTask.create({
        data: {
          clusterId: tempCluster.id,
          title: 'Temp Task',
          icon: 'check',
        },
      });

      // Delete the cluster
      await prisma.mindMapCluster.delete({ where: { id: tempCluster.id } });

      // Task should be deleted too
      const task = await prisma.mindMapTask.findUnique({
        where: { id: tempTask.id },
      });

      expect(task).toBeNull();
    });

    it('should cascade delete clusters when hub is deleted', async () => {
      // Create a temporary hub with cluster
      const tempHub = await prisma.hub.create({
        data: {
          userId: testUserId,
          contextType: 'personal',
          participants: ['TU'],
        },
      });

      const tempCluster = await prisma.mindMapCluster.create({
        data: {
          hubId: tempHub.id,
          ownerId: testUserId,
          type: 'task',
          positionX: 50,
          positionY: 50,
        },
      });

      // Delete the hub
      await prisma.hub.delete({ where: { id: tempHub.id } });

      // Cluster should be deleted too
      const cluster = await prisma.mindMapCluster.findUnique({
        where: { id: tempCluster.id },
      });

      expect(cluster).toBeNull();
    });
  });
});
