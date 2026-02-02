/**
 * World Viewer
 *
 * Pure Three.js city viewer following SimCity tutorial patterns.
 * Shows the city map with districts, 3D buildings, and NPC markers.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useWorldStore } from '../../stores/worldStore.js';
import { useWSStore } from '../../stores/wsStore.js';
import WorldControls from './WorldControls.js';
import AsciiOverlay from './AsciiOverlay.js';
import {
  createScene,
  createOrbitalCamera,
  createBuildingMesh,
  createNPCMarker,
  createGroundPlane,
  createPlayerHomeMarker,
  updateNPCMarkerPosition,
  highlightNPCMarker,
  createRaycaster,
  highlightObject,
  BUILDING_COLORS,
  DISTRICT_COLORS,
  // Terrain system
  generateTerrain,
  createTerrainMeshes,
  createAllTrees,
  createStreetLights,
  updateStreetLights,
  animateWater,
  placeBuildingModels,
  // Model loading
  modelLoader,
  type SceneContext,
  type CameraController,
  type RaycasterController,
  type StreetLight,
  type TerrainData,
} from './lib/index.js';
import type { Building, District, AINPCLocation, BackgroundNPC } from '../../stores/worldStore.js';

// ============================================================================
// Constants
// ============================================================================

const GRID_SCALE = 1; // 1 grid unit = 1 Three.js unit

// ============================================================================
// Component
// ============================================================================

export default function WorldViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneContextRef = useRef<SceneContext | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const raycasterRef = useRef<RaycasterController | null>(null);

  // Mesh tracking
  const buildingMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const npcMarkersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const districtMeshesRef = useRef<THREE.Mesh[]>([]);
  const playerHomeMarkerRef = useRef<THREE.Mesh | null>(null);

  // Terrain tracking
  const terrainDataRef = useRef<TerrainData | null>(null);
  const terrainGroupRef = useRef<THREE.Group | null>(null);
  const treesGroupRef = useRef<THREE.Group | null>(null);
  const waterMeshesRef = useRef<THREE.Mesh[]>([]);
  const streetLightsRef = useRef<StreetLight[]>([]);

  // WebSocket connection state
  const connected = useWSStore((state) => state.connected);

  // Store state
  const {
    city,
    gameTime,
    aiNPCs,
    backgroundNPCs,
    playerHome,
    hoveredNPCId,
    hoveredBuildingId,
    isLoading,
    error,
    loadWorldState,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    requestBackgroundNPCs,
    setHoveredNPC,
    setHoveredBuilding,
    setSelectedNPC,
  } = useWorldStore();

  const [asciiMode, setAsciiMode] = useState(false);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Track building models placed in scene
  const buildingModelsRef = useRef<THREE.Group[]>([]);

  // ============================================================================
  // Model Loading
  // ============================================================================

  useEffect(() => {
    console.log('[WorldViewer] Loading 3D models...');
    modelLoader.loadAll()
      .then(() => {
        console.log('[WorldViewer] All models loaded');
        setModelsLoaded(true);
      })
      .catch((err) => {
        console.error('[WorldViewer] Failed to load models:', err);
        // Continue without models - will use procedural fallback
        setModelsLoaded(true);
      });

    return () => {
      // Don't dispose models on unmount - they can be reused
    };
  }, []);

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
    loadWorldState()
      .then(() => {
        console.log('[WorldViewer] World state loaded');
      })
      .catch((err) => {
        console.error('[WorldViewer] Failed to load world state:', err);
      });
    subscribeToUpdates();

    return () => {
      unsubscribeFromUpdates();
    };
  }, [connected]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('[WorldViewer] Initializing Three.js scene...');

    // Create scene
    const sceneContext = createScene(containerRef.current, {
      backgroundColor: 0x0a0a12,
      enableShadows: true,
    });
    sceneContextRef.current = sceneContext;

    // Create orbital camera
    const cameraController = createOrbitalCamera(
      containerRef.current,
      sceneContext.perspectiveCamera,
      {
        initialRadius: 50,
        initialAzimuth: 45,
        initialElevation: 55,
        minRadius: 10,
        maxRadius: 200,
      }
    );
    cameraControllerRef.current = cameraController;

    // Create raycaster
    const raycaster = createRaycaster(
      sceneContext.camera,
      sceneContext.scene,
      sceneContext.getCanvas()
    );
    raycasterRef.current = raycaster;

    // Handle selection
    raycaster.onSelect((obj, userData) => {
      // Clear previous selection highlight
      if (selectedObject) {
        highlightObject(selectedObject, false);
      }

      setSelectedObject(obj);

      if (obj && userData) {
        highlightObject(obj, true, 0x606060);

        if (userData.type === 'building') {
          setHoveredBuilding(userData.id);
        } else if (userData.type === 'npc') {
          setSelectedNPC(userData.id);
        }
      } else {
        setHoveredBuilding(null);
        setSelectedNPC(null);
      }
    });

    // Handle hover
    raycaster.onHover((obj, userData) => {
      if (userData?.type === 'building') {
        setHoveredBuilding(userData.id);
      } else if (userData?.type === 'npc') {
        setHoveredNPC(userData.id);
      } else {
        setHoveredBuilding(null);
        setHoveredNPC(null);
      }
    });

    // Start render loop
    sceneContext.start();

    console.log('[WorldViewer] Three.js scene initialized');

    return () => {
      console.log('[WorldViewer] Cleaning up Three.js scene...');
      raycaster.dispose();
      cameraController.dispose();
      sceneContext.dispose();
      sceneContextRef.current = null;
      cameraControllerRef.current = null;
      raycasterRef.current = null;
    };
  }, []);

  // ============================================================================
  // Render City Data
  // ============================================================================

  // Render procedural terrain
  useEffect(() => {
    if (!sceneContextRef.current || !city) return;

    const { scene } = sceneContextRef.current;

    console.log('[WorldViewer] Generating procedural terrain...');

    // Clear existing terrain
    if (terrainGroupRef.current) {
      scene.remove(terrainGroupRef.current);
      terrainGroupRef.current = null;
    }
    if (treesGroupRef.current) {
      scene.remove(treesGroupRef.current);
      treesGroupRef.current = null;
    }
    streetLightsRef.current.forEach((light) => {
      scene.remove(light.group);
    });
    streetLightsRef.current = [];
    waterMeshesRef.current = [];

    // Clear old district meshes (legacy)
    districtMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    districtMeshesRef.current = [];

    // Generate terrain based on city grid size
    const gridSize = Math.max(city.gridSize.width, city.gridSize.height);
    const tileSize = GRID_SCALE * 2; // Each terrain tile is 2 units

    const terrain = generateTerrain({
      gridSize: Math.ceil(gridSize / 2) + 4, // Padding for edges
      tileSize: tileSize,
      seed: 12345, // Consistent seed for reproducibility
    });
    terrainDataRef.current = terrain;

    // Create terrain meshes (skip procedural buildings if models are loaded)
    const { groundGroup, waterMeshes } = createTerrainMeshes(terrain, tileSize, {
      skipBuildings: modelsLoaded,
    });
    scene.add(groundGroup);
    terrainGroupRef.current = groundGroup;
    waterMeshesRef.current = waterMeshes;

    // Place building models if loaded
    if (modelsLoaded) {
      // Clear any existing building models
      buildingModelsRef.current.forEach((model) => scene.remove(model));
      buildingModelsRef.current = [];

      const buildingsGroup = placeBuildingModels(terrain, tileSize);
      scene.add(buildingsGroup);
      buildingModelsRef.current = [buildingsGroup];
    }

    // Create trees
    const trees = createAllTrees(terrain, tileSize);
    scene.add(trees);
    treesGroupRef.current = trees;

    // Street lights disabled for now - were causing particle artifacts
    // const lights = createStreetLights(terrain, tileSize);
    // lights.forEach((light) => scene.add(light.group));
    // streetLightsRef.current = lights;

    console.log('[WorldViewer] Terrain generated:', {
      tiles: terrain.tiles.length * terrain.tiles.length,
      roads: terrain.roadTiles.length,
      water: terrain.waterTiles.length,
      usingModels: modelsLoaded,
    });
  }, [city, modelsLoaded]);

  // Animate water and update street lights based on time
  useEffect(() => {
    if (!sceneContextRef.current) return;

    sceneContextRef.current.setOnRender((_delta, elapsed) => {
      // Animate water tiles
      if (waterMeshesRef.current.length > 0) {
        animateWater(waterMeshesRef.current, elapsed);
      }

      // Update street lights based on game time (simple day/night)
      // TODO: Hook into actual gameTime from worldStore
      if (streetLightsRef.current.length > 0 && gameTime) {
        const hour = gameTime.hour;
        const isNight = hour < 6 || hour >= 19;
        updateStreetLights(streetLightsRef.current, isNight);
      }
    });

    return () => {
      if (sceneContextRef.current) {
        sceneContextRef.current.setOnRender(null);
      }
    };
  }, [gameTime]);

  // NOTE: Old building rendering disabled - terrain system generates its own buildings
  // The terrain system creates procedural buildings that match the isometric style.
  // If you need to show specific named buildings from worldStore, we'll need to
  // place them at terrain grid positions instead.
  /*
  useEffect(() => {
    if (!sceneContextRef.current || !city) return;
    // ... old building code disabled
  }, [city?.buildings]);
  */

  // ============================================================================
  // NPC Markers
  // ============================================================================

  // Render AI NPCs
  useEffect(() => {
    if (!sceneContextRef.current || !city) return;

    const { scene } = sceneContextRef.current;

    // Update or create AI NPC markers
    aiNPCs.forEach((npc) => {
      let marker = npcMarkersRef.current.get(npc.npcId);

      if (!marker) {
        // Create new marker
        marker = createNPCMarker(npc, true, GRID_SCALE);
        npcMarkersRef.current.set(npc.npcId, marker);
        scene.add(marker);
      } else {
        // Update position
        updateNPCMarkerPosition(marker, npc.position, GRID_SCALE);
      }
    });
  }, [aiNPCs, city]);

  // Render background NPCs
  useEffect(() => {
    if (!sceneContextRef.current || !city || backgroundNPCs.length === 0) return;

    const { scene } = sceneContextRef.current;

    // Clear old background NPC markers
    npcMarkersRef.current.forEach((marker, id) => {
      if (!id.startsWith('ai-') && !aiNPCs.find((n) => n.npcId === id)) {
        scene.remove(marker);
        (marker.material as THREE.Material).dispose();
        npcMarkersRef.current.delete(id);
      }
    });

    // Add new background NPC markers (limit visible)
    const maxVisible = 200;
    const visibleNPCs = backgroundNPCs.slice(0, maxVisible);

    visibleNPCs.forEach((npc) => {
      if (!npcMarkersRef.current.has(npc.id)) {
        const marker = createNPCMarker(npc, false, GRID_SCALE);
        npcMarkersRef.current.set(npc.id, marker);
        scene.add(marker);
      }
    });
  }, [backgroundNPCs, city, aiNPCs]);

  // Request background NPCs periodically
  useEffect(() => {
    if (!city) return;

    const bounds = {
      minX: 0,
      maxX: city.gridSize.width,
      minY: 0,
      maxY: city.gridSize.height,
    };
    requestBackgroundNPCs(bounds);

    const interval = setInterval(() => {
      requestBackgroundNPCs(bounds);
    }, 10000);

    return () => clearInterval(interval);
  }, [city, requestBackgroundNPCs]);

  // ============================================================================
  // Player Home Marker
  // ============================================================================

  useEffect(() => {
    if (!sceneContextRef.current || !playerHome) return;

    const { scene } = sceneContextRef.current;

    // Remove old marker
    if (playerHomeMarkerRef.current) {
      scene.remove(playerHomeMarkerRef.current);
      (playerHomeMarkerRef.current.material as THREE.Material).dispose();
    }

    // Create new marker
    const marker = createPlayerHomeMarker(playerHome.position, GRID_SCALE);
    scene.add(marker);
    playerHomeMarkerRef.current = marker;
  }, [playerHome]);

  // ============================================================================
  // Camera Controls
  // ============================================================================

  // Center camera on terrain (which is centered at 0,0)
  useEffect(() => {
    if (!cameraControllerRef.current || !city) return;

    // Terrain is centered at origin, so camera should look at 0,0,0
    cameraControllerRef.current.setTarget(new THREE.Vector3(0, 0, 0));
  }, [city]);

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A toggles ASCII mode
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setAsciiMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================================
  // Render States
  // ============================================================================

  const showConnecting = !connected;
  const showError = connected && error;
  const showLoading = connected && !error && !city;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Three.js Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#0a0a12' }}
      />

      {/* Connecting Overlay */}
      {showConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bgPrimary)] text-[var(--color-text)]">
          <div className="text-center">
            <p className="text-lg mb-2">Connecting to server...</p>
            <p className="text-sm opacity-70">Please wait</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {showError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bgPrimary)] text-[var(--color-text)]">
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
      )}

      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bgPrimary)] text-[var(--color-text)]">
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
      )}

      {/* ASCII Overlay */}
      <AsciiOverlay
        enabled={asciiMode}
        canvasRef={{ current: sceneContextRef.current?.getCanvas() || null }}
      />

      {/* World Controls - only show when data loaded */}
      {city && (
        <WorldControls
          asciiMode={asciiMode}
          onToggleAscii={() => setAsciiMode(!asciiMode)}
        />
      )}

      {/* HUD Overlay */}
      {city && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg border border-white/10 pointer-events-none select-none min-w-[180px]">
          <h1 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-3">
            {city.name || 'Neo-Pixel City'}
          </h1>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Population:</span>
              <span className="font-bold text-yellow-400">{aiNPCs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Buildings:</span>
              <span className="font-bold text-yellow-400">{city.buildings.length}</span>
            </div>
            {gameTime && (
              <div className="flex justify-between">
                <span className="text-white/70">Time:</span>
                <span className="font-bold text-yellow-400">
                  {gameTime.hour % 12 || 12}:{String(gameTime.minute).padStart(2, '0')} {gameTime.hour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/50">
            <p>Left Drag: Rotate</p>
            <p>Scroll: Zoom</p>
            <p>Click: Inspect</p>
          </div>
        </div>
      )}

      {/* Selection Info Panel */}
      {selectedObject && selectedObject.userData && (
        <div className="absolute top-4 right-4 w-72 bg-black/90 border border-white/20 rounded-lg p-4 text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">
              {selectedObject.userData.name || selectedObject.userData.type}
            </h3>
            <button
              onClick={() => setSelectedObject(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          {selectedObject.userData.type === 'building' && (
            <>
              <p className="text-white/70 text-sm mb-1">
                Type: {selectedObject.userData.buildingType}
              </p>
              <p className="text-white/70 text-sm mb-1">
                Capacity: {selectedObject.userData.capacity}
              </p>
              {selectedObject.userData.isResidential && (
                <p className="text-green-400 text-sm">Residential</p>
              )}
              {selectedObject.userData.isWorkplace && (
                <p className="text-blue-400 text-sm">Workplace</p>
              )}
            </>
          )}

          {selectedObject.userData.type === 'npc' && (
            <>
              <p className="text-white/70 text-sm mb-1">
                {selectedObject.userData.isAI ? 'AI Character' : 'Background NPC'}
              </p>
              {selectedObject.userData.activity && (
                <p className="text-white/70 text-sm">
                  Activity: {selectedObject.userData.activity}
                </p>
              )}
              {selectedObject.userData.isAI && (
                <button className="mt-3 w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-sm">
                  Send Message
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
