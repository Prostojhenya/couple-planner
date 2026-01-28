/**
 * CanvasRenderer - Handles all canvas rendering operations for the mind-map visualization
 * 
 * Requirements:
 * - 1.1: Display three bubble sizes (Task: 32px, Cluster: 96px, HUB: 128px)
 * - 1.3: Task displays only icon without text and counter
 * - 1.4: Cluster displays icon, task counter, and member label
 * - 1.5: HUB displays context initials and cluster counter
 * - 9.2: Display connections between HUB and Cluster as dashed curved lines (#D1D5DB)
 */

import { 
  Position, 
  BUBBLE_SIZES, 
  VISUAL_STYLE,
  HubWithClusters,
  ClusterWithTasks,
  TaskWithChildren,
  ClusterType,
} from '@/types/mindmap';

export interface CanvasState {
  hub: HubWithClusters | null;
  clusters: Map<string, ClusterWithTasks>;
  tasks: Map<string, TaskWithChildren>;
  expandedClusters: Set<string>;
  selectedElement: string | null;
}

/**
 * CanvasRenderer class
 * Handles all canvas rendering operations for the visual mind-map system
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dpr: number = 1;

  /**
   * Initialize the canvas element
   * Requirements: Basic infrastructure for rendering
   */
  initialize(canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Handle high DPI displays
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
  }

  /**
   * Resize canvas to match container dimensions
   * Handles high DPI displays properly
   */
  resize(): void {
    if (!this.canvas || !this.ctx) return;

    const rect = this.canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled for DPI)
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    
    // Set display size (CSS pixels)
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    // Scale context to match DPI
    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    if (!this.canvas || !this.ctx) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  /**
   * Render all elements on the canvas
   * Requirements: Complete rendering pipeline
   */
  render(state: CanvasState): void {
    if (!this.canvas || !this.ctx) return;

    // Clear canvas
    this.clear();

    // Draw grid background
    this.drawGrid();

    // Draw connections from HUB to clusters
    if (state.hub) {
      const hubPosition = this.getHubPosition();
      state.clusters.forEach(cluster => {
        this.renderConnection(hubPosition, {
          x: cluster.positionX,
          y: cluster.positionY,
        });
      });
    }

    // Render HUB
    if (state.hub) {
      this.renderHub(state.hub);
    }

    // Render clusters
    state.clusters.forEach(cluster => {
      const isExpanded = state.expandedClusters.has(cluster.id);
      this.renderCluster(cluster, isExpanded);
      
      // Render tasks if cluster is expanded
      if (isExpanded) {
        const clusterTasks = cluster.tasks || [];
        this.renderExpandedTasks(cluster, clusterTasks);
      }
    });
  }

  /**
   * Draw grid background
   * Requirements: 9.1 - Light gray grid background
   */
  private drawGrid(): void {
    if (!this.canvas || !this.ctx) return;

    const rect = this.canvas.getBoundingClientRect();
    const { size, color } = VISUAL_STYLE.grid;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < rect.width; x += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, rect.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < rect.height; y += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(rect.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Get HUB position (always center of canvas)
   * Requirements: 18.1 - HUB always in center
   */
  private getHubPosition(): Position {
    if (!this.canvas) return { x: 0, y: 0 };
    
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: rect.width / 2,
      y: rect.height / 2,
    };
  }

  /**
   * Render HUB element
   * Requirements: 1.1, 1.5 - Size 128px, display initials and cluster counter
   */
  renderHub(hub: HubWithClusters): void {
    if (!this.ctx) return;

    const position = this.getHubPosition();
    const size = BUBBLE_SIZES.HUB;
    const radius = size / 2;

    // Draw shadow
    this.drawShadow(position, radius);

    // Draw circle
    this.ctx.fillStyle = VISUAL_STYLE.colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw initials
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const initials = hub.participants.join(' | ') || 'HUB';
    this.ctx.fillText(initials, position.x, position.y - 10);

    // Draw cluster counter
    this.ctx.font = '12px sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const clusterCount = hub.clusters?.length || 0;
    this.ctx.fillText(`${clusterCount} CLUSTERS`, position.x, position.y + 15);
  }

  /**
   * Render Cluster element
   * Requirements: 1.1, 1.4 - Size 96px, display icon, counter, and member label
   */
  renderCluster(cluster: ClusterWithTasks, isExpanded: boolean): void {
    if (!this.ctx) return;

    const position = { x: cluster.positionX, y: cluster.positionY };
    const size = BUBBLE_SIZES.CLUSTER;
    const radius = size / 2;

    // Draw shadow
    this.drawShadow(position, radius);

    // Draw circle
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw border if expanded
    if (isExpanded) {
      this.ctx.strokeStyle = VISUAL_STYLE.colors.accent;
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    }

    // Draw icon
    this.drawClusterIcon(position, cluster.type as ClusterType);

    // Draw task counter (only if not expanded)
    if (!isExpanded) {
      this.ctx.fillStyle = VISUAL_STYLE.colors.primary;
      this.ctx.font = 'bold 20px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      const taskCount = cluster.tasks?.length || 0;
      this.ctx.fillText(taskCount.toString(), position.x, position.y + 5);

      // Draw label
      this.ctx.font = '10px sans-serif';
      this.ctx.fillStyle = VISUAL_STYLE.colors.secondary;
      const label = this.getClusterLabel(cluster.type as ClusterType);
      this.ctx.fillText(label, position.x, position.y + 20);
    }

    // Draw member indicator
    this.drawMemberIndicator(position, cluster.members?.length || 0);
  }

  /**
   * Render Task element
   * Requirements: 1.1, 1.3 - Size 32px, display only icon (no text, no counter)
   */
  renderTask(task: TaskWithChildren, position: Position): void {
    if (!this.ctx) return;

    const size = BUBBLE_SIZES.TASK;
    const radius = size / 2;

    // Draw shadow
    this.drawShadow(position, radius);

    // Draw circle
    this.ctx.fillStyle = task.completed ? VISUAL_STYLE.colors.success : '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = task.completed ? VISUAL_STYLE.colors.success : VISUAL_STYLE.colors.secondary;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw icon (simplified - just a checkmark or dot)
    if (task.completed) {
      this.drawCheckmark(position, radius * 0.6);
    } else {
      this.ctx.fillStyle = VISUAL_STYLE.colors.secondary;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, radius * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Render connection between two positions
   * Requirements: 9.2 - Dashed curved lines (#D1D5DB)
   */
  renderConnection(from: Position, to: Position): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = VISUAL_STYLE.colors.connection;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    // Calculate control point for curved line
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const controlOffset = 50;

    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(
      midX + controlOffset,
      midY - controlOffset,
      to.x,
      to.y
    );
    this.ctx.stroke();
    
    // Reset line dash
    this.ctx.setLineDash([]);
  }

  /**
   * Render tasks in a ring around expanded cluster
   * Requirements: 4.2 - Display tasks as separate bubbles in ring
   */
  private renderExpandedTasks(cluster: ClusterWithTasks, tasks: TaskWithChildren[]): void {
    if (tasks.length === 0) return;

    const clusterPos = { x: cluster.positionX, y: cluster.positionY };
    const ringRadius = BUBBLE_SIZES.CLUSTER + 40; // Distance from cluster center
    const angleStep = (Math.PI * 2) / tasks.length;

    tasks.forEach((task, index) => {
      const angle = angleStep * index - Math.PI / 2; // Start from top
      const taskPos: Position = {
        x: clusterPos.x + Math.cos(angle) * ringRadius,
        y: clusterPos.y + Math.sin(angle) * ringRadius,
      };

      this.renderTask(task, taskPos);
    });
  }

  /**
   * Draw shadow for bubble
   * Requirements: 9.3 - Soft shadows on all bubbles
   */
  private drawShadow(position: Position, radius: number): void {
    if (!this.ctx) return;

    const { blur, color, offsetX, offsetY } = VISUAL_STYLE.shadow;
    
    this.ctx.shadowBlur = blur;
    this.ctx.shadowColor = color;
    this.ctx.shadowOffsetX = offsetX;
    this.ctx.shadowOffsetY = offsetY;

    // Draw shadow circle
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Reset shadow
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * Draw cluster icon based on type
   */
  private drawClusterIcon(position: Position, type: ClusterType): void {
    if (!this.ctx) return;

    const iconSize = 24;
    const iconY = position.y - 15;

    this.ctx.font = `${iconSize}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    switch (type) {
      case 'task':
        this.ctx.fillStyle = VISUAL_STYLE.colors.accent;
        this.ctx.fillText('✓', position.x, iconY);
        break;
      case 'event':
        this.ctx.fillStyle = '#8B5CF6'; // Purple
        this.ctx.fillText('📅', position.x, iconY);
        break;
      case 'shop':
        this.ctx.fillStyle = VISUAL_STYLE.colors.success;
        this.ctx.fillText('🛒', position.x, iconY);
        break;
      case 'custom':
        this.ctx.fillStyle = VISUAL_STYLE.colors.secondary;
        this.ctx.fillText('⭐', position.x, iconY);
        break;
    }
  }

  /**
   * Get cluster label text
   */
  private getClusterLabel(type: ClusterType): string {
    switch (type) {
      case 'task':
        return 'TASKS';
      case 'event':
        return 'EVENTS';
      case 'shop':
        return 'SHOP';
      case 'custom':
        return 'CUSTOM';
      default:
        return 'CLUSTER';
    }
  }

  /**
   * Draw member indicator (👥 icon with count)
   */
  private drawMemberIndicator(position: Position, memberCount: number): void {
    if (!this.ctx || memberCount === 0) return;

    const indicatorY = position.y + BUBBLE_SIZES.CLUSTER / 2 + 15;

    // Draw background circle
    this.ctx.fillStyle = VISUAL_STYLE.colors.accent;
    this.ctx.beginPath();
    this.ctx.arc(position.x, indicatorY, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw member icon
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('👥', position.x, indicatorY);
  }

  /**
   * Draw checkmark icon
   */
  private drawCheckmark(position: Position, size: number): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const startX = position.x - size * 0.5;
    const startY = position.y;
    const midX = position.x - size * 0.1;
    const midY = position.y + size * 0.4;
    const endX = position.x + size * 0.5;
    const endY = position.y - size * 0.4;

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(midX, midY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  /**
   * Animate cluster expansion
   * Requirements: 12.1 - Animate tasks appearing in ring
   */
  async animateExpand(cluster: ClusterWithTasks, tasks: TaskWithChildren[]): Promise<void> {
    // Animation will be handled by the component using this renderer
    // This method is a placeholder for future animation implementation
    return Promise.resolve();
  }

  /**
   * Animate cluster collapse
   * Requirements: 12.2 - Animate tasks disappearing and counter appearing
   */
  async animateCollapse(cluster: ClusterWithTasks): Promise<void> {
    // Animation will be handled by the component using this renderer
    // This method is a placeholder for future animation implementation
    return Promise.resolve();
  }
}
