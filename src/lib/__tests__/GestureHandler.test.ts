/**
 * Unit tests for GestureHandler
 * 
 * Tests cover:
 * - Tap gesture detection on different elements
 * - Long-press gesture with timing validation
 * - Drag gesture with start and end positions
 * - Element detection (getElementAt)
 * 
 * Requirements: 11.1, 11.2, 11.3
 */

import { GestureHandler, createCanvasElement, createElementBounds } from '../GestureHandler';
import { Position, CanvasElement } from '@/types/mindmap';

// Mock canvas element
class MockCanvas {
  private listeners: Map<string, EventListener[]> = new Map();
  
  addEventListener(event: string, listener: EventListener, options?: any): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: EventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  getBoundingClientRect(): DOMRect {
    return {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  }

  // Helper to trigger events
  trigger(event: string, eventData: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(eventData as Event));
    }
  }
}

// Helper to create mouse event
function createMouseEvent(type: string, x: number, y: number): MouseEvent {
  return {
    type,
    clientX: x,
    clientY: y,
    preventDefault: jest.fn(),
  } as any;
}

// Helper to create touch event
function createTouchEvent(type: string, x: number, y: number): TouchEvent {
  return {
    type,
    touches: [{ clientX: x, clientY: y }],
    preventDefault: jest.fn(),
  } as any;
}

describe('GestureHandler', () => {
  let gestureHandler: GestureHandler;
  let mockCanvas: MockCanvas;

  beforeEach(() => {
    jest.useFakeTimers();
    gestureHandler = new GestureHandler();
    mockCanvas = new MockCanvas();
    gestureHandler.initialize(mockCanvas as any);
  });

  afterEach(() => {
    gestureHandler.destroy();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with canvas element', () => {
      const handler = new GestureHandler();
      const canvas = new MockCanvas();
      
      expect(() => handler.initialize(canvas as any)).not.toThrow();
      handler.destroy();
    });

    it('should accept custom configuration', () => {
      const handler = new GestureHandler({
        longPressDuration: 2000,
        dragThreshold: 10,
        tapMaxDuration: 500,
      });
      
      expect(handler).toBeDefined();
      handler.destroy();
    });
  });

  describe('Element Detection (getElementAt)', () => {
    it('should return null when no elements are registered', () => {
      const position: Position = { x: 100, y: 100 };
      const element = gestureHandler.getElementAt(position);
      
      expect(element).toBeNull();
    });

    it('should detect HUB element at position', () => {
      const hubElement = createCanvasElement('hub-1', 'hub', { x: 400, y: 300 });
      gestureHandler.registerElements([hubElement]);

      // Point inside HUB (128px diameter, so radius 64)
      const element = gestureHandler.getElementAt({ x: 400, y: 300 });
      
      expect(element).not.toBeNull();
      expect(element?.id).toBe('hub-1');
      expect(element?.type).toBe('hub');
    });

    it('should detect Cluster element at position', () => {
      const clusterElement = createCanvasElement('cluster-1', 'cluster', { x: 600, y: 200 });
      gestureHandler.registerElements([clusterElement]);

      // Point inside Cluster (96px diameter, so radius 48)
      const element = gestureHandler.getElementAt({ x: 600, y: 200 });
      
      expect(element).not.toBeNull();
      expect(element?.id).toBe('cluster-1');
      expect(element?.type).toBe('cluster');
    });

    it('should detect Task element at position', () => {
      const taskElement = createCanvasElement('task-1', 'task', { x: 700, y: 150 });
      gestureHandler.registerElements([taskElement]);

      // Point inside Task (32px diameter, so radius 16)
      const element = gestureHandler.getElementAt({ x: 700, y: 150 });
      
      expect(element).not.toBeNull();
      expect(element?.id).toBe('task-1');
      expect(element?.type).toBe('task');
    });

    it('should return null when position is outside all elements', () => {
      const elements = [
        createCanvasElement('hub-1', 'hub', { x: 400, y: 300 }),
        createCanvasElement('cluster-1', 'cluster', { x: 600, y: 200 }),
      ];
      gestureHandler.registerElements(elements);

      // Point far from any element
      const element = gestureHandler.getElementAt({ x: 50, y: 50 });
      
      expect(element).toBeNull();
    });

    it('should return top element when elements overlap', () => {
      // Create overlapping elements (last one should be on top)
      const elements = [
        createCanvasElement('bottom', 'cluster', { x: 400, y: 300 }),
        createCanvasElement('top', 'cluster', { x: 410, y: 310 }),
      ];
      gestureHandler.registerElements(elements);

      // Point in overlap area
      const element = gestureHandler.getElementAt({ x: 405, y: 305 });
      
      expect(element).not.toBeNull();
      expect(element?.id).toBe('top');
    });
  });

  describe('Tap Gesture', () => {
    it('should trigger tap callback on quick click', () => {
      const tapCallback = jest.fn();
      gestureHandler.onTap(tapCallback);

      // Simulate mouse down and up quickly
      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(100); // 100ms
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));

      expect(tapCallback).toHaveBeenCalledTimes(1);
      expect(tapCallback).toHaveBeenCalledWith(
        { x: 100, y: 100 },
        null // no element registered
      );
    });

    it('should trigger tap with element when tapping on registered element', () => {
      const tapCallback = jest.fn();
      gestureHandler.onTap(tapCallback);

      const clusterElement = createCanvasElement('cluster-1', 'cluster', { x: 100, y: 100 });
      gestureHandler.registerElements([clusterElement]);

      // Tap on cluster
      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(100);
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));

      expect(tapCallback).toHaveBeenCalledTimes(1);
      expect(tapCallback).toHaveBeenCalledWith(
        { x: 100, y: 100 },
        expect.objectContaining({
          id: 'cluster-1',
          type: 'cluster',
        })
      );
    });

    it('should not trigger tap if duration exceeds maximum', () => {
      const tapCallback = jest.fn();
      gestureHandler.onTap(tapCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(500); // 500ms - exceeds default 300ms
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));

      expect(tapCallback).not.toHaveBeenCalled();
    });

    it('should not trigger tap if movement exceeds threshold', () => {
      const tapCallback = jest.fn();
      gestureHandler.onTap(tapCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 120, 120)); // 20px movement
      jest.advanceTimersByTime(100);
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 120, 120));

      expect(tapCallback).not.toHaveBeenCalled();
    });

    it('should work with touch events', () => {
      const tapCallback = jest.fn();
      gestureHandler.onTap(tapCallback);

      mockCanvas.trigger('touchstart', createTouchEvent('touchstart', 200, 200));
      jest.advanceTimersByTime(100);
      mockCanvas.trigger('touchend', createTouchEvent('touchend', 200, 200));

      expect(tapCallback).toHaveBeenCalledTimes(1);
      expect(tapCallback).toHaveBeenCalledWith(
        { x: 200, y: 200 },
        null
      );
    });
  });

  describe('Long-Press Gesture', () => {
    it('should trigger long-press after 1.5 seconds', () => {
      const longPressCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 300, 300));
      
      // Not triggered yet
      jest.advanceTimersByTime(1000);
      expect(longPressCallback).not.toHaveBeenCalled();

      // Triggered after 1.5 seconds
      jest.advanceTimersByTime(500);
      expect(longPressCallback).toHaveBeenCalledTimes(1);
      expect(longPressCallback).toHaveBeenCalledWith(
        { x: 300, y: 300 },
        null
      );
    });

    it('should trigger long-press with element', () => {
      const longPressCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);

      const hubElement = createCanvasElement('hub-1', 'hub', { x: 400, y: 300 });
      gestureHandler.registerElements([hubElement]);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 400, 300));
      jest.advanceTimersByTime(1500);

      expect(longPressCallback).toHaveBeenCalledTimes(1);
      expect(longPressCallback).toHaveBeenCalledWith(
        { x: 400, y: 300 },
        expect.objectContaining({
          id: 'hub-1',
          type: 'hub',
        })
      );
    });

    it('should cancel long-press if pointer moves', () => {
      const longPressCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(500);
      
      // Move pointer (exceeds threshold)
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 120, 120));
      
      // Wait for long-press duration
      jest.advanceTimersByTime(1000);

      expect(longPressCallback).not.toHaveBeenCalled();
    });

    it('should cancel long-press if pointer is released early', () => {
      const longPressCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(500);
      
      // Release before long-press duration
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));
      
      // Wait for what would have been long-press duration
      jest.advanceTimersByTime(1000);

      expect(longPressCallback).not.toHaveBeenCalled();
    });

    it('should work with touch events', () => {
      const longPressCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);

      mockCanvas.trigger('touchstart', createTouchEvent('touchstart', 250, 250));
      jest.advanceTimersByTime(1500);

      expect(longPressCallback).toHaveBeenCalledTimes(1);
      expect(longPressCallback).toHaveBeenCalledWith(
        { x: 250, y: 250 },
        null
      );
    });

    it('should respect custom long-press duration', () => {
      const handler = new GestureHandler({ longPressDuration: 2000 });
      const canvas = new MockCanvas();
      handler.initialize(canvas as any);

      const longPressCallback = jest.fn();
      handler.onLongPress(longPressCallback);

      canvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      
      // Not triggered at 1.5s
      jest.advanceTimersByTime(1500);
      expect(longPressCallback).not.toHaveBeenCalled();

      // Triggered at 2s
      jest.advanceTimersByTime(500);
      expect(longPressCallback).toHaveBeenCalledTimes(1);

      handler.destroy();
    });
  });

  describe('Drag Gesture', () => {
    it('should trigger drag callbacks during movement', () => {
      const dragCallback = jest.fn();
      gestureHandler.onDrag(dragCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 110, 110));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 120, 120));

      expect(dragCallback).toHaveBeenCalled();
      expect(dragCallback).toHaveBeenCalledWith(
        { x: 100, y: 100 }, // start
        expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }), // current
        null // no element
      );
    });

    it('should trigger dragEnd callback on pointer up', () => {
      const dragEndCallback = jest.fn();
      gestureHandler.onDragEnd(dragEndCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 150, 150));
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 150, 150));

      expect(dragEndCallback).toHaveBeenCalledTimes(1);
      expect(dragEndCallback).toHaveBeenCalledWith(
        { x: 100, y: 100 }, // start
        { x: 150, y: 150 }, // end
        null
      );
    });

    it('should include element in drag callbacks', () => {
      const dragCallback = jest.fn();
      const dragEndCallback = jest.fn();
      gestureHandler.onDrag(dragCallback);
      gestureHandler.onDragEnd(dragEndCallback);

      const clusterElement = createCanvasElement('cluster-1', 'cluster', { x: 200, y: 200 });
      gestureHandler.registerElements([clusterElement]);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 200, 200));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 250, 250));
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 250, 250));

      expect(dragCallback).toHaveBeenCalledWith(
        { x: 200, y: 200 },
        expect.any(Object),
        expect.objectContaining({
          id: 'cluster-1',
          type: 'cluster',
        })
      );

      expect(dragEndCallback).toHaveBeenCalledWith(
        { x: 200, y: 200 },
        { x: 250, y: 250 },
        expect.objectContaining({
          id: 'cluster-1',
          type: 'cluster',
        })
      );
    });

    it('should not trigger drag if movement is below threshold', () => {
      const dragCallback = jest.fn();
      gestureHandler.onDrag(dragCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 102, 102)); // 2px movement
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 102, 102));

      expect(dragCallback).not.toHaveBeenCalled();
    });

    it('should work with touch events', () => {
      const dragEndCallback = jest.fn();
      gestureHandler.onDragEnd(dragEndCallback);

      mockCanvas.trigger('touchstart', createTouchEvent('touchstart', 100, 100));
      mockCanvas.trigger('touchmove', createTouchEvent('touchmove', 150, 150));
      mockCanvas.trigger('touchend', createTouchEvent('touchend', 150, 150));

      expect(dragEndCallback).toHaveBeenCalledTimes(1);
    });

    it('should cancel long-press when drag starts', () => {
      const longPressCallback = jest.fn();
      const dragCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);
      gestureHandler.onDrag(dragCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(500);
      
      // Start dragging
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 120, 120));
      
      // Wait for what would have been long-press
      jest.advanceTimersByTime(1000);

      expect(longPressCallback).not.toHaveBeenCalled();
      expect(dragCallback).toHaveBeenCalled();
    });
  });

  describe('Gesture State', () => {
    it('should report gesture as active during interaction', () => {
      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      
      expect(gestureHandler.isGestureActive()).toBe(true);
      
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));
      
      expect(gestureHandler.isGestureActive()).toBe(false);
    });

    it('should report correct gesture type during drag', () => {
      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      expect(gestureHandler.getCurrentGestureType()).toBeNull();
      
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 120, 120));
      expect(gestureHandler.getCurrentGestureType()).toBe('drag');
      
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 120, 120));
      expect(gestureHandler.getCurrentGestureType()).toBeNull();
    });

    it('should report correct gesture type during long-press', () => {
      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      expect(gestureHandler.getCurrentGestureType()).toBeNull();
      
      jest.advanceTimersByTime(1500);
      expect(gestureHandler.getCurrentGestureType()).toBe('long-press');
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const canvas = new MockCanvas();
      const handler = new GestureHandler();
      handler.initialize(canvas as any);

      const tapCallback = jest.fn();
      handler.onTap(tapCallback);

      handler.destroy();

      // Try to trigger event after destroy
      canvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      canvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));

      expect(tapCallback).not.toHaveBeenCalled();
    });

    it('should clear timers on destroy', () => {
      const longPressCallback = jest.fn();
      gestureHandler.onLongPress(longPressCallback);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      gestureHandler.destroy();

      jest.advanceTimersByTime(2000);
      expect(longPressCallback).not.toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('createElementBounds should create correct bounds for HUB', () => {
      const bounds = createElementBounds({ x: 400, y: 300 }, 128, 'hub');
      
      expect(bounds).toEqual({
        x: 336, // 400 - 64
        y: 236, // 300 - 64
        width: 128,
        height: 128,
      });
    });

    it('createElementBounds should create correct bounds for Cluster', () => {
      const bounds = createElementBounds({ x: 200, y: 150 }, 96, 'cluster');
      
      expect(bounds).toEqual({
        x: 152, // 200 - 48
        y: 102, // 150 - 48
        width: 96,
        height: 96,
      });
    });

    it('createElementBounds should create correct bounds for Task', () => {
      const bounds = createElementBounds({ x: 100, y: 100 }, 32, 'task');
      
      expect(bounds).toEqual({
        x: 84, // 100 - 16
        y: 84, // 100 - 16
        width: 32,
        height: 32,
      });
    });

    it('createCanvasElement should create complete element', () => {
      const element = createCanvasElement('test-id', 'cluster', { x: 300, y: 200 });
      
      expect(element).toEqual({
        id: 'test-id',
        type: 'cluster',
        bounds: {
          x: 252,
          y: 152,
          width: 96,
          height: 96,
        },
      });
    });
  });

  describe('Multiple Callbacks', () => {
    it('should trigger all registered tap callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      gestureHandler.onTap(callback1);
      gestureHandler.onTap(callback2);
      gestureHandler.onTap(callback3);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      jest.advanceTimersByTime(100);
      mockCanvas.trigger('mouseup', createMouseEvent('mouseup', 100, 100));

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('should trigger all registered drag callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      gestureHandler.onDrag(callback1);
      gestureHandler.onDrag(callback2);

      mockCanvas.trigger('mousedown', createMouseEvent('mousedown', 100, 100));
      mockCanvas.trigger('mousemove', createMouseEvent('mousemove', 120, 120));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
