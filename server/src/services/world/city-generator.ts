/**
 * City Generator Service
 *
 * Generates city data from OpenStreetMap or creates procedural cities.
 * This is primarily a one-time generation script - the output is saved
 * as static JSON and loaded at runtime.
 *
 * For the MVP, we use a pre-generated city based on Portland, OR.
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import {
  type CityData,
  type District,
  type Building,
  type Road,
  type Landmark,
  type GridPosition,
  type DistrictType,
  type BuildingType,
} from '../../types/world.js';

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = join(dirname(import.meta.url.replace('file://', '')), '../../../data/world');

// City generation parameters
const GRID_WIDTH = 200;   // 200 tiles wide
const GRID_HEIGHT = 150;  // 150 tiles tall
const TILE_SIZE = 64;     // 64px per tile

// ============================================================================
// Name Mappings (Portland → Pinewood)
// ============================================================================

const NAME_MAPPINGS: Record<string, string> = {
  // Districts
  'Pearl District': 'Artisan Quarter',
  'Downtown Portland': 'Central Pinewood',
  'Alberta Arts District': 'Northside Arts',
  'Hawthorne': 'Hawthorn Row',
  'Division': 'Division Street',
  'Mississippi': 'River District',
  'Sellwood': 'Southwood',
  'St. Johns': 'St. Johns', // Keep some names
  'Lloyd District': 'Lloyd Center',
  'Old Town/Chinatown': 'Old Town',
  'Waterfront': 'Riverside',
  'Industrial District': 'Eastside Industrial',
  'University District': 'Campus District',

  // Landmarks
  "Powell's Books": 'Chapter House Books',
  'Voodoo Doughnut': 'Hex Donuts',
  'Portland Art Museum': 'Pinewood Art Museum',
  'Pioneer Courthouse Square': 'Pioneer Plaza',
  'Saturday Market': 'Riverside Market',
  'Rose Garden': 'Thornwood Arena',
  'OMSI': 'Discovery Center',
  'Portland State University': 'Pinewood State University',

  // Generic businesses
  'Stumptown Coffee': 'Treeline Coffee',
  'Salt & Straw': 'Cream & Dream',
  'Screen Door': 'Blue Door Cafe',
};

// ============================================================================
// Seeded Random Generator
// ============================================================================

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// District Generation
// ============================================================================

function generateDistricts(): District[] {
  const districts: District[] = [
    {
      id: 'downtown',
      name: 'Central Pinewood',
      type: 'downtown',
      description: 'The bustling heart of the city with high-rises, offices, and busy streets.',
      bounds: { points: [[70, 50], [130, 50], [130, 90], [70, 90]] },
      color: '#4A90A4',
      peakHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      vibe: 'Professional, fast-paced, corporate energy',
    },
    {
      id: 'arts',
      name: 'Artisan Quarter',
      type: 'arts',
      description: 'Creative hub filled with galleries, studios, boutiques, and trendy cafes.',
      bounds: { points: [[30, 30], [70, 30], [70, 60], [30, 60]] },
      color: '#9B59B6',
      peakHours: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      vibe: 'Creative, eclectic, bohemian atmosphere',
    },
    {
      id: 'university',
      name: 'Campus District',
      type: 'university',
      description: 'Academic area surrounding Pinewood State University with libraries and student life.',
      bounds: { points: [[130, 20], [180, 20], [180, 60], [130, 60]] },
      color: '#27AE60',
      peakHours: [8, 9, 10, 11, 12, 13, 14, 15, 16],
      vibe: 'Youthful, academic, intellectually curious',
    },
    {
      id: 'nightlife',
      name: 'Neon Row',
      type: 'nightlife',
      description: 'Entertainment district with bars, clubs, and late-night venues.',
      bounds: { points: [[50, 90], [90, 90], [90, 120], [50, 120]] },
      color: '#E74C3C',
      peakHours: [18, 19, 20, 21, 22, 23, 0, 1, 2],
      vibe: 'Energetic, social, party atmosphere',
    },
    {
      id: 'waterfront',
      name: 'Riverside',
      type: 'waterfront',
      description: 'Scenic area along the river with parks, restaurants, and walking paths.',
      bounds: { points: [[0, 60], [30, 60], [30, 130], [0, 130]] },
      color: '#3498DB',
      peakHours: [10, 11, 12, 13, 14, 15, 16, 17, 18],
      vibe: 'Relaxed, scenic, perfect for walks',
    },
    {
      id: 'residential-north',
      name: 'Maple Heights',
      type: 'residential',
      description: 'Quiet residential neighborhood with apartments and small parks.',
      bounds: { points: [[30, 0], [100, 0], [100, 30], [30, 30]] },
      color: '#95A5A6',
      peakHours: [7, 8, 17, 18, 19, 20],
      vibe: 'Quiet, suburban, family-friendly',
    },
    {
      id: 'residential-south',
      name: 'Southwood',
      type: 'residential',
      description: 'Charming neighborhood with older homes and tree-lined streets.',
      bounds: { points: [[90, 100], [150, 100], [150, 140], [90, 140]] },
      color: '#7F8C8D',
      peakHours: [7, 8, 17, 18, 19, 20],
      vibe: 'Established, peaceful, neighborly',
    },
    {
      id: 'shopping',
      name: 'Commerce Corner',
      type: 'shopping',
      description: 'Shopping district with malls, boutiques, and retail stores.',
      bounds: { points: [[130, 60], [170, 60], [170, 100], [130, 100]] },
      color: '#F39C12',
      peakHours: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      vibe: 'Busy, commercial, consumer paradise',
    },
    {
      id: 'industrial',
      name: 'Eastside Works',
      type: 'industrial',
      description: 'Industrial area with warehouses, factories, and working-class businesses.',
      bounds: { points: [[150, 100], [200, 100], [200, 150], [150, 150]] },
      color: '#34495E',
      peakHours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      vibe: 'Working class, gritty, industrial charm',
    },
  ];

  return districts;
}

// ============================================================================
// Building Generation
// ============================================================================

const FIRST_NAMES = ['Sunrise', 'Moonlight', 'Golden', 'Silver', 'Blue', 'Red', 'Green', 'Oak', 'Maple', 'Pine', 'Cedar', 'Willow', 'River', 'Lake', 'Mountain', 'Valley', 'Urban', 'Metro', 'Central', 'Corner', 'Village', 'Harbor', 'Bridge', 'Tower', 'Plaza'];

const CAFE_NAMES = ['Bean', 'Brew', 'Grind', 'Roast', 'Cup', 'Mug', 'Percolate', 'Steam', 'Drip', 'Espresso'];
const RESTAURANT_SUFFIXES = ['Kitchen', 'Eatery', 'Bistro', 'Grill', 'Table', 'Plate', 'Fork', 'Spoon', 'Taste', 'Bites'];
const BAR_NAMES = ['The', 'Lucky', 'Old', 'New', 'Dark', 'Bright', 'Hidden', 'Secret', 'Last', 'First'];
const BAR_SUFFIXES = ['Tavern', 'Pub', 'Bar', 'Lounge', 'Saloon', 'Speakeasy', 'Den', 'Spot', 'Joint', 'Room'];

function generateBuildingName(type: BuildingType, rng: () => number): string {
  const first = pickRandom(FIRST_NAMES, rng);

  switch (type) {
    case 'cafe':
      return `${first} ${pickRandom(CAFE_NAMES, rng)}`;
    case 'restaurant':
      return `${first} ${pickRandom(RESTAURANT_SUFFIXES, rng)}`;
    case 'bar':
    case 'club':
      return `${pickRandom(BAR_NAMES, rng)} ${first} ${pickRandom(BAR_SUFFIXES, rng)}`;
    case 'apartment':
      return `${first} Apartments`;
    case 'house':
      return `${first} Residence`;
    case 'office':
      return `${first} Tower`;
    case 'gym':
      return `${first} Fitness`;
    case 'library':
      return `${first} Library`;
    case 'bookstore':
      return `${first} Books`;
    case 'gallery':
      return `${first} Gallery`;
    case 'studio':
      return `${first} Studio`;
    case 'shop':
      return `${first} Shop`;
    case 'mall':
      return `${first} Mall`;
    case 'park':
      return `${first} Park`;
    case 'plaza':
      return `${first} Plaza`;
    case 'university':
      return `${first} Hall`;
    case 'hospital':
      return `${first} Medical Center`;
    case 'warehouse':
      return `${first} Warehouse`;
    case 'factory':
      return `${first} Factory`;
    default:
      return `${first} Place`;
  }
}

function getBuildingTypesForDistrict(districtType: DistrictType): BuildingType[] {
  switch (districtType) {
    case 'downtown':
      return ['office', 'restaurant', 'cafe', 'shop', 'plaza', 'apartment'];
    case 'arts':
      return ['gallery', 'studio', 'cafe', 'bookstore', 'restaurant', 'apartment'];
    case 'university':
      return ['university', 'library', 'cafe', 'restaurant', 'apartment', 'bookstore'];
    case 'nightlife':
      return ['bar', 'club', 'restaurant', 'cafe', 'apartment'];
    case 'waterfront':
      return ['park', 'restaurant', 'cafe', 'plaza', 'apartment'];
    case 'residential':
      return ['apartment', 'house', 'park', 'cafe', 'shop'];
    case 'suburbs':
      return ['house', 'park', 'shop', 'restaurant'];
    case 'shopping':
      return ['shop', 'mall', 'restaurant', 'cafe', 'gym'];
    case 'industrial':
      return ['warehouse', 'factory', 'office', 'restaurant'];
    default:
      return ['apartment', 'shop', 'cafe'];
  }
}

function isPositionInDistrict(pos: GridPosition, district: District): boolean {
  const { points } = district.bounds;
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));

  return pos.x >= minX && pos.x < maxX && pos.y >= minY && pos.y < maxY;
}

function generateBuildings(districts: District[], rng: () => number): Building[] {
  const buildings: Building[] = [];
  const occupiedPositions = new Set<string>();
  let buildingId = 0;

  for (const district of districts) {
    const { points } = district.bounds;
    const minX = Math.min(...points.map(p => p[0]));
    const maxX = Math.max(...points.map(p => p[0]));
    const minY = Math.min(...points.map(p => p[1]));
    const maxY = Math.max(...points.map(p => p[1]));

    const districtArea = (maxX - minX) * (maxY - minY);
    const buildingDensity = district.type === 'downtown' ? 0.4
      : district.type === 'industrial' ? 0.25
      : district.type === 'residential' || district.type === 'suburbs' ? 0.3
      : 0.35;

    const targetBuildings = Math.floor(districtArea * buildingDensity / 4); // Buildings are ~2x2
    const buildingTypes = getBuildingTypesForDistrict(district.type);

    for (let i = 0; i < targetBuildings; i++) {
      // Find unoccupied position
      let attempts = 0;
      let pos: GridPosition | null = null;

      while (attempts < 50 && !pos) {
        const x = minX + Math.floor(rng() * (maxX - minX));
        const y = minY + Math.floor(rng() * (maxY - minY));
        const key = `${x},${y}`;

        if (!occupiedPositions.has(key)) {
          pos = { x, y };
          occupiedPositions.add(key);
          // Also mark adjacent tiles
          occupiedPositions.add(`${x + 1},${y}`);
          occupiedPositions.add(`${x},${y + 1}`);
          occupiedPositions.add(`${x + 1},${y + 1}`);
        }
        attempts++;
      }

      if (!pos) continue;

      const type = pickRandom(buildingTypes, rng);
      const id = `bld-${String(buildingId++).padStart(4, '0')}`;

      const isResidential = type === 'apartment' || type === 'house';
      const isWorkplace = ['office', 'restaurant', 'cafe', 'bar', 'club', 'shop', 'mall', 'gym', 'library', 'gallery', 'studio', 'university', 'hospital', 'warehouse', 'factory'].includes(type);

      let hours: { open: number; close: number; days: number[] } | undefined;
      if (isWorkplace && type !== 'bar' && type !== 'club') {
        hours = { open: 8, close: 18, days: [1, 2, 3, 4, 5] };
      } else if (type === 'bar' || type === 'club') {
        hours = { open: 17, close: 2, days: [0, 1, 2, 3, 4, 5, 6] };
      } else if (type === 'restaurant') {
        hours = { open: 11, close: 22, days: [0, 1, 2, 3, 4, 5, 6] };
      }

      buildings.push({
        id,
        name: generateBuildingName(type, rng),
        type,
        districtId: district.id,
        position: pos,
        size: { width: 2, height: 2 },
        spriteId: `${type}-${Math.floor(rng() * 4) + 1}`,
        capacity: type === 'apartment' ? 20 : type === 'office' ? 50 : type === 'mall' ? 100 : 15,
        isResidential,
        isWorkplace,
        hours,
      });
    }
  }

  return buildings;
}

// ============================================================================
// Road Generation
// ============================================================================

function generateRoads(districts: District[], rng: () => number): Road[] {
  const roads: Road[] = [];
  let roadId = 0;

  // Main horizontal roads
  for (let y = 20; y < GRID_HEIGHT; y += 30) {
    roads.push({
      id: `road-${roadId++}`,
      type: 'main',
      points: [{ x: 0, y }, { x: GRID_WIDTH, y }],
      width: 2,
    });
  }

  // Main vertical roads
  for (let x = 30; x < GRID_WIDTH; x += 40) {
    roads.push({
      id: `road-${roadId++}`,
      type: 'main',
      points: [{ x, y: 0 }, { x, y: GRID_HEIGHT }],
      width: 2,
    });
  }

  // Add some smaller streets between mains
  for (let y = 10; y < GRID_HEIGHT; y += 15) {
    if (rng() > 0.3) {
      roads.push({
        id: `road-${roadId++}`,
        type: 'street',
        points: [{ x: 0, y }, { x: GRID_WIDTH, y }],
        width: 1,
      });
    }
  }

  for (let x = 15; x < GRID_WIDTH; x += 20) {
    if (rng() > 0.3) {
      roads.push({
        id: `road-${roadId++}`,
        type: 'street',
        points: [{ x, y: 0 }, { x, y: GRID_HEIGHT }],
        width: 1,
      });
    }
  }

  return roads;
}

// ============================================================================
// Landmark Generation
// ============================================================================

function generateLandmarks(buildings: Building[], districts: District[], rng: () => number): Landmark[] {
  const landmarks: Landmark[] = [];

  // Define notable landmarks manually
  const landmarkConfigs = [
    { name: 'Chapter House Books', type: 'bookstore', district: 'arts', description: 'The city\'s legendary independent bookstore, spanning multiple floors of literary wonder.', keywords: ['books', 'reading', 'literature', 'bookworm', 'indie'], icon: '📚' },
    { name: 'Pioneer Plaza', type: 'plaza', district: 'downtown', description: 'The city\'s central gathering place, host to events, protests, and people-watching.', keywords: ['downtown', 'plaza', 'events', 'public'], icon: '🏛️' },
    { name: 'Hex Donuts', type: 'cafe', district: 'nightlife', description: 'Quirky 24-hour donut shop famous for unusual flavors and late-night crowds.', keywords: ['donuts', 'late night', 'quirky', 'sweet'], icon: '🍩' },
    { name: 'Pinewood Art Museum', type: 'gallery', district: 'arts', description: 'Premier art museum showcasing both classical and contemporary works.', keywords: ['art', 'museum', 'culture', 'gallery'], icon: '🎨' },
    { name: 'Riverside Market', type: 'plaza', district: 'waterfront', description: 'Weekend farmers market and artisan crafts fair along the river.', keywords: ['market', 'farmers', 'artisan', 'weekend'], icon: '🛒' },
    { name: 'Thornwood Arena', type: 'club', district: 'downtown', description: 'Major sports and concert venue hosting big events.', keywords: ['sports', 'concerts', 'events', 'arena'], icon: '🏟️' },
    { name: 'Discovery Center', type: 'university', district: 'waterfront', description: 'Interactive science museum popular with families and curious minds.', keywords: ['science', 'museum', 'interactive', 'learning'], icon: '🔬' },
    { name: 'Pinewood State University', type: 'university', district: 'university', description: 'The city\'s main university campus, buzzing with academic energy.', keywords: ['university', 'college', 'students', 'academic'], icon: '🎓' },
    { name: 'Treeline Coffee Roasters', type: 'cafe', district: 'arts', description: 'The city\'s most beloved coffee roaster, known for third-wave brewing.', keywords: ['coffee', 'cafe', 'roaster', 'hipster'], icon: '☕' },
    { name: 'The Basement', type: 'club', district: 'nightlife', description: 'Underground music venue hosting indie bands and DJ sets.', keywords: ['music', 'venue', 'underground', 'indie', 'nightlife'], icon: '🎵' },
    { name: 'Sunrise Cafe', type: 'cafe', district: 'residential-north', description: 'Cozy neighborhood cafe known for amazing breakfast.', keywords: ['breakfast', 'brunch', 'cafe', 'morning'], icon: '🌅' },
    { name: 'Crescent Park', type: 'park', district: 'waterfront', description: 'Beautiful riverside park with walking trails and scenic views.', keywords: ['park', 'nature', 'walking', 'river', 'scenic'], icon: '🌳' },
  ];

  // Find or create buildings for landmarks
  for (const config of landmarkConfigs) {
    // Try to find an existing building of the right type in the right district
    let building = buildings.find(b =>
      b.type === config.type &&
      b.districtId === config.district &&
      !landmarks.some(l => l.buildingId === b.id)
    );

    if (building) {
      // Rename the building to match the landmark
      building.name = config.name;

      landmarks.push({
        id: `landmark-${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: config.name,
        buildingId: building.id,
        description: config.description,
        keywords: config.keywords,
        isNotable: true,
        iconEmoji: config.icon,
      });
    }
  }

  return landmarks;
}

// ============================================================================
// Main Generation Function
// ============================================================================

export async function generateCity(seed: number = 42): Promise<CityData> {
  const rng = seededRandom(seed);

  console.log('[CityGenerator] Generating Pinewood city...');

  const districts = generateDistricts();
  console.log(`[CityGenerator] Generated ${districts.length} districts`);

  const buildings = generateBuildings(districts, rng);
  console.log(`[CityGenerator] Generated ${buildings.length} buildings`);

  const roads = generateRoads(districts, rng);
  console.log(`[CityGenerator] Generated ${roads.length} roads`);

  const landmarks = generateLandmarks(buildings, districts, rng);
  console.log(`[CityGenerator] Generated ${landmarks.length} landmarks`);

  const city: CityData = {
    name: 'Pinewood',
    realWorldSource: 'Portland, OR',
    bounds: {
      minX: 0,
      maxX: GRID_WIDTH,
      minY: 0,
      maxY: GRID_HEIGHT,
    },
    tileSize: TILE_SIZE,
    gridSize: { width: GRID_WIDTH, height: GRID_HEIGHT },
    districts,
    buildings,
    roads,
    landmarks,
    generatedAt: Math.floor(Date.now() / 1000),
  };

  return city;
}

// ============================================================================
// Save/Load Functions
// ============================================================================

export async function saveCityToFile(city: CityData, filename = 'pinewood.json'): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  const filePath = join(DATA_DIR, filename);
  await writeFile(filePath, JSON.stringify(city, null, 2), 'utf-8');
  console.log(`[CityGenerator] Saved city to ${filePath}`);
}

export async function loadCityFromFile(filename = 'pinewood.json'): Promise<CityData | null> {
  const filePath = join(DATA_DIR, filename);

  if (!existsSync(filePath)) {
    console.log(`[CityGenerator] City file not found: ${filePath}`);
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as CityData;
}

export async function saveNameMappings(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  const filePath = join(DATA_DIR, 'name-mappings.json');
  await writeFile(filePath, JSON.stringify(NAME_MAPPINGS, null, 2), 'utf-8');
  console.log(`[CityGenerator] Saved name mappings to ${filePath}`);
}

// ============================================================================
// CLI Generation Script
// ============================================================================

// Run this file directly to generate the city
if (import.meta.main) {
  console.log('[CityGenerator] Running city generation...');

  const city = await generateCity(42);
  await saveCityToFile(city);
  await saveNameMappings();

  console.log('[CityGenerator] City generation complete!');
  console.log(`  - Districts: ${city.districts.length}`);
  console.log(`  - Buildings: ${city.buildings.length}`);
  console.log(`  - Roads: ${city.roads.length}`);
  console.log(`  - Landmarks: ${city.landmarks.length}`);
}
