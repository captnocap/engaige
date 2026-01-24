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
  type SceneContext,
  type CameraController,
  type RaycasterController,
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
      sceneContext.camera,
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

  // Render ground and districts
  useEffect(() => {
    if (!sceneContextRef.current || !city) return;

    const { scene } = sceneContextRef.current;

    console.log('[WorldViewer] Rendering ground and districts...');

    // Clear existing district meshes
    districtMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    districtMeshesRef.current = [];

    // Create ground plane
    const groundPlane = createGroundPlane(
      city.gridSize.width,
      city.gridSize.height,
      GRID_SCALE
    );
    scene.add(groundPlane);
    districtMeshesRef.current.push(groundPlane);

    // Create district ground tiles
    city.districts.forEach((district) => {
      const points = district.bounds.points;
      if (points.length < 3) return;

      // Create shape from district bounds
      // Note: Shape Y becomes -Z after rotation, so we negate Y to match building positions
      const shape = new THREE.Shape();
      shape.moveTo(points[0][0] * GRID_SCALE, -points[0][1] * GRID_SCALE);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i][0] * GRID_SCALE, -points[i][1] * GRID_SCALE);
      }
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      // Rotate to lie flat (XZ plane) - after this, shape (x, -y) becomes world (x, 0, y)
      geometry.rotateX(-Math.PI / 2);

      const color = parseInt(district.color.replace('#', '0x'), 16);
      const darkenedColor = new THREE.Color(color).multiplyScalar(0.4);

      const material = new THREE.MeshLambertMaterial({
        color: darkenedColor,
        transparent: true,
        opacity: 0.6,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.01; // Slightly above ground
      mesh.receiveShadow = true;

      mesh.userData = {
        type: 'district',
        id: district.id,
        name: district.name,
        districtType: district.type,
      };

      scene.add(mesh);
      districtMeshesRef.current.push(mesh);
    });

    console.log('[WorldViewer] Ground and districts rendered');
  }, [city]);

  // Render buildings
  useEffect(() => {
    if (!sceneContextRef.current || !city) return;

    const { scene } = sceneContextRef.current;

    console.log('[WorldViewer] Rendering buildings:', city.buildings.length);

    // Clear existing buildings
    buildingMeshesRef.current.forEach((mesh, id) => {
      scene.remove(mesh);
      (mesh.material as THREE.Material).dispose();
    });
    buildingMeshesRef.current.clear();

    // Create buildings in batches
    const batchSize = 100;
    let index = 0;

    const renderBatch = () => {
      const batch = city.buildings.slice(index, index + batchSize);

      batch.forEach((building) => {
        const mesh = createBuildingMesh(building, GRID_SCALE);
        scene.add(mesh);
        buildingMeshesRef.current.set(building.id, mesh);
      });

      index += batchSize;
      if (index < city.buildings.length) {
        requestAnimationFrame(renderBatch);
      } else {
        console.log('[WorldViewer] Buildings rendered:', buildingMeshesRef.current.size);
      }
    };

    renderBatch();
  }, [city?.buildings]);

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

  // Center camera on city when loaded
  useEffect(() => {
    if (!cameraControllerRef.current || !city) return;

    const centerX = city.gridSize.width / 2;
    const centerY = city.gridSize.height / 2;

    cameraControllerRef.current.setTarget(
      new THREE.Vector3(centerX * GRID_SCALE, 0, centerY * GRID_SCALE)
    );
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
