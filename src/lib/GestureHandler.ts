/**
 * GestureHandler - Handles all touch and mouse gestures for canvas interaction
 * 
 * Requirements:
 * - 11.1: Support tap gesture for selection and activation
 * - 11.2: Support long-press gesture (1-2 seconds) for special actions
 * - 11.3: Support drag gesture for moving and creating elements
 * - 11.4: Provide visual feedback for gestures
 */

import { Position, Bounds, CanvasElement, GestureType, BUBBLE_SIZES } from '@/types/mindmap';

/**
 * Callback types for gesture events
 */
export type TapCallback = (position: Position, element: CanvasElement | null) => void;
export type LongPressCallback = (position: Position, element: CanvasElement | null) => void;
export type DragCallback = (start: Position, current: Position, element: CanvasElement | null) => void;
export type DragEndCallback = (start: Position, end: Position, element: CanvasElement | null) => void;

/**
 * Configuration for gesture detection
 */
interface GestureConfig {
  longPressDuration: number; // milliseconds
  dragThreshold: number; // pixels - minimum movement to trigger drag
  tapMaxDuration: number; // milliseconds - maximum duration for tap
}

const DEFAULT_CONFIG: GestureConfig = {
  longPressDuration: 1500, // 1.5 seconds (middle of 1-2 second range)
  dragThreshold: 5, // 5 pixels
  tapMaxDuration: 300, // 300ms
};

/**
 * Internal gesture state
 */
interface GestureState {
  isActive: boolean;
  type: GestureType | null;
  startPosition: Position | null;
  currentPosition: Position | null;
  startTime: number;
  longPressTimer: number | null;
  element: CanvasElement | null;
}

/**
 * GestureHandler class
 * Handles all touch and mouse gestures for the visual mind-map system
 */
export class GestureHandler {
  private canvas: HTMLCanvasElement | null = null;
  private config: GestureConfig;
  private state: GestureState;
  
  // Element registry for hit detection
  private elements: CanvasElement[] = [];
  
  // Callbacks
  private tapCallbacks: TapCallback[] = [];
  private longPressCallbacks: LongPressCallback[] = [];
  private dragCallbacks: DragCallback[] = [];
  private dragEndCallbacks: DragEndCallback[] = [];

  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  /**
   * Create initial gesture state
   */
  private createInitialState(): GestureState {
    return {
      isActive: false,
      type: null,
      startPosition: null,
      currentPosition: null,
      startTime: 0,
      longPressTimer: null,
      element: null,
    };
  }

  /**
   * Initialize gesture handler with canvas element
   * Requirements: Setup event listeners for touch and mouse events
   */
  initialize(canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners for both touch and mouse events
   */
  private attachEventListeners(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    this.canvas.addEventListener('mouseup', this.handlePointerUp);
    this.canvas.addEventListener('mouseleave', this.handlePointerCancel);

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('touchcancel', this.handlePointerCancel);
  }

  /**
   * Remove event listeners (cleanup)
   */
  destroy(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.removeEventListener('mousedown', this.handlePointerDown);
    this.canvas.removeEventListener('mousemove', this.handlePointerMove);
    this.canvas.removeEventListener('mouseup', this.handlePointerUp);
    this.canvas.removeEventListener('mouseleave', this.handlePointerCancel);

    // Touch events
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handlePointerCancel);

    this.clearLongPressTimer();
  }

  /**
   * Register callback for tap gesture
   * Requirements: 11.1 - Support tap gesture
   */
  onTap(callback: TapCallback): void {
    this.tapCallbacks.push(callback);
  }

  /**
   * Register callback for long-press gesture
   * Requirements: 11.2 - Support long-press gesture (1-2 seconds)
   */
  onLongPress(callback: LongPressCallback): void {
    this.longPressCallbacks.push(callback);
  }

  /**
   * Register callback for drag gesture
   * Requirements: 11.3 - Support drag gesture
   */
  onDrag(callback: DragCallback): void {
    this.dragCallbacks.push(callback);
  }

  /**
   * Register callback for drag end
   * Requirements: 11.3 - Support drag gesture completion
   */
  onDragEnd(callback: DragEndCallback): void {
    this.dragEndCallbacks.push(callback);
  }

  /**
   * Register elements for hit detection
   * This should be called whenever the canvas state changes
   */
  registerElements(elements: CanvasElement[]): void {
    this.elements = elements;
  }

  /**
   * Get element at specific position
   * Requirements: Determine element under cursor for gesture handling
   */
  getElementAt(position: Position): CanvasElement | null {
    // Check elements in reverse order (top to bottom)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      if (this.isPointInBounds(position, element.bounds)) {
        return element;
      }
    }
    return null;
  }

  /**
   * Check if point is within bounds
   */
  private isPointInBounds(point: Position, bounds: Bounds): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  /**
   * Get position from mouse event
   */
  private getPositionFromMouseEvent(event: MouseEvent): Position {
    if (!this.canvas) return { x: 0, y: 0 };
    
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
   * Get position from touch event
   */
  private getPositionFromTouchEvent(event: TouchEvent): Position {
    if (!this.canvas || event.touches.length === 0) return { x: 0, y: 0 };
    
    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  /**
   * Calculate distance between two positions
   */
  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle pointer down (start of gesture)
   */
  private handlePointerDown = (event: MouseEvent): void => {
    event.preventDefault();
    
    const position = this.getPositionFromMouseEvent(event);
    this.startGesture(position);
  };

  /**
   * Handle touch start
   */
  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    
    const position = this.getPositionFromTouchEvent(event);
    this.startGesture(position);
  };

  /**
   * Start gesture detection
   */
  private startGesture(position: Position): void {
    const element = this.getElementAt(position);
    
    this.state = {
      isActive: true,
      type: null,
      startPosition: position,
      currentPosition: position,
      startTime: Date.now(),
      longPressTimer: null,
      element,
    };

    // Start long-press timer
    this.state.longPressTimer = window.setTimeout(() => {
      this.triggerLongPress();
    }, this.config.longPressDuration);
  }

  /**
   * Handle pointer move
   */
  private handlePointerMove = (event: MouseEvent): void => {
    if (!this.state.isActive) return;
    
    const position = this.getPositionFromMouseEvent(event);
    this.updateGesture(position);
  };

  /**
   * Handle touch move
   */
  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.state.isActive) return;
    
    event.preventDefault();
    const position = this.getPositionFromTouchEvent(event);
    this.updateGesture(position);
  };

  /**
   * Update gesture state during movement
   */
  private updateGesture(position: Position): void {
    if (!this.state.startPosition) return;

    this.state.currentPosition = position;

    // Check if movement exceeds drag threshold
    const distance = this.getDistance(this.state.startPosition, position);
    
    if (distance > this.config.dragThreshold && this.state.type !== 'drag') {
      // Movement detected - cancel long-press and start drag
      this.clearLongPressTimer();
      this.startDrag();
    }

    // Trigger drag callbacks if in drag mode
    if (this.state.type === 'drag') {
      this.triggerDrag();
    }
  }

  /**
   * Handle pointer up (end of gesture)
   */
  private handlePointerUp = (event: MouseEvent): void => {
    if (!this.state.isActive) return;
    
    const position = this.getPositionFromMouseEvent(event);
    this.endGesture(position);
  };

  /**
   * Handle touch end
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.state.isActive) return;
    
    // Use last known position for touch end
    const position = this.state.currentPosition || this.state.startPosition;
    if (position) {
      this.endGesture(position);
    }
  };

  /**
   * End gesture and determine final type
   */
  private endGesture(position: Position): void {
    if (!this.state.startPosition) {
      this.resetState();
      return;
    }

    const duration = Date.now() - this.state.startTime;
    const distance = this.getDistance(this.state.startPosition, position);

    // Clear long-press timer
    this.clearLongPressTimer();

    // Determine gesture type if not already set
    if (this.state.type === 'drag') {
      // Drag gesture completed
      this.triggerDragEnd(position);
    } else if (this.state.type === 'long-press') {
      // Long-press already triggered, just reset
      this.resetState();
    } else if (distance <= this.config.dragThreshold && duration <= this.config.tapMaxDuration) {
      // Tap gesture
      this.triggerTap(position);
    }

    this.resetState();
  }

  /**
   * Handle pointer cancel (mouse leave or touch cancel)
   */
  private handlePointerCancel = (): void => {
    this.clearLongPressTimer();
    this.resetState();
  };

  /**
   * Start drag gesture
   * Requirements: 11.3 - Support drag gesture
   */
  private startDrag(): void {
    this.state.type = 'drag';
  }

  /**
   * Trigger tap callbacks
   * Requirements: 11.1 - Support tap gesture
   */
  private triggerTap(position: Position): void {
    const element = this.getElementAt(position);
    this.tapCallbacks.forEach(callback => {
      callback(position, element);
    });
  }

  /**
   * Trigger long-press callbacks
   * Requirements: 11.2 - Support long-press gesture (1-2 seconds)
   */
  private triggerLongPress(): void {
    if (!this.state.isActive || !this.state.startPosition) return;

    this.state.type = 'long-press';
    
    this.longPressCallbacks.forEach(callback => {
      callback(this.state.startPosition!, this.state.element);
    });
  }

  /**
   * Trigger drag callbacks
   * Requirements: 11.3 - Support drag gesture
   */
  private triggerDrag(): void {
    if (!this.state.startPosition || !this.state.currentPosition) return;

    this.dragCallbacks.forEach(callback => {
      callback(this.state.startPosition!, this.state.currentPosition!, this.state.element);
    });
  }

  /**
   * Trigger drag end callbacks
   * Requirements: 11.3 - Support drag gesture completion
   */
  private triggerDragEnd(endPosition: Position): void {
    if (!this.state.startPosition) return;

    this.dragEndCallbacks.forEach(callback => {
      callback(this.state.startPosition!, endPosition, this.state.element);
    });
  }

  /**
   * Clear long-press timer
   */
  private clearLongPressTimer(): void {
    if (this.state.longPressTimer !== null) {
      window.clearTimeout(this.state.longPressTimer);
      this.state.longPressTimer = null;
    }
  }

  /**
   * Reset gesture state
   */
  private resetState(): void {
    this.state = this.createInitialState();
  }

  /**
   * Get current gesture type (for debugging/testing)
   */
  getCurrentGestureType(): GestureType | null {
    return this.state.type;
  }

  /**
   * Check if gesture is active (for debugging/testing)
   */
  isGestureActive(): boolean {
    return this.state.isActive;
  }
}

/**
 * Helper function to create element bounds from position and size
 * Useful for registering elements with the gesture handler
 */
export function createElementBounds(
  position: Position,
  size: number,
  type: 'hub' | 'cluster' | 'task'
): Bounds {
  const radius = size / 2;
  return {
    x: position.x - radius,
    y: position.y - radius,
    width: size,
    height: size,
  };
}

/**
 * Helper function to create canvas element for registration
 */
export function createCanvasElement(
  id: string,
  type: 'hub' | 'cluster' | 'task',
  position: Position
): CanvasElement {
  let size: number;
  switch (type) {
    case 'hub':
      size = BUBBLE_SIZES.HUB;
      break;
    case 'cluster':
      size = BUBBLE_SIZES.CLUSTER;
      break;
    case 'task':
      size = BUBBLE_SIZES.TASK;
      break;
  }

  return {
    id,
    type,
    bounds: createElementBounds(position, size, type),
  };
}
