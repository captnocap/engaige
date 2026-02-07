/**
 * Mode Registry
 *
 * Maps mode IDs to lazy-loaded mode constructors.
 * Modes are imported dynamically to avoid loading all code upfront.
 */

import type { ModeInfo, ModeCategory } from './types.js';

// ============================================================================
// Mode Metadata
// ============================================================================

export const MODE_LIST: ModeInfo[] = [
  // Abstract
  { id: 'constellation', name: 'Constellation', description: 'Stars spawn and connect to nearby stars', category: 'abstract', is3D: false },
  { id: 'flow', name: 'Flow', description: 'Particles following noise-based flow fields', category: 'abstract', is3D: false },
  { id: 'spirograph', name: 'Spirograph', description: 'Audio-modulated mathematical curves', category: 'abstract', is3D: false },

  // Geometric
  { id: 'mandala', name: 'Mandala', description: 'Radial slices build a circular timeline', category: 'geometric', is3D: false },
  { id: 'rings', name: 'Rings', description: 'Concentric rings pulse outward', category: 'geometric', is3D: false },
  { id: 'cymatics', name: 'Cymatics', description: 'Chladni plate standing wave patterns', category: 'geometric', is3D: false },
  { id: 'stainedglass', name: 'Stained Glass', description: 'Mosaic with rippling color waves', category: 'geometric', is3D: false },
  { id: 'voronoi', name: 'Voronoi', description: 'Cellular patterns that fracture on beats', category: 'geometric', is3D: false },

  // Organic
  { id: 'terrain', name: 'Terrain', description: 'Scrolling mountain landscape', category: 'organic', is3D: false },
  { id: 'mycelium', name: 'Mycelium', description: 'Organic network growth with synaptic connections', category: 'organic', is3D: false },
  { id: 'contours', name: 'Contours', description: 'Topographic contour lines', category: 'organic', is3D: false },
  { id: 'cellular', name: 'Cellular', description: 'Game of Life with evolving rules', category: 'organic', is3D: false },

  // 3D
  { id: 'geometry', name: 'Geometry', description: 'Pulsing 3D icosahedron', category: '3d', is3D: true },
  { id: 'nebula', name: 'Nebula', description: 'Cosmic particle clouds', category: '3d', is3D: true },
  { id: 'tunnel', name: 'Tunnel', description: 'Infinite flying tunnel', category: '3d', is3D: true },
];

export const MODE_MAP = new Map(MODE_LIST.map(m => [m.id, m]));

export function getModesByCategory(category: ModeCategory): ModeInfo[] {
  return MODE_LIST.filter(m => m.category === category);
}

// ============================================================================
// Lazy Mode Loaders
// ============================================================================

type ModeLoader = () => Promise<{ default?: any; [key: string]: any }>;

const MODE_LOADERS: Record<string, ModeLoader> = {
  // 2D modes
  mandala: () => import('./modes/mandala.js'),
  constellation: () => import('./modes/constellation.js'),
  rings: () => import('./modes/rings.js'),
  flow: () => import('./modes/flow.js'),
  terrain: () => import('./modes/terrain.js'),
  cymatics: () => import('./modes/cymatics.js'),
  stainedglass: () => import('./modes/stained-glass.js'),
  mycelium: () => import('./modes/mycelium.js'),
  spirograph: () => import('./modes/spirograph.js'),
  voronoi: () => import('./modes/voronoi.js'),
  contours: () => import('./modes/contours.js'),
  cellular: () => import('./modes/cellular.js'),

  // 3D modes
  geometry: () => import('./modes3d/geometry.js'),
  nebula: () => import('./modes3d/nebula.js'),
  tunnel: () => import('./modes3d/tunnel.js'),
};

// Mode class name mapping (module export name)
const MODE_CLASS_NAMES: Record<string, string> = {
  mandala: 'MandalaMode',
  constellation: 'ConstellationMode',
  rings: 'RingsMode',
  flow: 'FlowMode',
  terrain: 'TerrainMode',
  cymatics: 'CymaticsMode',
  stainedglass: 'StainedGlassMode',
  mycelium: 'MyceliumMode',
  spirograph: 'SpirographMode',
  voronoi: 'VoronoiMode',
  contours: 'ContoursMode',
  cellular: 'CellularMode',
  geometry: 'GeometryMode',
  nebula: 'NebulaMode',
  tunnel: 'TunnelMode',
};

/**
 * Lazily load and instantiate a 2D mode.
 * Returns the mode class constructor (not an instance).
 */
export async function loadMode(modeId: string): Promise<any> {
  const loader = MODE_LOADERS[modeId];
  if (!loader) {
    throw new Error(`Unknown mode: ${modeId}`);
  }

  const module = await loader();
  const className = MODE_CLASS_NAMES[modeId];

  // Try named export first, then default
  const ModeClass = module[className] || module.default;
  if (!ModeClass) {
    throw new Error(`Mode module for "${modeId}" does not export ${className} or default`);
  }

  return ModeClass;
}

/**
 * Check if a mode ID is valid.
 */
export function isValidMode(modeId: string): boolean {
  return modeId in MODE_LOADERS;
}

/**
 * Check if a mode is 3D.
 */
export function is3DMode(modeId: string): boolean {
  return MODE_MAP.get(modeId)?.is3D ?? false;
}
