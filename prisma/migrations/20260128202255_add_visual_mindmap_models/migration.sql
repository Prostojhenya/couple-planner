-- CreateTable
CREATE TABLE "hubs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextType" TEXT NOT NULL,
    "participants" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mindmap_clusters" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "isExpanded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmap_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mindmap_tasks" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "parentTaskId" TEXT,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT NOT NULL DEFAULT 'check',
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmap_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_members" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cluster_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_links" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hubs_userId_idx" ON "hubs"("userId");

-- CreateIndex
CREATE INDEX "mindmap_clusters_hubId_idx" ON "mindmap_clusters"("hubId");

-- CreateIndex
CREATE INDEX "mindmap_clusters_ownerId_idx" ON "mindmap_clusters"("ownerId");

-- CreateIndex
CREATE INDEX "mindmap_tasks_clusterId_idx" ON "mindmap_tasks"("clusterId");

-- CreateIndex
CREATE INDEX "mindmap_tasks_parentTaskId_idx" ON "mindmap_tasks"("parentTaskId");

-- CreateIndex
CREATE INDEX "cluster_members_clusterId_idx" ON "cluster_members"("clusterId");

-- CreateIndex
CREATE INDEX "cluster_members_userId_idx" ON "cluster_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_members_clusterId_userId_key" ON "cluster_members"("clusterId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_token_key" ON "invite_links"("token");

-- CreateIndex
CREATE INDEX "invite_links_clusterId_idx" ON "invite_links"("clusterId");

-- CreateIndex
CREATE INDEX "invite_links_token_idx" ON "invite_links"("token");

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubs" ADD CONSTRAINT "hubs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmap_clusters" ADD CONSTRAINT "mindmap_clusters_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmap_clusters" ADD CONSTRAINT "mindmap_clusters_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmap_tasks" ADD CONSTRAINT "mindmap_tasks_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "mindmap_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmap_tasks" ADD CONSTRAINT "mindmap_tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "mindmap_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_members" ADD CONSTRAINT "cluster_members_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "mindmap_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_members" ADD CONSTRAINT "cluster_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "mindmap_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
