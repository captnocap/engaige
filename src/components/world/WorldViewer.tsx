/**
 * World Viewer
 *
 * Main isometric city viewer component using PixiJS for rendering.
 * Shows the city map with districts, buildings, and NPC positions.
 */

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { useWorldStore } from '../../stores/worldStore.js';
import { useWSStore } from '../../stores/wsStore.js';
import {
  gridToScreen,
  screenToGrid,
  getVisibleGridBounds,
  calculateZOrder,
  TILE_WIDTH,
  TILE_HEIGHT,
} from './utils/isometric.js';
import WorldControls from './WorldControls.js';
import NPCPopover from './NPCPopover.js';

// ============================================================================
// Constants
// ============================================================================

const BUILDING_COLORS: Record<string, number> = {
  apartment: 0x8B4513,
  house: 0xA0522D,
  office: 0x4682B4,
  cafe: 0xDEB887,
  restaurant: 0xCD853F,
  bar: 0x800020,
  club: 0x4B0082,
  gym: 0x32CD32,
  library: 0xDAA520,
  bookstore: 0xD2691E,
  gallery: 0x9370DB,
  studio: 0xFF69B4,
  shop: 0x20B2AA,
  mall: 0x00CED1,
  park: 0x228B22,
  plaza: 0xBDB76B,
  university: 0x8B0000,
  hospital: 0xFFFFFF,
  warehouse: 0x696969,
  factory: 0x2F4F4F,
};

const DISTRICT_COLORS: Record<string, number> = {
  downtown: 0x4A90A4,
  arts: 0x9B59B6,
  university: 0x27AE60,
  nightlife: 0xE74C3C,
  waterfront: 0x3498DB,
  residential: 0x95A5A6,
  suburbs: 0x7F8C8D,
  shopping: 0xF39C12,
  industrial: 0x34495E,
};

// ============================================================================
// Component
// ============================================================================

export default function WorldViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldContainerRef = useRef<Container | null>(null);

  // WebSocket connection state
  const connected = useWSStore((state) => state.connected);

  // Store state
  const {
    city,
    gameTime,
    aiNPCs,
    backgroundNPCs,
    playerHome,
    viewport,
    hoveredNPCId,
    hoveredBuildingId,
    isLoading,
    error,
    loadWorldState,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    requestBackgroundNPCs,
    setViewport,
    setHoveredNPC,
    setHoveredBuilding,
    setSelectedNPC,
    getBuilding,
    getLandmarkByBuildingId,
  } = useWorldStore();

  // Local state for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Canvas dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // ============================================================================
  // Initialization
  // ============================================================================

  // Load world state when connected
  useEffect(() => {
    if (!connected) {
      console.log('[WorldViewer] Waiting for WebSocket connection...');
      return;
    }

    console.log('[WorldViewer] Connected, loading world state...');
    loadWorldState().then(() => {
      console.log('[WorldViewer] World state loaded, city:', useWorldStore.getState().city?.name);
    }).catch(err => {
      console.error('[WorldViewer] Failed to load world state:', err);
    });
    subscribeToUpdates();

    return () => {
      unsubscribeFromUpdates();
    };
  }, [connected]);

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    const container = containerRef.current;
    const app = new Application();

    const initApp = async () => {
      await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Check if still mounted after async init
      if (!isMounted) {
        app.destroy(true);
        return;
      }

      container.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Create world container
      const worldContainer = new Container();
      worldContainer.sortableChildren = true;
      app.stage.addChild(worldContainer);
      worldContainerRef.current = worldContainer;

      // Update dimensions
      setDimensions({
        width: app.screen.width,
        height: app.screen.height,
      });
    };

    initApp();

    // Handle resize
    const handleResize = () => {
      if (appRef.current && container) {
        appRef.current.renderer.resize(
          container.clientWidth,
          container.clientHeight
        );
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // ============================================================================
  // Rendering
  // ============================================================================

  // Render the world when data changes
  useEffect(() => {
    if (!appRef.current || !worldContainerRef.current || !city) return;

    const worldContainer = worldContainerRef.current;
    worldContainer.removeChildren();

    // Get visible bounds
    const visibleBounds = getVisibleGridBounds(
      viewport,
      dimensions.width,
      dimensions.height,
      5
    );

    // Render districts (ground layer)
    renderDistricts(worldContainer, city.districts, visibleBounds);

    // Render buildings
    renderBuildings(worldContainer, city.buildings, visibleBounds);

    // Render AI NPCs
    renderAINPCs(worldContainer, aiNPCs, visibleBounds);

    // Render background NPCs
    renderBackgroundNPCs(worldContainer, backgroundNPCs, visibleBounds);

    // Render player home marker
    if (playerHome) {
      renderPlayerHome(worldContainer, playerHome);
    }

    // Sort children by z-index for proper depth ordering
    worldContainer.sortChildren();
  }, [city, aiNPCs, backgroundNPCs, playerHome, viewport, dimensions]);

  // Request background NPCs when viewport changes
  useEffect(() => {
    if (!city) return;

    const bounds = getVisibleGridBounds(viewport, dimensions.width, dimensions.height, 10);
    const clampedBounds = {
      minX: Math.max(0, bounds.minX),
      maxX: Math.min(city.gridSize.width, bounds.maxX),
      minY: Math.max(0, bounds.minY),
      maxY: Math.min(city.gridSize.height, bounds.maxY),
    };

    requestBackgroundNPCs(clampedBounds);
  }, [viewport.x, viewport.y, viewport.zoom, city, dimensions]);

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderDistricts = useCallback((
    container: Container,
    districts: typeof city.districts,
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ) => {
    for (const district of districts) {
      const graphics = new Graphics();

      // Draw district as a colored polygon
      const points = district.bounds.points;
      if (points.length < 3) continue;

      graphics.fill({ color: parseInt(district.color.replace('#', ''), 16), alpha: 0.2 });

      // Convert polygon points to screen coordinates
      const screenPoints: number[] = [];
      for (const [gx, gy] of points) {
        const screen = gridToScreen(gx, gy, viewport, dimensions.width, dimensions.height);
        screenPoints.push(screen.x, screen.y);
      }

      graphics.poly(screenPoints);
      graphics.fill();

      // Draw district border
      graphics.stroke({ color: parseInt(district.color.replace('#', ''), 16), width: 1, alpha: 0.5 });
      graphics.poly(screenPoints);
      graphics.stroke();

      graphics.zIndex = -100;
      container.addChild(graphics);
    }
  }, [viewport, dimensions]);

  const renderBuildings = useCallback((
    container: Container,
    buildings: typeof city.buildings,
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ) => {
    for (const building of buildings) {
      const { x, y } = building.position;

      // Skip if outside visible bounds
      if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
        continue;
      }

      const screen = gridToScreen(x, y, viewport, dimensions.width, dimensions.height);
      const color = BUILDING_COLORS[building.type] || 0x888888;

      const graphics = new Graphics();

      // Draw isometric building (simple rectangle for now)
      const width = TILE_WIDTH * viewport.zoom * 0.8;
      const height = TILE_HEIGHT * viewport.zoom * 1.5;

      graphics.rect(screen.x - width / 2, screen.y - height, width, height);
      graphics.fill({ color, alpha: 0.8 });
      graphics.stroke({ color: 0x000000, width: 1, alpha: 0.3 });

      // Check if this is a landmark
      const landmark = getLandmarkByBuildingId(building.id);
      if (landmark && landmark.iconEmoji && viewport.zoom > 0.5) {
        const text = new Text({
          text: landmark.iconEmoji,
          style: new TextStyle({
            fontSize: 14 * viewport.zoom,
          }),
        });
        text.anchor.set(0.5);
        text.position.set(screen.x, screen.y - height - 10 * viewport.zoom);
        container.addChild(text);
      }

      graphics.zIndex = calculateZOrder(x, y);
      graphics.eventMode = 'static';
      graphics.cursor = 'pointer';

      graphics.on('pointerover', () => {
        setHoveredBuilding(building.id);
      });
      graphics.on('pointerout', () => {
        setHoveredBuilding(null);
      });

      container.addChild(graphics);
    }
  }, [viewport, dimensions, getLandmarkByBuildingId, setHoveredBuilding]);

  const renderAINPCs = useCallback((
    container: Container,
    npcs: typeof aiNPCs,
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ) => {
    for (const npc of npcs) {
      const { x, y } = npc.position;

      // Skip if outside visible bounds
      if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
        continue;
      }

      const screen = gridToScreen(x, y, viewport, dimensions.width, dimensions.height);

      const graphics = new Graphics();

      // Draw NPC as a colored circle (blue for AI NPCs)
      const radius = 6 * viewport.zoom;
      graphics.circle(screen.x, screen.y - radius, radius);
      graphics.fill({ color: 0x3498db, alpha: 1 });
      graphics.stroke({ color: 0xffffff, width: 2 * viewport.zoom, alpha: 1 });

      graphics.zIndex = calculateZOrder(x, y, 10);
      graphics.eventMode = 'static';
      graphics.cursor = 'pointer';

      graphics.on('pointerover', (e) => {
        setHoveredNPC(npc.npcId);
        setPopoverPosition({ x: e.global.x, y: e.global.y });
      });
      graphics.on('pointerout', () => {
        setHoveredNPC(null);
        setPopoverPosition(null);
      });
      graphics.on('pointertap', () => {
        setSelectedNPC(npc.npcId);
      });

      container.addChild(graphics);
    }
  }, [viewport, dimensions, setHoveredNPC, setSelectedNPC]);

  const renderBackgroundNPCs = useCallback((
    container: Container,
    npcs: typeof backgroundNPCs,
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ) => {
    // Only render at certain zoom levels
    if (viewport.zoom < 0.5) return;

    for (const npc of npcs) {
      const { x, y } = npc.position;

      // Skip if outside visible bounds
      if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
        continue;
      }

      const screen = gridToScreen(x, y, viewport, dimensions.width, dimensions.height);

      const graphics = new Graphics();

      // Draw background NPC as a smaller gray circle
      const radius = 3 * viewport.zoom;
      graphics.circle(screen.x, screen.y - radius, radius);
      graphics.fill({ color: 0x888888, alpha: 0.7 });

      graphics.zIndex = calculateZOrder(x, y, 5);
      graphics.eventMode = 'static';
      graphics.cursor = 'default';

      graphics.on('pointerover', () => {
        setHoveredNPC(npc.id);
      });
      graphics.on('pointerout', () => {
        setHoveredNPC(null);
      });

      container.addChild(graphics);
    }
  }, [viewport, dimensions, setHoveredNPC]);

  const renderPlayerHome = useCallback((
    container: Container,
    home: typeof playerHome
  ) => {
    if (!home) return;

    const { x, y } = home.position;
    const screen = gridToScreen(x, y, viewport, dimensions.width, dimensions.height);

    const graphics = new Graphics();

    // Draw player marker as a star/home icon
    const size = 10 * viewport.zoom;
    graphics.circle(screen.x, screen.y - size, size);
    graphics.fill({ color: 0x00ff00, alpha: 0.8 });
    graphics.stroke({ color: 0xffffff, width: 2 * viewport.zoom });

    // Add "You" label
    const text = new Text({
      text: 'You',
      style: new TextStyle({
        fontSize: 10 * viewport.zoom,
        fill: 0xffffff,
        fontWeight: 'bold',
      }),
    });
    text.anchor.set(0.5);
    text.position.set(screen.x, screen.y - size * 2.5);
    container.addChild(text);

    graphics.zIndex = calculateZOrder(x, y, 100);
    container.addChild(graphics);
  }, [viewport, dimensions]);

  // ============================================================================
  // Input Handling
  // ============================================================================

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / viewport.zoom;
    const dy = (e.clientY - dragStart.y) / viewport.zoom;

    // Convert screen delta to grid delta (accounting for isometric transform)
    const gridDx = -(dx / TILE_WIDTH + dy / TILE_HEIGHT);
    const gridDy = -(dy / TILE_HEIGHT - dx / TILE_WIDTH);

    setViewport({
      x: viewport.x + gridDx * 0.5,
      y: viewport.y + gridDy * 0.5,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, viewport, setViewport]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.25, Math.min(2, viewport.zoom + zoomDelta));

    setViewport({ zoom: newZoom });
  }, [viewport.zoom, setViewport]);

  // ============================================================================
  // Render
  // ============================================================================

  // Show connecting state
  if (!connected) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bgPrimary)] text-[var(--color-text)]">
        <div className="text-center">
          <p className="text-lg mb-2">Connecting to server...</p>
          <p className="text-sm opacity-70">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bgPrimary)] text-[var(--color-text)]">
        <div className="text-center">
          <p className="text-[var(--color-error)] mb-2">Failed to load world</p>
          <p className="text-sm opacity-70">{error}</p>
          <button
            onClick={loadWorldState}
            className="mt-4 px-4 py-2 bg-[var(--color-primary)] rounded hover:opacity-80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state if no city yet
  if (!city) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bgPrimary)] text-[var(--color-text)]">
        <div className="text-center">
          <p className="mb-2">{isLoading ? 'Loading world...' : 'No world data'}</p>
          {!isLoading && (
            <button
              onClick={loadWorldState}
              className="px-4 py-2 bg-[var(--color-primary)] rounded hover:opacity-80"
            >
              Load World
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* PixiJS Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading world...</div>
        </div>
      )}

      {/* World Controls */}
      <WorldControls />

      {/* NPC Popover */}
      {hoveredNPCId && popoverPosition && (
        <NPCPopover
          npcId={hoveredNPCId}
          position={popoverPosition}
        />
      )}

      {/* Building Tooltip */}
      {hoveredBuildingId && !hoveredNPCId && (
        <BuildingTooltip buildingId={hoveredBuildingId} />
      )}
    </div>
  );
}

// ============================================================================
// Building Tooltip
// ============================================================================

function BuildingTooltip({ buildingId }: { buildingId: string }) {
  const { getBuilding, getLandmarkByBuildingId } = useWorldStore();
  const building = getBuilding(buildingId);
  const landmark = getLandmarkByBuildingId(buildingId);

  if (!building) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        {landmark?.iconEmoji && <span>{landmark.iconEmoji}</span>}
        <span className="font-medium">{building.name}</span>
      </div>
      <div className="text-xs text-[var(--color-textMuted)]">
        {building.type.charAt(0).toUpperCase() + building.type.slice(1)}
        {landmark && <span className="ml-2 text-[var(--color-primary)]">Landmark</span>}
      </div>
    </div>
  );
}
