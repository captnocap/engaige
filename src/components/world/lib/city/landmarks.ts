/**
 * Landmarks Configuration
 *
 * Maps engaige lore locations to city models and positions.
 * These landmarks are placed at predefined positions when the city is generated.
 */

export interface LandmarkConfig {
  id: string;
  name: string;
  description: string;
  // Building model to use
  model: string;
  // Fixed position in the city grid
  position: { x: number; y: number };
  // Rotation (0-3 for 90-degree increments)
  rotation?: number;
  // Link to filler site if applicable
  fillerSiteUrl?: string;
  // District this belongs to
  district: 'downtown' | 'nightlife' | 'arts' | 'industrial' | 'residential';
  // Keywords for searching/referencing
  keywords: string[];
  // Icon emoji for UI
  icon?: string;
}

/**
 * Predefined landmarks that connect to engaige lore
 */
export const LANDMARKS: LandmarkConfig[] = [
  {
    id: 'hartwell-building',
    name: 'The Hartwell Building',
    description:
      'A mysterious 1923 office tower. The 13th floor is "missing" and Floor 7 is said to have mirrors that show things that aren\'t there. Omnicorp Holdings maintains offices inside.',
    model: 'residential-C3', // building-office-tall
    position: { x: 25, y: 25 },
    rotation: 0,
    fillerSiteUrl: '/browser/www.hartwellfiles.corn',
    district: 'downtown',
    keywords: ['hartwell', 'office', 'mysterious', 'omnicorp', '13th floor', 'floor 7', 'mirrors'],
    icon: '🏢',
  },
  {
    id: 'the-underground',
    name: 'The Underground',
    description:
      "Mars's legendary music venue. Relocated from its original location near the Hartwell Building. Hosts bands like Velvet Algorithms and Trust Fall Tim's shows.",
    model: 'commercial-B2', // building-casino (works as nightclub)
    position: { x: 30, y: 40 },
    rotation: 1,
    fillerSiteUrl: '/browser/www.bandsnotintown.corn',
    district: 'nightlife',
    keywords: ['underground', 'music', 'venue', 'mars', 'velvet algorithms', 'trust fall tim', 'nightclub'],
    icon: '🎸',
  },
  {
    id: 'quantum-coffee',
    name: 'Quantum Coffee Co.',
    description:
      'Purveyor of pseudoscience brewing methods. $47/cup. Derek is obsessed. Features in the Martinez Study on caffeine-induced quantum states.',
    model: 'commercial-A1', // building-cafe
    position: { x: 35, y: 30 },
    rotation: 2,
    fillerSiteUrl: '/browser/www.quantumbrewblog.corn',
    district: 'arts',
    keywords: ['quantum', 'coffee', 'cafe', 'derek', 'martinez', 'expensive', 'pseudoscience'],
    icon: '☕',
  },
  {
    id: 'chapter-house-books',
    name: 'Chapter House Books',
    description:
      'Independent bookstore in the arts district. Hosts readings and literary events. Known for its extensive occult and local history sections.',
    model: 'commercial-E2', // building-mall
    position: { x: 40, y: 35 },
    rotation: 0,
    district: 'arts',
    keywords: ['books', 'bookstore', 'chapter house', 'reading', 'literary', 'occult'],
    icon: '📚',
  },
  {
    id: 'vitalityrx',
    name: 'VitalityRx Pharmacy',
    description:
      'Local pharmacy with 24-hour service. Suspiciously well-stocked on unusual supplements and "wellness enhancers."',
    model: 'hospital', // building-hospital
    position: { x: 20, y: 20 },
    rotation: 0,
    fillerSiteUrl: '/browser/www.vitalityrx.corn',
    district: 'downtown',
    keywords: ['pharmacy', 'vitalityrx', 'medicine', 'supplements', 'health'],
    icon: '💊',
  },
  {
    id: 'nestfinder-office',
    name: 'NestFinder Real Estate',
    description:
      'Local real estate office. Handles apartment rentals and home sales in the city. Suspiciously pushy about certain "available" units in the Hartwell Building.',
    model: 'commercial-A3', // building-office
    position: { x: 22, y: 28 },
    rotation: 1,
    fillerSiteUrl: '/browser/www.nestfinder.corn',
    district: 'downtown',
    keywords: ['real estate', 'nestfinder', 'apartments', 'rentals', 'housing'],
    icon: '🏠',
  },
  {
    id: 'corn-city-stadium',
    name: 'Corn City Stadium',
    description:
      'Home of the Corn City Kernels. Hosts concerts during off-season. Site of the famous "847 Incident" during the 2023 playoffs.',
    model: 'stadium',
    position: { x: 45, y: 20 },
    rotation: 0,
    district: 'downtown',
    keywords: ['stadium', 'sports', 'kernels', 'baseball', 'concert', '847'],
    icon: '🏟️',
  },
  {
    id: 'fire-station-7',
    name: 'Fire Station #7',
    description:
      'The busiest fire station in the city. Crew has an unusual number of calls to the Hartwell Building. Chief Martinez refuses to discuss the pattern.',
    model: 'fire-station',
    position: { x: 15, y: 30 },
    rotation: 0,
    district: 'downtown',
    keywords: ['fire', 'station', 'emergency', 'martinez', 'hartwell'],
    icon: '🚒',
  },
  {
    id: 'police-precinct-13',
    name: 'Police Precinct #13',
    description:
      'Main police station for the downtown district. Detective small Kevin works the night shift. The number 13 is purely coincidental.',
    model: 'police-station',
    position: { x: 18, y: 35 },
    rotation: 0,
    district: 'downtown',
    keywords: ['police', 'precinct', 'station', 'kevin', 'detective'],
    icon: '🚔',
  },
  {
    id: 'cornhub-datacenter',
    name: 'CornHub Data Center',
    description:
      'Massive data center on the outskirts. Powers most of the city\'s digital infrastructure. The hum of servers can be heard from blocks away.',
    model: 'commercial-C2', // data-center
    position: { x: 48, y: 45 },
    rotation: 0,
    district: 'industrial',
    keywords: ['datacenter', 'data', 'servers', 'cornhub', 'internet', 'infrastructure'],
    icon: '🖥️',
  },
  {
    id: 'train-station-central',
    name: 'Central Station',
    description:
      'Main train station connecting the city to the outside world. Beautiful art deco architecture. Platform 847 is mysteriously never in service.',
    model: 'train-station',
    position: { x: 28, y: 15 },
    rotation: 0,
    district: 'downtown',
    keywords: ['train', 'station', 'central', 'platform', '847', 'transportation'],
    icon: '🚂',
  },
  {
    id: 'school-ps-847',
    name: 'Public School 847',
    description:
      'Local elementary school. Excellent test scores. The number 847 is just a coincidence. Really.',
    model: 'school',
    position: { x: 38, y: 42 },
    rotation: 0,
    district: 'residential',
    keywords: ['school', 'education', 'elementary', '847', 'children'],
    icon: '🏫',
  },
];

/**
 * Get all landmarks
 */
export function getAllLandmarks(): LandmarkConfig[] {
  return LANDMARKS;
}

/**
 * Get a landmark by ID
 */
export function getLandmarkById(id: string): LandmarkConfig | undefined {
  return LANDMARKS.find((l) => l.id === id);
}

/**
 * Get landmarks by district
 */
export function getLandmarksByDistrict(district: string): LandmarkConfig[] {
  return LANDMARKS.filter((l) => l.district === district);
}

/**
 * Search landmarks by keyword
 */
export function searchLandmarks(query: string): LandmarkConfig[] {
  const lowerQuery = query.toLowerCase();
  return LANDMARKS.filter(
    (l) =>
      l.name.toLowerCase().includes(lowerQuery) ||
      l.description.toLowerCase().includes(lowerQuery) ||
      l.keywords.some((k) => k.includes(lowerQuery))
  );
}

/**
 * Get landmark at a specific position
 */
export function getLandmarkAtPosition(x: number, y: number): LandmarkConfig | undefined {
  return LANDMARKS.find((l) => l.position.x === x && l.position.y === y);
}
