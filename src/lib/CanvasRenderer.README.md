# CanvasRenderer

## Overview

The `CanvasRenderer` class is responsible for all canvas rendering operations in the Visual Mind-Map Task System. It handles drawing the HUB, Clusters, Tasks, and connections between elements according to the design specifications.

## Features

- **Three-level hierarchy rendering**: HUB (128px), Cluster (96px), Task (32px)
- **Grid background**: Light gray grid for visual reference
- **Curved connections**: Dashed curved lines between HUB and Clusters
- **Soft shadows**: Applied to all bubble elements
- **High DPI support**: Automatically scales for retina displays
- **Expanded cluster visualization**: Tasks displayed in a ring around expanded clusters

## Requirements Validation

This component validates the following requirements:

- **1.1**: Display three bubble sizes (Task: 32px, Cluster: 96px, HUB: 128px)
- **1.3**: Task displays only icon without text and counter
- **1.4**: Cluster displays icon, task counter, and member label
- **1.5**: HUB displays context initials and cluster counter
- **9.2**: Display connections between HUB and Cluster as dashed curved lines (#D1D5DB)

## Usage

### Basic Setup

```typescript
import { CanvasRenderer } from '@/lib/CanvasRenderer';

// Create renderer instance
const renderer = new CanvasRenderer();

// Initialize with canvas element
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
renderer.initialize(canvas);

// Render state
renderer.render(canvasState);
```

### With React

```typescript
import { useEffect, useRef } from 'react';
import { CanvasRenderer, CanvasState } from '@/lib/CanvasRenderer';

function MyComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new CanvasRenderer();
    renderer.initialize(canvasRef.current);
    rendererRef.current = renderer;

    // Handle resize
    const handleResize = () => {
      renderer.resize();
      renderer.render(myState);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
```

## API Reference

### Methods

#### `initialize(canvasElement: HTMLCanvasElement): void`

Initializes the canvas element and sets up the rendering context.

- **Parameters:**
  - `canvasElement`: The HTML canvas element to render on
- **Throws:** Error if 2D context cannot be obtained
- **Side effects:** Sets up high DPI scaling

#### `resize(): void`

Resizes the canvas to match its container dimensions. Should be called when the window or container is resized.

#### `clear(): void`

Clears the entire canvas.

#### `render(state: CanvasState): void`

Renders the complete canvas state including grid, connections, HUB, clusters, and tasks.

- **Parameters:**
  - `state`: The complete canvas state to render

#### `renderHub(hub: HubWithClusters): void`

Renders the HUB element at the center of the canvas.

- **Parameters:**
  - `hub`: Hub data including participants and cluster count
- **Requirements:** 1.1, 1.5

#### `renderCluster(cluster: ClusterWithTasks, isExpanded: boolean): void`

Renders a Cluster element at its specified position.

- **Parameters:**
  - `cluster`: Cluster data including type, position, tasks, and members
  - `isExpanded`: Whether the cluster is currently expanded
- **Requirements:** 1.1, 1.4

#### `renderTask(task: TaskWithChildren, position: Position): void`

Renders a Task element at the specified position.

- **Parameters:**
  - `task`: Task data including completion status and icon
  - `position`: Position to render the task
- **Requirements:** 1.1, 1.3

#### `renderConnection(from: Position, to: Position): void`

Renders a curved connection line between two positions.

- **Parameters:**
  - `from`: Starting position
  - `to`: Ending position
- **Requirements:** 9.2

#### `animateExpand(cluster: ClusterWithTasks, tasks: TaskWithChildren[]): Promise<void>`

Placeholder for cluster expansion animation. Currently returns immediately.

- **Parameters:**
  - `cluster`: The cluster being expanded
  - `tasks`: Tasks to animate into view
- **Requirements:** 12.1

#### `animateCollapse(cluster: ClusterWithTasks): Promise<void>`

Placeholder for cluster collapse animation. Currently returns immediately.

- **Parameters:**
  - `cluster`: The cluster being collapsed
- **Requirements:** 12.2

## Types

### CanvasState

```typescript
interface CanvasState {
  hub: HubWithClusters | null;
  clusters: Map<string, ClusterWithTasks>;
  tasks: Map<string, TaskWithChildren>;
  expandedClusters: Set<string>;
  selectedElement: string | null;
}
```

### Position

```typescript
interface Position {
  x: number;
  y: number;
}
```

## Visual Specifications

### Bubble Sizes

- **HUB**: 128px diameter (64px radius)
- **Cluster**: 96px diameter (48px radius)
- **Task**: 32px diameter (16px radius)

### Colors

- **Primary**: #1F2937 (HUB background)
- **Secondary**: #6B7280 (text, borders)
- **Accent**: #3B82F6 (highlights, expanded border)
- **Success**: #22C55E (completed tasks)
- **Connection**: #D1D5DB (connection lines)
- **Grid**: #F3F4F6 (background grid)

### Shadows

- **Blur**: 10px
- **Color**: rgba(0, 0, 0, 0.1)
- **Offset**: (0, 2)

### Grid

- **Size**: 20px
- **Color**: #F3F4F6

## Element Details

### HUB

- Always positioned at the center of the canvas
- Displays participant initials (e.g., "Я | Ю")
- Shows cluster count below initials
- Dark background (#1F2937) with white text

### Cluster

- Positioned at specified coordinates
- Shows type-specific icon at top
- Displays task counter when collapsed
- Shows member indicator (👥) at bottom
- White background with optional blue border when expanded
- When expanded, tasks are arranged in a ring around it

### Task

- Small circular bubble
- Shows only an icon (no text or counter)
- Green background when completed, white when incomplete
- Displays checkmark when completed, dot when incomplete

### Connections

- Dashed curved lines (#D1D5DB)
- Quadratic bezier curves from HUB to each Cluster
- 2px line width
- 5px dash, 5px gap pattern

## Performance Considerations

- **High DPI Support**: Automatically scales canvas for retina displays
- **Efficient Rendering**: Clears and redraws entire canvas on each render
- **No Memory Leaks**: Properly manages canvas context and event listeners

## Future Enhancements

1. **Animation Support**: Implement smooth animations for expand/collapse
2. **Interaction Handling**: Add click/touch detection for elements
3. **Zoom and Pan**: Support canvas transformation for large mind-maps
4. **Performance Optimization**: Implement dirty rectangle rendering for large datasets
5. **Custom Themes**: Support for different color schemes

## Testing

Unit tests are provided in `src/lib/__tests__/CanvasRenderer.test.ts` covering:

- Initialization and setup
- Rendering methods for all element types
- Size and position validation
- Connection rendering
- State management

## Related Components

- **GestureHandler**: Handles user interactions with canvas elements
- **CanvasStore**: Manages canvas state
- **MindMapCanvas**: Main component that uses CanvasRenderer

## License

Part of the Visual Mind-Map Task System project.
