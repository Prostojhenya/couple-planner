# GestureHandler

## Overview

The `GestureHandler` class handles all touch and mouse gestures for the visual mind-map canvas. It provides a unified interface for detecting and responding to user interactions including taps, long-presses, and drag gestures.

## Requirements Fulfilled

- **11.1**: Support tap gesture for selection and activation
- **11.2**: Support long-press gesture (1-2 seconds) for special actions
- **11.3**: Support drag gesture for moving and creating elements

## Features

### Gesture Types

1. **Tap**: Quick press and release (< 300ms, < 5px movement)
2. **Long-Press**: Press and hold for 1.5 seconds
3. **Drag**: Press and move (> 5px movement)

### Dual Input Support

- **Mouse Events**: Full support for desktop interactions
- **Touch Events**: Full support for mobile/tablet interactions

### Element Detection

- Automatic hit detection for registered canvas elements
- Returns the element under the cursor/touch point
- Supports overlapping elements (top-to-bottom priority)

## Usage

### Basic Setup

```typescript
import { GestureHandler } from '@/lib/GestureHandler';

// Create gesture handler
const gestureHandler = new GestureHandler();

// Initialize with canvas element
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
gestureHandler.initialize(canvas);
```

### Register Gesture Callbacks

```typescript
// Handle tap gestures
gestureHandler.onTap((position, element) => {
  console.log('Tapped at:', position);
  if (element) {
    console.log('Tapped element:', element.type, element.id);
  }
});

// Handle long-press gestures
gestureHandler.onLongPress((position, element) => {
  console.log('Long-pressed at:', position);
  if (element) {
    console.log('Long-pressed element:', element.type, element.id);
  }
});

// Handle drag gestures (continuous updates)
gestureHandler.onDrag((start, current, element) => {
  console.log('Dragging from:', start, 'to:', current);
  if (element) {
    console.log('Dragging element:', element.type, element.id);
  }
});

// Handle drag end
gestureHandler.onDragEnd((start, end, element) => {
  console.log('Drag completed from:', start, 'to:', end);
  if (element) {
    console.log('Dropped element:', element.type, element.id);
  }
});
```

### Register Canvas Elements

For hit detection to work, you need to register all interactive elements:

```typescript
import { createCanvasElement } from '@/lib/GestureHandler';

// Create element registrations
const elements = [
  createCanvasElement('hub-1', 'hub', { x: 400, y: 300 }),
  createCanvasElement('cluster-1', 'cluster', { x: 600, y: 200 }),
  createCanvasElement('task-1', 'task', { x: 650, y: 150 }),
];

// Register with gesture handler
gestureHandler.registerElements(elements);
```

### Manual Element Detection

You can also manually check what element is at a specific position:

```typescript
const position = { x: 100, y: 200 };
const element = gestureHandler.getElementAt(position);

if (element) {
  console.log('Found element:', element.type, element.id);
}
```

### Cleanup

Always clean up when the component unmounts:

```typescript
gestureHandler.destroy();
```

## Configuration

You can customize gesture detection parameters:

```typescript
const gestureHandler = new GestureHandler({
  longPressDuration: 2000,  // 2 seconds for long-press
  dragThreshold: 10,        // 10 pixels to trigger drag
  tapMaxDuration: 500,      // 500ms max for tap
});
```

### Default Configuration

- `longPressDuration`: 1500ms (1.5 seconds)
- `dragThreshold`: 5px
- `tapMaxDuration`: 300ms

## Integration with Canvas

### Complete Example

```typescript
import { GestureHandler, createCanvasElement } from '@/lib/GestureHandler';
import { CanvasRenderer } from '@/lib/CanvasRenderer';

class MindMapCanvas {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private gestureHandler: GestureHandler;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    this.renderer = new CanvasRenderer();
    this.gestureHandler = new GestureHandler();

    // Initialize
    this.renderer.initialize(canvasElement);
    this.gestureHandler.initialize(canvasElement);

    // Setup gesture handlers
    this.setupGestures();
  }

  private setupGestures(): void {
    // Tap to toggle cluster
    this.gestureHandler.onTap((position, element) => {
      if (element?.type === 'cluster') {
        this.toggleCluster(element.id);
      }
    });

    // Long-press on HUB to create cluster
    this.gestureHandler.onLongPress((position, element) => {
      if (element?.type === 'hub') {
        this.startClusterCreation(position);
      }
    });

    // Drag to move or create
    this.gestureHandler.onDragEnd((start, end, element) => {
      if (element?.type === 'cluster') {
        this.moveCluster(element.id, end);
      }
    });
  }

  updateElements(state: CanvasState): void {
    // Create element registrations from state
    const elements: CanvasElement[] = [];

    // Register HUB
    if (state.hub) {
      const hubPos = this.getHubPosition();
      elements.push(createCanvasElement(state.hub.id, 'hub', hubPos));
    }

    // Register clusters
    state.clusters.forEach(cluster => {
      elements.push(
        createCanvasElement(
          cluster.id,
          'cluster',
          { x: cluster.positionX, y: cluster.positionY }
        )
      );
    });

    // Register tasks (if expanded)
    // ... add task registrations

    // Update gesture handler
    this.gestureHandler.registerElements(elements);
  }

  destroy(): void {
    this.gestureHandler.destroy();
  }
}
```

## Gesture Detection Logic

### Tap Detection

A tap is detected when:
1. Pointer down and up occur
2. Duration < 300ms
3. Movement < 5px
4. No long-press was triggered

### Long-Press Detection

A long-press is detected when:
1. Pointer down occurs
2. No movement > 5px for 1.5 seconds
3. Timer completes before pointer up

### Drag Detection

A drag is detected when:
1. Pointer down occurs
2. Movement > 5px
3. Long-press timer is cancelled
4. Continuous updates until pointer up

## Event Flow

```
Pointer Down
    ↓
Start Timer (1.5s)
    ↓
Movement?
    ├─ No → Wait for timer or pointer up
    │         ├─ Timer completes → LONG-PRESS
    │         └─ Pointer up (< 300ms, < 5px) → TAP
    │
    └─ Yes (> 5px) → Cancel timer
                      ↓
                   Start DRAG
                      ↓
                   Continuous updates
                      ↓
                   Pointer Up → DRAG END
```

## Helper Functions

### createElementBounds

Creates bounds object from position and size:

```typescript
const bounds = createElementBounds(
  { x: 100, y: 100 },
  96, // size
  'cluster'
);
// Returns: { x: 52, y: 52, width: 96, height: 96 }
```

### createCanvasElement

Creates a complete canvas element for registration:

```typescript
const element = createCanvasElement(
  'cluster-123',
  'cluster',
  { x: 200, y: 150 }
);
// Returns: { id: 'cluster-123', type: 'cluster', bounds: {...} }
```

## Testing

The GestureHandler includes methods for testing:

```typescript
// Check if gesture is active
const isActive = gestureHandler.isGestureActive();

// Get current gesture type
const type = gestureHandler.getCurrentGestureType();
// Returns: 'tap' | 'long-press' | 'drag' | null
```

## Browser Compatibility

- Modern browsers with Canvas API support
- Touch events (mobile/tablet)
- Mouse events (desktop)
- Prevents default behavior to avoid conflicts

## Performance Considerations

- Event listeners use passive: false for touch events to allow preventDefault
- Efficient hit detection using reverse iteration (top-to-bottom)
- Minimal state tracking
- Timer cleanup on gesture end

## Future Enhancements

Potential additions for future versions:

- Multi-touch gestures (pinch, rotate)
- Gesture velocity tracking
- Custom gesture patterns
- Gesture history/undo
- Visual feedback rendering
