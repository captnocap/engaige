/**
 * City Layouts
 *
 * Pre-made city layouts exported from the city builder tool.
 * These provide controlled zoning and guaranteed road connectivity.
 */

import type { BuildingPlacement } from '../City.js';
import { LANDMARKS } from '../landmarks.js';

export interface CityLayout {
  version: number;
  size: number;
  name: string;
  placements: Array<{
    x: number;
    y: number;
    type: string;
    rotation: number;
  }>;
}

/**
 * Load a city layout from a JSON file
 */
export async function loadLayout(layoutName: string): Promise<CityLayout | null> {
  try {
    const response = await fetch(`/layouts/city/${layoutName}.json`);
    if (!response.ok) {
      console.error(`Failed to load layout: ${layoutName}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading layout ${layoutName}:`, error);
    return null;
  }
}

/**
 * Convert a layout to BuildingPlacement array, merging with landmarks
 */
export function layoutToPlacements(layout: CityLayout): BuildingPlacement[] {
  const placements: BuildingPlacement[] = [];
  const occupied = new Set<string>();

  // First, add all landmarks at their fixed positions
  for (const landmark of LANDMARKS) {
    const key = `${landmark.position.x},${landmark.position.y}`;
    occupied.add(key);
    placements.push({
      x: landmark.position.x,
      y: landmark.position.y,
      type: landmark.model,
      rotation: landmark.rotation ?? 0,
      landmarkId: landmark.id,
      fillerSiteUrl: landmark.fillerSiteUrl,
    });
  }

  // Then add layout placements (skip if landmark already at position)
  for (const p of layout.placements) {
    const key = `${p.x},${p.y}`;
    if (occupied.has(key)) continue;

    occupied.add(key);
    placements.push({
      x: p.x,
      y: p.y,
      type: p.type,
      rotation: p.rotation,
    });
  }

  return placements;
}

/**
 * Get list of available layouts
 */
export async function getAvailableLayouts(): Promise<string[]> {
  try {
    const response = await fetch('/layouts/city/index.json');
    if (!response.ok) return [];
    const data = await response.json();
    return data.layouts || [];
  } catch {
    return [];
  }
}
