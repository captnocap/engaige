/**
 * World Viewer
 *
 * SimCity-style 3D city viewer using maptalks + Three.js.
 * Shows the city map with districts, 3D buildings, and NPC markers.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as maptalks from 'maptalks';
import { ThreeLayer } from 'maptalks.three';
import * as THREE from 'three';
import { useWorldStore } from '../../stores/worldStore.js';
import { useWSStore } from '../../stores/wsStore.js';
import WorldControls from './WorldControls.js';
import NPCPopover from './NPCPopover.js';
import AsciiOverlay from './AsciiOverlay.js';
import 'maptalks/dist/maptalks.css';

// ============================================================================
// Constants & Configuration
// ============================================================================

// City center in fake lat/lng (arbitrary location)
const CITY_CENTER: [number, number] = [-122.6784, 45.5152]; // Portland-ish coords

// Scale: our grid is 200x150, we want it to cover roughly 2km x 1.5km
// At Portland's latitude, 1 degree lng ≈ 85km, 1 degree lat ≈ 111km
// So for 2km: lng_delta = 2/85 ≈ 0.024, lat_delta = 1.5/111 ≈ 0.014
const GRID_TO_LNG_SCALE = 0.024 / 200; // ~0.00012 per grid unit
const GRID_TO_LAT_SCALE = 0.014 / 150; // ~0.00009 per grid unit

// Building colors by type
const BUILDING_COLORS: Record<string, number> = {
  apartment: 0x8B7355,
  house: 0xA0522D,
  office: 0x5B8FA8,
  cafe: 0xDEB887,
  restaurant: 0xCD853F,
  bar: 0x8B0000,
  club: 0x4B0082,
  gym: 0x3CB371,
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
  factory: 0x505050,
};

// District colors (for ground polygons)
const DISTRICT_COLORS: Record<string, string> = {
  downtown: '#4A90A4',
  arts: '#9B59B6',
  university: '#27AE60',
  nightlife: '#E74C3C',
  waterfront: '#3498DB',
  residential: '#7F8C8D',
  suburbs: '#95A5A6',
  shopping: '#F39C12',
  industrial: '#34495E',
};

// ============================================================================
// Coordinate Utilities
// ============================================================================

function gridToLatLng(gridX: number, gridY: number): [number, number] {
  // Convert grid coordinates to lat/lng relative to city center
  const lng = CITY_CENTER[0] + (gridX - 100) * GRID_TO_LNG_SCALE;
  const lat = CITY_CENTER[1] + (gridY - 75) * GRID_TO_LAT_SCALE;
  return [lng, lat];
}

function gridPolygonToLatLng(points: Array<[number, number]>): Array<[number, number]> {
  return points.map(([x, y]) => gridToLatLng(x, y));
}

// ============================================================================
// Component
// ============================================================================

export default function WorldViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptalks.Map | null>(null);
  const threeLayerRef = useRef<ThreeLayer | null>(null);
  const npcMarkersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const buildingMeshesRef = useRef<THREE.Mesh[]>([]);

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

  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [asciiMode, setAsciiMode] = useState(false);

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
      console.log('[WorldViewer] World state loaded');
    }).catch(err => {
      console.error('[WorldViewer] Failed to load world state:', err);
    });
    subscribeToUpdates();

    return () => {
      unsubscribeFromUpdates();
    };
  }, [connected]);

  // Initialize maptalks
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    console.log('[WorldViewer] Initializing maptalks...');

    const map = new maptalks.Map(containerRef.current, {
      center: CITY_CENTER,
      zoom: 15,
      pitch: 55,
      bearing: -30,
      centerCross: false,
      doubleClickZoom: false,
      baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }),
    });

    mapRef.current = map;

    // Create Three.js layer for 3D buildings
    const threeLayer = new ThreeLayer('three', {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
    });

    threeLayer.prepareToDraw = function(gl: WebGLRenderingContext, scene: THREE.Scene, camera: THREE.Camera) {
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      // Add directional light (sun)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
    };

    threeLayer.addTo(map);
    threeLayerRef.current = threeLayer;

    console.log('[WorldViewer] Maptalks initialized');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      threeLayerRef.current = null;
    };
  }, []);

  // ============================================================================
  // Render City Data
  // ============================================================================

  // Add districts as ground polygons
  useEffect(() => {
    if (!mapRef.current || !city) return;

    console.log('[WorldViewer] Rendering districts:', city.districts.length);

    // Remove existing district layer
    const existingLayer = mapRef.current.getLayer('districts');
    if (existingLayer) {
      mapRef.current.removeLayer(existingLayer);
    }

    // Create district polygons
    const districtPolygons = city.districts.map(district => {
      const coords = gridPolygonToLatLng(district.bounds.points);
      const color = DISTRICT_COLORS[district.type] || '#666666';

      return new maptalks.Polygon([coords], {
        symbol: {
          polygonFill: color,
          polygonOpacity: 0.3,
          lineColor: color,
          lineWidth: 2,
          lineOpacity: 0.6,
        },
        properties: {
          id: district.id,
          name: district.name,
          type: district.type,
        },
      });
    });

    const districtLayer = new maptalks.VectorLayer('districts', districtPolygons, {
      enableAltitude: true,
    });
    districtLayer.addTo(mapRef.current);

  }, [city?.districts]);

  // Add 3D buildings
  useEffect(() => {
    if (!threeLayerRef.current || !city) return;

    console.log('[WorldViewer] Rendering 3D buildings:', city.buildings.length);

    const threeLayer = threeLayerRef.current;

    // Clear existing buildings
    buildingMeshesRef.current.forEach(mesh => {
      threeLayer.removeMesh(mesh);
    });
    buildingMeshesRef.current = [];

    // Create buildings in batches to avoid blocking
    const batchSize = 100;
    let index = 0;

    // Get scale factor for converting meters to scene units
    const scale = threeLayer.distanceToVector3(1, 1).x; // 1 meter in scene units

    const renderBatch = () => {
      const batch = city.buildings.slice(index, index + batchSize);

      batch.forEach(building => {
        const [lng, lat] = gridToLatLng(building.position.x, building.position.y);
        const color = BUILDING_COLORS[building.type] || 0x888888;

        // Building height in meters based on type and capacity
        let heightMeters = 8 + (building.capacity || 5) * 0.8;
        if (building.type === 'office') heightMeters *= 2.5;
        if (building.type === 'apartment') heightMeters *= 1.8;
        if (building.type === 'house') heightMeters *= 0.5;
        if (building.type === 'park' || building.type === 'plaza') heightMeters = 1;

        // Building footprint in meters (small buildings ~10-30m)
        const widthMeters = (building.size?.width || 1) * 12;
        const depthMeters = (building.size?.height || 1) * 12;

        // Convert to scene units
        const width = widthMeters * scale;
        const depth = depthMeters * scale;
        const height = heightMeters * scale;

        // Create building geometry - BoxGeometry(width, depth, height)
        const geometry = new THREE.BoxGeometry(width, depth, height);

        // Shift geometry so bottom is at origin (building sits on ground)
        geometry.translate(0, 0, height / 2);

        const material = new THREE.MeshLambertMaterial({
          color,
          transparent: false,
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Position at ground level (altitude = 0)
        const position = threeLayer.coordinateToVector3([lng, lat], 0);
        mesh.position.copy(position);

        // Store building data for interactions
        (mesh as any).userData = {
          buildingId: building.id,
          name: building.name,
          type: building.type,
        };

        threeLayer.addMesh(mesh);
        buildingMeshesRef.current.push(mesh);
      });

      index += batchSize;
      if (index < city.buildings.length) {
        requestAnimationFrame(renderBatch);
      } else {
        threeLayer.renderScene();
        console.log('[WorldViewer] Buildings rendered:', buildingMeshesRef.current.length);
      }
    };

    renderBatch();

  }, [city?.buildings]);

  // ============================================================================
  // NPC Markers
  // ============================================================================

  // Render AI NPCs as 3D markers
  useEffect(() => {
    if (!threeLayerRef.current || !city) return;

    const threeLayer = threeLayerRef.current;
    const scale = threeLayer.distanceToVector3(1, 1).x;

    // Update or create AI NPC markers
    aiNPCs.forEach(npc => {
      const [lng, lat] = gridToLatLng(npc.position.x, npc.position.y);
      let marker = npcMarkersRef.current.get(npc.npcId);

      if (!marker) {
        // Create new marker - blue sphere for AI NPCs (3m radius)
        const geometry = new THREE.SphereGeometry(3 * scale, 16, 16);
        const material = new THREE.MeshLambertMaterial({
          color: 0x3498db,
          emissive: 0x1a4a6e,
        });
        marker = new THREE.Mesh(geometry, material);
        (marker as any).userData = { npcId: npc.npcId, isAI: true };

        npcMarkersRef.current.set(npc.npcId, marker);
        threeLayer.addMesh(marker);
      }

      // Update position - place at street level (2m height)
      const position = threeLayer.coordinateToVector3([lng, lat], 2 * scale);
      marker.position.copy(position);
    });

    threeLayer.renderScene();

  }, [aiNPCs, city]);

  // Render background NPCs as smaller markers
  useEffect(() => {
    if (!threeLayerRef.current || !city || backgroundNPCs.length === 0) return;

    const threeLayer = threeLayerRef.current;
    const scale = threeLayer.distanceToVector3(1, 1).x;

    // Clear old background NPC markers (they regenerate each time)
    npcMarkersRef.current.forEach((marker, id) => {
      if (id.startsWith('bg-')) {
        threeLayer.removeMesh(marker);
        npcMarkersRef.current.delete(id);
      }
    });

    // Add new background NPC markers (limit to visible ones)
    const maxVisible = 200;
    const visibleNPCs = backgroundNPCs.slice(0, maxVisible);

    visibleNPCs.forEach(npc => {
      const [lng, lat] = gridToLatLng(npc.position.x, npc.position.y);

      // Smaller gray spheres (1.5m radius)
      const geometry = new THREE.SphereGeometry(1.5 * scale, 8, 8);
      const material = new THREE.MeshLambertMaterial({
        color: 0xaaaaaa,
        emissive: 0x333333,
      });
      const marker = new THREE.Mesh(geometry, material);
      (marker as any).userData = { npcId: npc.id, isAI: false, name: npc.name };

      // Place at street level (1.5m height)
      const position = threeLayer.coordinateToVector3([lng, lat], 1.5 * scale);
      marker.position.copy(position);

      npcMarkersRef.current.set(npc.id, marker);
      threeLayer.addMesh(marker);
    });

    threeLayer.renderScene();

  }, [backgroundNPCs, city]);

  // Request background NPCs periodically
  useEffect(() => {
    if (!city) return;

    // Request background NPCs for the entire city initially
    const bounds = {
      minX: 0,
      maxX: city.gridSize.width,
      minY: 0,
      maxY: city.gridSize.height,
    };
    requestBackgroundNPCs(bounds);

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      requestBackgroundNPCs(bounds);
    }, 10000);

    return () => clearInterval(interval);
  }, [city, requestBackgroundNPCs]);

  // ============================================================================
  // Player Home Marker
  // ============================================================================

  useEffect(() => {
    if (!threeLayerRef.current || !playerHome) return;

    const threeLayer = threeLayerRef.current;
    const scale = threeLayer.distanceToVector3(1, 1).x;
    const [lng, lat] = gridToLatLng(playerHome.position.x, playerHome.position.y);

    // Create player home marker - green beacon pointing up (5m radius, 15m tall)
    const geometry = new THREE.ConeGeometry(5 * scale, 15 * scale, 8);
    // Rotate geometry so cone points up (along Z axis in maptalks)
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, 25 * scale); // Lift above buildings

    const material = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      emissive: 0x00aa00,
    });
    const marker = new THREE.Mesh(geometry, material);

    const position = threeLayer.coordinateToVector3([lng, lat], 0);
    marker.position.copy(position);

    threeLayer.addMesh(marker);
    threeLayer.renderScene();

  }, [playerHome]);

  // ============================================================================
  // Landmark highlights
  // ============================================================================

  useEffect(() => {
    if (!mapRef.current || !city?.landmarks) return;

    // Remove existing landmark layer
    const existingLayer = mapRef.current.getLayer('landmarks');
    if (existingLayer) {
      mapRef.current.removeLayer(existingLayer);
    }

    // Create landmark markers
    const landmarkMarkers = city.landmarks.map(landmark => {
      const building = city.buildings.find(b => b.id === landmark.buildingId);
      if (!building) return null;

      const [lng, lat] = gridToLatLng(building.position.x, building.position.y);

      return new maptalks.Marker([lng, lat], {
        symbol: {
          textName: landmark.iconEmoji || '⭐',
          textSize: 24,
          textDy: -40,
        },
        properties: {
          id: landmark.id,
          name: landmark.name,
          description: landmark.description,
        },
      });
    }).filter(Boolean);

    const landmarkLayer = new maptalks.VectorLayer('landmarks', landmarkMarkers as maptalks.Marker[], {
      enableAltitude: true,
    });
    landmarkLayer.addTo(mapRef.current);

  }, [city?.landmarks, city?.buildings]);

  // ============================================================================
  // Render States
  // ============================================================================

  const showConnecting = !connected;
  const showError = connected && error;
  const showLoading = connected && !error && !city;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Maptalks Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#1a1a2e' }}
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
      <AsciiOverlay enabled={asciiMode} canvasRef={{ current: null }} />

      {/* World Controls - only show when data loaded */}
      {city && (
        <WorldControls
          asciiMode={asciiMode}
          onToggleAscii={() => setAsciiMode(!asciiMode)}
        />
      )}

      {/* NPC Popover */}
      {hoveredNPCId && popoverPosition && (
        <NPCPopover
          npcId={hoveredNPCId}
          position={popoverPosition}
        />
      )}
    </div>
  );
}
