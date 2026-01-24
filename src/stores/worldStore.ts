/**
 * World Store
 *
 * Zustand store for world map state including city data,
 * NPC positions, and game time.
 */

import { create } from 'zustand';
import { useWSStore } from './wsStore.js';

// ============================================================================
// Types
// ============================================================================

export interface GridPosition {
  x: number;
  y: number;
}

export interface District {
  id: string;
  name: string;
  type: string;
  description: string;
  bounds: { points: Array<[number, number]> };
  color: string;
  peakHours: number[];
  vibe: string;
}

export interface Building {
  id: string;
  name: string;
  type: string;
  districtId: string;
  position: GridPosition;
  size: { width: number; height: number };
  spriteId: string;
  capacity: number;
  isResidential: boolean;
  isWorkplace: boolean;
}

export interface Landmark {
  id: string;
  name: string;
  buildingId: string;
  description: string;
  keywords: string[];
  isNotable: boolean;
  iconEmoji?: string;
}

export interface CityData {
  name: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  tileSize: number;
  gridSize: { width: number; height: number };
  districts: District[];
  buildings: Building[];
  landmarks: Landmark[];
}

export interface GameTime {
  hour: number;
  minute: number;
  dayOfWeek: number;
  dayName: string;
  isNight: boolean;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface AINPCLocation {
  npcId: string;
  position: GridPosition;
  buildingId?: string;
  activity: string;
  activityDescription?: string;
}

export interface BackgroundNPC {
  id: string;
  name: string;
  appearanceSeed: number;
  position: GridPosition;
  state: string;
  activityLabel: string;
}

export interface PlayerHome {
  buildingId: string;
  position: GridPosition;
}

// ============================================================================
// Store State
// ============================================================================

interface WorldState {
  // Data
  city: CityData | null;
  gameTime: GameTime | null;
  timeMultiplier: number;
  isPaused: boolean;
  aiNPCs: AINPCLocation[];
  backgroundNPCs: BackgroundNPC[];
  backgroundNPCCount: number;
  playerHome: PlayerHome | null;

  // UI State
  isLoading: boolean;
  isSubscribed: boolean;
  error: string | null;

  // Camera/viewport
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selectedNPCId: string | null;
  hoveredNPCId: string | null;
  hoveredBuildingId: string | null;

  // Actions
  setCity: (city: CityData) => void;
  setGameTime: (time: GameTime) => void;
  setTimeMultiplier: (multiplier: number) => void;
  setIsPaused: (paused: boolean) => void;
  setAINPCs: (npcs: AINPCLocation[]) => void;
  setBackgroundNPCs: (npcs: BackgroundNPC[]) => void;
  setPlayerHome: (home: PlayerHome | null) => void;
  setViewport: (viewport: Partial<WorldState['viewport']>) => void;
  setSelectedNPC: (id: string | null) => void;
  setHoveredNPC: (id: string | null) => void;
  setHoveredBuilding: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSubscribed: (subscribed: boolean) => void;

  // Complex actions
  loadWorldState: () => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  requestBackgroundNPCs: (bounds: { minX: number; maxX: number; minY: number; maxY: number }) => Promise<void>;
  pauseTime: () => Promise<void>;
  resumeTime: () => Promise<void>;
  setSpeed: (multiplier: number) => Promise<void>;

  // Lookup helpers
  getBuilding: (id: string) => Building | null;
  getDistrict: (id: string) => District | null;
  getLandmark: (id: string) => Landmark | null;
  getLandmarkByBuildingId: (buildingId: string) => Landmark | null;
}

// ============================================================================
// Store
// ============================================================================

export const useWorldStore = create<WorldState>((set, get) => ({
  // Initial state
  city: null,
  gameTime: null,
  timeMultiplier: 15,
  isPaused: false,
  aiNPCs: [],
  backgroundNPCs: [],
  backgroundNPCCount: 0,
  playerHome: null,
  isLoading: false,
  isSubscribed: false,
  error: null,
  viewport: { x: 100, y: 75, zoom: 1 },
  selectedNPCId: null,
  hoveredNPCId: null,
  hoveredBuildingId: null,

  // Simple setters
  setCity: (city) => set({ city }),
  setGameTime: (gameTime) => set({ gameTime }),
  setTimeMultiplier: (timeMultiplier) => set({ timeMultiplier }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setAINPCs: (aiNPCs) => set({ aiNPCs }),
  setBackgroundNPCs: (backgroundNPCs) => set({ backgroundNPCs }),
  setPlayerHome: (playerHome) => set({ playerHome }),
  setViewport: (viewport) => set((state) => ({
    viewport: { ...state.viewport, ...viewport },
  })),
  setSelectedNPC: (selectedNPCId) => set({ selectedNPCId }),
  setHoveredNPC: (hoveredNPCId) => set({ hoveredNPCId }),
  setHoveredBuilding: (hoveredBuildingId) => set({ hoveredBuildingId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSubscribed: (isSubscribed) => set({ isSubscribed }),

  // Load world state from server
  loadWorldState: async () => {
    const wsStore = useWSStore.getState();
    set({ isLoading: true, error: null });

    try {
      const response = await wsStore.request('world:getState', {});

      if (response.success && response.payload) {
        const data = response.payload as any;
        set({
          city: data.city,
          gameTime: data.gameTime,
          timeMultiplier: data.timeMultiplier,
          isPaused: data.isPaused,
          aiNPCs: data.aiNPCs || [],
          backgroundNPCCount: data.backgroundNPCCount || 0,
          playerHome: data.playerHome || null,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to load world state',
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load world state',
      });
    }
  },

  // Subscribe to real-time updates
  subscribeToUpdates: () => {
    const wsStore = useWSStore.getState();

    // Subscribe on server
    wsStore.send('world:subscribe', {});
    set({ isSubscribed: true });

    // Listen for time updates
    wsStore.subscribe('world:timeUpdate', (msg: any) => {
      if (msg.payload) {
        set({ gameTime: msg.payload.gameTime });
      }
    });

    // Listen for NPC movements
    wsStore.subscribe('world:npcMoved', (msg: any) => {
      if (msg.payload) {
        const { npcId, isAI, position, buildingId, activity, activityDescription } = msg.payload;

        if (isAI) {
          set((state) => ({
            aiNPCs: state.aiNPCs.map((npc) =>
              npc.npcId === npcId
                ? { ...npc, position, buildingId, activity, activityDescription }
                : npc
            ),
          }));
        }
      }
    });
  },

  // Unsubscribe from updates
  unsubscribeFromUpdates: () => {
    const wsStore = useWSStore.getState();
    wsStore.send('world:unsubscribe', {});
    set({ isSubscribed: false });
  },

  // Request background NPCs for viewport
  requestBackgroundNPCs: async (bounds) => {
    const wsStore = useWSStore.getState();

    try {
      const response = await wsStore.request('world:getBackgroundNPCs', bounds);

      if (response.success && response.payload) {
        set({ backgroundNPCs: (response.payload as any).npcs || [] });
      }
    } catch (err) {
      console.error('[WorldStore] Failed to fetch background NPCs:', err);
    }
  },

  // Time controls
  pauseTime: async () => {
    const wsStore = useWSStore.getState();
    await wsStore.request('world:pauseTime', {});
    set({ isPaused: true });
  },

  resumeTime: async () => {
    const wsStore = useWSStore.getState();
    await wsStore.request('world:resumeTime', {});
    set({ isPaused: false });
  },

  setSpeed: async (multiplier) => {
    const wsStore = useWSStore.getState();
    await wsStore.request('world:setTimeMultiplier', { multiplier });
    set({ timeMultiplier: multiplier });
  },

  // Lookup helpers
  getBuilding: (id) => {
    const { city } = get();
    return city?.buildings.find((b) => b.id === id) || null;
  },

  getDistrict: (id) => {
    const { city } = get();
    return city?.districts.find((d) => d.id === id) || null;
  },

  getLandmark: (id) => {
    const { city } = get();
    return city?.landmarks.find((l) => l.id === id) || null;
  },

  getLandmarkByBuildingId: (buildingId) => {
    const { city } = get();
    return city?.landmarks.find((l) => l.buildingId === buildingId) || null;
  },
}));

export default useWorldStore;
