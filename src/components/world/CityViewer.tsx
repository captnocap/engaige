/**
 * CityViewer
 *
 * 3D city viewer using the ported city rendering system.
 * Shows buildings, roads, ambient traffic, and NPC markers.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useWorldStore } from '../../stores/worldStore.js';
import { useWSStore } from '../../stores/wsStore.js';
import WorldControls from './WorldControls.js';
import {
  createScene,
  createOrbitalCamera,
  createRaycaster,
  highlightObject,
  type SceneContext,
  type CameraController,
  type RaycasterController,
} from './lib/index.js';
import {
  City,
  createCityAssetManager,
  getCityAssetManager,
  LANDMARKS,
  type BuildingPlacement,
  type LandmarkConfig,
} from './lib/city/index.js';

// ============================================================================
// Constants
// ============================================================================

const CITY_SIZE = 50; // 50x50 tile grid

// ============================================================================
// City Generator (simple procedural generation)
// ============================================================================

/**
 * Generate a simple procedural city layout
 */
function generateCityPlacements(size: number): BuildingPlacement[] {
  const placements: BuildingPlacement[] = [];
  const random = mulberry32(12345); // Seeded random for consistency

  // First, place landmarks at their fixed positions
  for (const landmark of LANDMARKS) {
    placements.push({
      x: landmark.position.x,
      y: landmark.position.y,
      type: landmark.model,
      rotation: landmark.rotation ?? 0,
      landmarkId: landmark.id,
      fillerSiteUrl: landmark.fillerSiteUrl,
    });
  }

  // Create a simple road network (main roads in a grid pattern)
  const mainRoadSpacing = 10;

  // Horizontal main roads
  for (let y = mainRoadSpacing; y < size; y += mainRoadSpacing) {
    for (let x = 0; x < size; x++) {
      // Skip if landmark at this position
      if (LANDMARKS.some((l) => l.position.x === x && l.position.y === y)) continue;

      const isIntersection = x % mainRoadSpacing === 0;
      if (isIntersection) {
        placements.push({ x, y, type: 'road-four-way', rotation: 0 });
      } else {
        placements.push({ x, y, type: 'road-straight', rotation: 1 });
      }
    }
  }

  // Vertical main roads
  for (let x = mainRoadSpacing; x < size; x += mainRoadSpacing) {
    for (let y = 0; y < size; y++) {
      // Skip if landmark or already placed
      if (LANDMARKS.some((l) => l.position.x === x && l.position.y === y)) continue;
      if (y % mainRoadSpacing === 0) continue; // Already placed as intersection

      placements.push({ x, y, type: 'road-straight', rotation: 0 });
    }
  }

  // Fill zones with random buildings
  const zoneBuildings = [
    'residential-A1', 'residential-B1', 'residential-C1',
    'residential-A2', 'residential-B2', 'residential-C2',
    'residential-D1', 'residential-E1', 'residential-F1',
    'commercial-A1', 'commercial-B1', 'commercial-C1',
    'commercial-D1', 'commercial-E1', 'commercial-F1',
    'industrial-A1', 'industrial-B1', 'industrial-C1',
  ];

  const placedSet = new Set<string>();

  // Mark all placed positions
  for (const p of placements) {
    placedSet.add(`${p.x},${p.y}`);
  }

  // Fill remaining spaces
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      if (placedSet.has(`${x},${y}`)) continue;

      // Leave some empty as parks/grass
      if (random() < 0.3) continue;

      const buildingType = zoneBuildings[Math.floor(random() * zoneBuildings.length)];
      const rotation = Math.floor(random() * 4);

      placements.push({
        x,
        y,
        type: buildingType,
        rotation,
      });
    }
  }

  return placements;
}

/**
 * Seeded random number generator
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function CityViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneContextRef = useRef<SceneContext | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const raycasterRef = useRef<RaycasterController | null>(null);
  const cityRef = useRef<City | null>(null);

  // WebSocket connection state
  const connected = useWSStore((state) => state.connected);

  // Store state
  const {
    city,
    gameTime,
    aiNPCs,
    hoveredBuildingId,
    loadWorldState,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    setHoveredNPC,
    setHoveredBuilding,
    setSelectedNPC,
  } = useWorldStore();

  // Local state
  const [loadingState, setLoadingState] = useState<{
    phase: string;
    percent: number;
  } | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [cityLoaded, setCityLoaded] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<{
    building: any;
    landmark?: LandmarkConfig;
  } | null>(null);

  // ============================================================================
  // Asset Loading
  // ============================================================================

  useEffect(() => {
    console.log('[CityViewer] Loading city assets...');
    setLoadingState({ phase: 'Loading models...', percent: 0 });

    const assetManager = createCityAssetManager(
      () => {
        console.log('[CityViewer] All assets loaded');
        setAssetsLoaded(true);
        setLoadingState(null);
      },
      (loaded, total) => {
        setLoadingState({
          phase: 'Loading models...',
          percent: Math.round((loaded / total) * 100),
        });
      }
    );

    assetManager.loadAllModels();

    return () => {
      // Don't dispose on unmount - assets can be reused
    };
  }, []);

  // ============================================================================
  // Scene Initialization
  // ============================================================================

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('[CityViewer] Initializing Three.js scene...');

    // Create scene
    const sceneContext = createScene(containerRef.current, {
      backgroundColor: 0x87ceeb, // Sky blue background
      enableShadows: true,
    });
    sceneContextRef.current = sceneContext;

    // Create orbital camera
    const cameraController = createOrbitalCamera(
      containerRef.current,
      sceneContext.camera,
      {
        initialRadius: 40,
        initialAzimuth: 45,
        initialElevation: 50,
        minRadius: 15,
        maxRadius: 150,
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
      if (obj && userData?.building) {
        const building = userData.building;
        const landmark = LANDMARKS.find((l) => l.id === building.landmarkId);

        setSelectedBuilding({ building, landmark });

        if (building.fillerSiteUrl) {
          // Could open browser window here
          console.log('[CityViewer] Building has filler site:', building.fillerSiteUrl);
        }
      } else {
        setSelectedBuilding(null);
      }
    });

    // Handle hover
    raycaster.onHover((obj, userData) => {
      if (userData?.building) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    });

    // Start render loop
    sceneContext.start();

    console.log('[CityViewer] Scene initialized');

    return () => {
      console.log('[CityViewer] Cleaning up scene...');
      raycaster.dispose();
      cameraController.dispose();
      sceneContext.dispose();
      sceneContextRef.current = null;
      cameraControllerRef.current = null;
      raycasterRef.current = null;
    };
  }, []);

  // ============================================================================
  // City Loading
  // ============================================================================

  useEffect(() => {
    if (!assetsLoaded || !sceneContextRef.current) return;

    const { scene } = sceneContextRef.current;

    console.log('[CityViewer] Creating city...');
    setLoadingState({ phase: 'Generating city...', percent: 0 });

    // Create city
    const newCity = new City(CITY_SIZE, 'Corn City');
    cityRef.current = newCity;
    scene.add(newCity);

    // Generate placements
    const placements = generateCityPlacements(CITY_SIZE);
    console.log('[CityViewer] Generated', placements.length, 'placements');

    // Load buildings
    newCity
      .loadBuildings(placements, (percent, phase) => {
        setLoadingState({ phase, percent });
      })
      .then(() => {
        console.log('[CityViewer] City loaded');
        setCityLoaded(true);
        setLoadingState(null);

        // Start vehicle spawning
        newCity.vehicleGraph.startSpawning();
      });

    // Set up animation loop for vehicles
    sceneContextRef.current.setOnRender(() => {
      newCity.draw();
    });

    // Center camera on city
    if (cameraControllerRef.current) {
      const center = new THREE.Vector3(CITY_SIZE / 2, 0, CITY_SIZE / 2);
      cameraControllerRef.current.setTarget(center);
    }

    return () => {
      if (cityRef.current) {
        cityRef.current.vehicleGraph.stopSpawning();
        cityRef.current.dispose();
        scene.remove(cityRef.current);
        cityRef.current = null;
      }
    };
  }, [assetsLoaded]);

  // ============================================================================
  // Connect to server
  // ============================================================================

  useEffect(() => {
    if (!connected) return;

    loadWorldState().catch((err) => {
      console.warn('[CityViewer] Failed to load world state:', err);
    });
    subscribeToUpdates();

    return () => {
      unsubscribeFromUpdates();
    };
  }, [connected]);

  // ============================================================================
  // Render
  // ============================================================================

  const showLoading = loadingState !== null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Three.js Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#87ceeb' }}
      />

      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <div className="text-center">
            <p className="text-lg mb-2">{loadingState.phase}</p>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-100"
                style={{ width: `${loadingState.percent}%` }}
              />
            </div>
            <p className="text-sm opacity-70 mt-2">{loadingState.percent}%</p>
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      {cityLoaded && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg border border-white/10 pointer-events-none select-none min-w-[180px]">
          <h1 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-3">
            Corn City
          </h1>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Buildings:</span>
              <span className="font-bold text-yellow-400">
                {cityRef.current?.getAllBuildings().length ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Roads:</span>
              <span className="font-bold text-yellow-400">
                {cityRef.current?.vehicleGraph.getRoadCount() ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Vehicles:</span>
              <span className="font-bold text-yellow-400">
                {cityRef.current?.vehicleGraph.getVehicleCount() ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Landmarks:</span>
              <span className="font-bold text-yellow-400">{LANDMARKS.length}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 text-xs text-white/50">
            <p>Left Drag: Rotate</p>
            <p>Scroll: Zoom</p>
            <p>Click: Inspect</p>
          </div>
        </div>
      )}

      {/* Selected Building Info */}
      {selectedBuilding && (
        <div className="absolute top-4 right-4 w-80 bg-black/90 border border-white/20 rounded-lg p-4 text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {selectedBuilding.landmark?.icon && (
                <span className="text-2xl">{selectedBuilding.landmark.icon}</span>
              )}
              <h3 className="font-bold text-lg">
                {selectedBuilding.landmark?.name ?? selectedBuilding.building.modelType}
              </h3>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          {selectedBuilding.landmark && (
            <>
              <p className="text-white/80 text-sm mb-3">
                {selectedBuilding.landmark.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedBuilding.landmark.keywords.slice(0, 5).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/50">
                District: {selectedBuilding.landmark.district}
              </p>
            </>
          )}

          {selectedBuilding.building.fillerSiteUrl && (
            <button
              onClick={() => {
                // TODO: Open browser window with this URL
                console.log('Open:', selectedBuilding.building.fillerSiteUrl);
              }}
              className="mt-3 w-full px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500 text-sm"
            >
              Visit Website
            </button>
          )}

          {!selectedBuilding.landmark && (
            <p className="text-white/60 text-sm">
              Position: ({selectedBuilding.building.x}, {selectedBuilding.building.y})
            </p>
          )}
        </div>
      )}

      {/* Landmark Quick Access */}
      {cityLoaded && (
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
          {LANDMARKS.slice(0, 6).map((landmark) => (
            <button
              key={landmark.id}
              onClick={() => {
                if (cameraControllerRef.current) {
                  const target = new THREE.Vector3(
                    landmark.position.x,
                    0,
                    landmark.position.y
                  );
                  cameraControllerRef.current.setTarget(target);
                }
              }}
              className="px-3 py-1.5 bg-black/70 hover:bg-black/90 rounded text-white text-xs border border-white/10 flex items-center gap-1"
            >
              {landmark.icon && <span>{landmark.icon}</span>}
              <span>{landmark.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
