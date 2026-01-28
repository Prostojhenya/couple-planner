/**
 * Unit tests for CanvasRenderer
 * 
 * Tests cover:
 * - Initialization and setup
 * - Rendering methods for HUB, Cluster, Task
 * - Connection rendering
 * - Resize and clear operations
 */

import { CanvasRenderer, CanvasState } from '../CanvasRenderer';
import { BUBBLE_SIZES, VISUAL_STYLE } from '@/types/mindmap';

// Mock canvas and context
class MockCanvasRenderingContext2D {
  fillStyle: string = '';
  strokeStyle: string = '';
  lineWidth: number = 1;
  font: string = '';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  shadowBlur: number = 0;
  shadowColor: string = '';
  shadowOffsetX: number = 0;
  shadowOffsetY: number = 0;
  lineCap: CanvasLineCap = 'butt';
  lineJoin: CanvasLineJoin = 'miter';

  private path: Array<{ type: string; args: any[] }> = [];

  beginPath() {
    this.path = [];
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    this.path.push({ type: 'arc', args: [x, y, radius, startAngle, endAngle] });
  }

  moveTo(x: number, y: number) {
    this.path.push({ type: 'moveTo', args: [x, y] });
  }

  lineTo(x: number, y: number) {
    this.path.push({ type: 'lineTo', args: [x, y] });
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.path.push({ type: 'quadraticCurveTo', args: [cpx, cpy, x, y] });
  }

  fill() {
    // Mock fill
  }

  stroke() {
    // Mock stroke
  }

  fillText(text: string, x: number, y: number) {
    this.path.push({ type: 'fillText', args: [text, x, y] });
  }

  clearRect(x: number, y: number, width: number, height: number) {
    this.path.push({ type: 'clearRect', args: [x, y, width, height] });
  }

  scale(x: number, y: number) {
    // Mock scale
  }

  setLineDash(segments: number[]) {
    // Mock setLineDash
  }

  getPath() {
    return this.path;
  }
}

class MockHTMLCanvasElement {
  width: number = 800;
  height: number = 600;
  style: { width: string; height: string } = { width: '800px', height: '600px' };
  private ctx: MockCanvasRenderingContext2D;

  constructor() {
    this.ctx = new MockCanvasRenderingContext2D();
  }

  getContext(contextId: string): MockCanvasRenderingContext2D | null {
    if (contextId === '2d') {
      return this.ctx;
    }
    return null;
  }

  getBoundingClientRect() {
    return {
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  }
}

describe('CanvasRenderer', () => {
  let renderer: CanvasRenderer;
  let canvas: MockHTMLCanvasElement;
  let ctx: MockCanvasRenderingContext2D;

  beforeEach(() => {
    renderer = new CanvasRenderer();
    canvas = new MockHTMLCanvasElement();
    ctx = canvas.getContext('2d') as MockCanvasRenderingContext2D;
    
    // Mock window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });
  });

  describe('Initialization', () => {
    it('should initialize canvas element', () => {
      expect(() => {
        renderer.initialize(canvas as any);
      }).not.toThrow();
    });

    it('should throw error if canvas context is not available', () => {
      const badCanvas = {
        getContext: () => null,
        getBoundingClientRect: () => ({ width: 800, height: 600 }),
      };

      expect(() => {
        renderer.initialize(badCanvas as any);
      }).toThrow('Failed to get 2D context from canvas');
    });

    it('should handle high DPI displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2,
      });

      renderer.initialize(canvas as any);
      
      // Canvas should be scaled for high DPI
      expect(canvas.width).toBe(1600); // 800 * 2
      expect(canvas.height).toBe(1200); // 600 * 2
    });
  });

  describe('Resize', () => {
    it('should resize canvas to match container dimensions', () => {
      renderer.initialize(canvas as any);
      
      // Change canvas dimensions
      canvas.getBoundingClientRect = () => ({
        width: 1000,
        height: 800,
        top: 0,
        left: 0,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      renderer.resize();

      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(800);
    });
  });

  describe('Clear', () => {
    it('should clear the entire canvas', () => {
      renderer.initialize(canvas as any);
      renderer.clear();

      const path = ctx.getPath();
      const clearRectCall = path.find(p => p.type === 'clearRect');
      
      expect(clearRectCall).toBeDefined();
      expect(clearRectCall?.args).toEqual([0, 0, 800, 600]);
    });
  });

  describe('renderHub', () => {
    it('should render HUB with correct size', () => {
      renderer.initialize(canvas as any);

      const hub = {
        id: 'hub-1',
        userId: 'user-1',
        contextType: 'personal' as const,
        participants: ['Я', 'Ю'],
        clusters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderHub(hub);

      const path = ctx.getPath();
      const arcCall = path.find(p => p.type === 'arc');
      
      expect(arcCall).toBeDefined();
      // Radius should be BUBBLE_SIZES.HUB / 2 = 64
      expect(arcCall?.args[2]).toBe(BUBBLE_SIZES.HUB / 2);
    });

    it('should render HUB at center of canvas', () => {
      renderer.initialize(canvas as any);

      const hub = {
        id: 'hub-1',
        userId: 'user-1',
        contextType: 'personal' as const,
        participants: ['Я', 'Ю'],
        clusters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderHub(hub);

      const path = ctx.getPath();
      const arcCall = path.find(p => p.type === 'arc');
      
      expect(arcCall).toBeDefined();
      // Should be at center (400, 300)
      expect(arcCall?.args[0]).toBe(400);
      expect(arcCall?.args[1]).toBe(300);
    });

    it('should display initials and cluster counter', () => {
      renderer.initialize(canvas as any);

      const hub = {
        id: 'hub-1',
        userId: 'user-1',
        contextType: 'personal' as const,
        participants: ['Я', 'Ю'],
        clusters: [
          { id: 'c1' } as any,
          { id: 'c2' } as any,
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderHub(hub);

      const path = ctx.getPath();
      const textCalls = path.filter(p => p.type === 'fillText');
      
      // Should have initials and counter
      expect(textCalls.length).toBeGreaterThanOrEqual(2);
      expect(textCalls.some(t => t.args[0] === 'Я | Ю')).toBe(true);
      expect(textCalls.some(t => t.args[0] === '2 CLUSTERS')).toBe(true);
    });
  });

  describe('renderCluster', () => {
    it('should render Cluster with correct size', () => {
      renderer.initialize(canvas as any);

      const cluster = {
        id: 'cluster-1',
        hubId: 'hub-1',
        ownerId: 'user-1',
        type: 'task',
        positionX: 500,
        positionY: 300,
        isExpanded: false,
        tasks: [],
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderCluster(cluster, false);

      const path = ctx.getPath();
      const arcCall = path.find(p => p.type === 'arc');
      
      expect(arcCall).toBeDefined();
      // Radius should be BUBBLE_SIZES.CLUSTER / 2 = 48
      expect(arcCall?.args[2]).toBe(BUBBLE_SIZES.CLUSTER / 2);
    });

    it('should render Cluster at specified position', () => {
      renderer.initialize(canvas as any);

      const cluster = {
        id: 'cluster-1',
        hubId: 'hub-1',
        ownerId: 'user-1',
        type: 'task',
        positionX: 500,
        positionY: 300,
        isExpanded: false,
        tasks: [],
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderCluster(cluster, false);

      const path = ctx.getPath();
      const arcCall = path.find(p => p.type === 'arc');
      
      expect(arcCall).toBeDefined();
      expect(arcCall?.args[0]).toBe(500);
      expect(arcCall?.args[1]).toBe(300);
    });

    it('should display task counter when not expanded', () => {
      renderer.initialize(canvas as any);

      const cluster = {
        id: 'cluster-1',
        hubId: 'hub-1',
        ownerId: 'user-1',
        type: 'task',
        positionX: 500,
        positionY: 300,
        isExpanded: false,
        tasks: [
          { id: 't1' } as any,
          { id: 't2' } as any,
          { id: 't3' } as any,
        ],
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderCluster(cluster, false);

      const path = ctx.getPath();
      const textCalls = path.filter(p => p.type === 'fillText');
      
      // Should display task count
      expect(textCalls.some(t => t.args[0] === '3')).toBe(true);
    });

    it('should not display counter when expanded', () => {
      renderer.initialize(canvas as any);

      const cluster = {
        id: 'cluster-1',
        hubId: 'hub-1',
        ownerId: 'user-1',
        type: 'task',
        positionX: 500,
        positionY: 300,
        isExpanded: true,
        tasks: [
          { id: 't1' } as any,
          { id: 't2' } as any,
        ],
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderer.renderCluster(cluster, true);

      const path = ctx.getPath();
      const textCalls = path.filter(p => p.type === 'fillText');
      
      // Should not display task count when expanded
      expect(textCalls.some(t => t.args[0] === '2')).toBe(false);
    });
  });

  describe('renderTask', () => {
    it('should render Task with correct size', () => {
      renderer.initialize(canvas as any);

      const task = {
        id: 'task-1',
        clusterId: 'cluster-1',
        parentTaskId: null,
        title: 'Test Task',
        completed: false,
        icon: 'check',
        positionX: null,
        positionY: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      const position = { x: 600, y: 400 };
      renderer.renderTask(task, position);

      const path = ctx.getPath();
      const arcCall = path.find(p => p.type === 'arc');
      
      expect(arcCall).toBeDefined();
      // Radius should be BUBBLE_SIZES.TASK / 2 = 16
      expect(arcCall?.args[2]).toBe(BUBBLE_SIZES.TASK / 2);
    });

    it('should render Task at specified position', () => {
      renderer.initialize(canvas as any);

      const task = {
        id: 'task-1',
        clusterId: 'cluster-1',
        parentTaskId: null,
        title: 'Test Task',
        completed: false,
        icon: 'check',
        positionX: null,
        positionY: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      const position = { x: 600, y: 400 };
      renderer.renderTask(task, position);

      const path = ctx.getPath();
      const arcCall = path.find(p => p.type === 'arc');
      
      expect(arcCall).toBeDefined();
      expect(arcCall?.args[0]).toBe(600);
      expect(arcCall?.args[1]).toBe(400);
    });

    it('should not display text or counter', () => {
      renderer.initialize(canvas as any);

      const task = {
        id: 'task-1',
        clusterId: 'cluster-1',
        parentTaskId: null,
        title: 'Test Task',
        completed: false,
        icon: 'check',
        positionX: null,
        positionY: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      const position = { x: 600, y: 400 };
      renderer.renderTask(task, position);

      const path = ctx.getPath();
      const textCalls = path.filter(p => p.type === 'fillText');
      
      // Task should not display text (only icon)
      expect(textCalls.length).toBe(0);
    });

    it('should render completed task with success color', () => {
      renderer.initialize(canvas as any);

      const task = {
        id: 'task-1',
        clusterId: 'cluster-1',
        parentTaskId: null,
        title: 'Test Task',
        completed: true,
        icon: 'check',
        positionX: null,
        positionY: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      const position = { x: 600, y: 400 };
      renderer.renderTask(task, position);

      // Check that success color was used
      expect(ctx.fillStyle).toBe(VISUAL_STYLE.colors.success);
    });
  });

  describe('renderConnection', () => {
    it('should render curved connection between two points', () => {
      renderer.initialize(canvas as any);

      const from = { x: 400, y: 300 };
      const to = { x: 600, y: 400 };

      renderer.renderConnection(from, to);

      const path = ctx.getPath();
      const moveToCall = path.find(p => p.type === 'moveTo');
      const curveCall = path.find(p => p.type === 'quadraticCurveTo');
      
      expect(moveToCall).toBeDefined();
      expect(moveToCall?.args).toEqual([400, 300]);
      
      expect(curveCall).toBeDefined();
      expect(curveCall?.args[2]).toBe(600); // End x
      expect(curveCall?.args[3]).toBe(400); // End y
    });

    it('should use correct connection color', () => {
      renderer.initialize(canvas as any);

      const from = { x: 400, y: 300 };
      const to = { x: 600, y: 400 };

      renderer.renderConnection(from, to);

      expect(ctx.strokeStyle).toBe(VISUAL_STYLE.colors.connection);
    });
  });

  describe('render (full state)', () => {
    it('should render complete canvas state', () => {
      renderer.initialize(canvas as any);

      const state: CanvasState = {
        hub: {
          id: 'hub-1',
          userId: 'user-1',
          contextType: 'personal',
          participants: ['Я', 'Ю'],
          clusters: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        clusters: new Map([
          ['cluster-1', {
            id: 'cluster-1',
            hubId: 'hub-1',
            ownerId: 'user-1',
            type: 'task',
            positionX: 500,
            positionY: 300,
            isExpanded: false,
            tasks: [],
            members: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        ]),
        tasks: new Map(),
        expandedClusters: new Set(),
        selectedElement: null,
      };

      expect(() => {
        renderer.render(state);
      }).not.toThrow();
    });

    it('should clear canvas before rendering', () => {
      renderer.initialize(canvas as any);

      const state: CanvasState = {
        hub: null,
        clusters: new Map(),
        tasks: new Map(),
        expandedClusters: new Set(),
        selectedElement: null,
      };

      renderer.render(state);

      const path = ctx.getPath();
      const clearRectCall = path.find(p => p.type === 'clearRect');
      
      expect(clearRectCall).toBeDefined();
    });
  });
});
