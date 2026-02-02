/**
 * Landmarks Configuration
 *
 * Maps engaige lore locations to city models and positions.
 * Designed for a 16x16 grid - compact, walkable city.
 *
 * Layout concept:
 * - Main Street runs East-West through center (y=8)
 * - Cross Street runs North-South through center (x=8)
 * - Landmarks clustered around the intersection
 * - Residential options in corners for player housing
 */

export interface LandmarkConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  position: { x: number; y: number };
  rotation?: number;
  fillerSiteUrl?: string;
  district: 'downtown' | 'nightlife' | 'arts' | 'industrial' | 'residential';
  keywords: string[];
  icon?: string;
  // For player housing selection
  isPlayerHousing?: boolean;
}

/**
 * Predefined landmarks for 16x16 grid
 *
 * Grid visualization (roads marked with ═ and ║):
 *
 *    0 1 2 3 4 5 6 7 8 9 ...15
 *  0 . . . . . . . . ║ . . . .
 *  1 . R . . . . . . ║ . . R .   R = Residential (player housing options)
 *  2 . . . . T T . . ║ . . . .   T = Train Station
 *  3 . . . . T T . . ║ . . . .
 *  4 . . . . . . . . ║ . . . .
 *  5 . . . . . P . . ║ . Q . .   P = Police, Q = Quantum Coffee
 *  6 . . . F . . . . ║ . . . .   F = Fire Station
 *  7 . . . . . . . H H . . . .   H = Hartwell Building
 *  8 ═══════════════════════════  <- Main Street
 *  9 . . . . . . . H H . . . .
 * 10 . . . . . . . . ║ . . . .
 * 11 . . . . . . . . ║ . U U .   U = Underground
 * 12 . R . . . . . . ║ . U U .
 * 13 . . . . . B . . ║ . . . .   B = Chapter House Books
 * 14 . . . . . . . . ║ . . R .
 * 15 . . . . . . . . ║ . . . .
 */
export const LANDMARKS: LandmarkConfig[] = [
  // === DOWNTOWN CORE ===
  {
    id: 'hartwell-building',
    name: 'The Hartwell Building',
    description:
      'A mysterious 1923 office tower. The 13th floor is "missing" and Floor 7 is said to have mirrors that show things that aren\'t there.',
    model: 'commercial-C2',
    position: { x: 7, y: 7 },
    rotation: 0,
    fillerSiteUrl: '/browser/www.hartwellfiles.corn',
    district: 'downtown',
    keywords: ['hartwell', 'office', 'mysterious', 'omnicorp', '13th floor'],
    icon: '🏢',
  },
  {
    id: 'quantum-coffee',
    name: 'Quantum Coffee Co.',
    description:
      'Purveyor of pseudoscience brewing methods. $47/cup. Derek is obsessed.',
    model: 'commercial-A1',
    position: { x: 10, y: 5 },
    rotation: 3,
    fillerSiteUrl: '/browser/www.quantumbrewblog.corn',
    district: 'downtown',
    keywords: ['quantum', 'coffee', 'cafe', 'derek', 'expensive'],
    icon: '☕',
  },
  {
    id: 'police-precinct-13',
    name: 'Police Precinct #13',
    description:
      'Main police station. Detective Small Kevin works the night shift.',
    model: 'police-station',
    position: { x: 5, y: 5 },
    rotation: 0,
    district: 'downtown',
    keywords: ['police', 'precinct', 'kevin', 'detective'],
    icon: '🚔',
  },
  {
    id: 'fire-station-7',
    name: 'Fire Station #7',
    description:
      'Busiest fire station in the city. Unusual number of calls to Hartwell.',
    model: 'fire-station',
    position: { x: 3, y: 6 },
    rotation: 1,
    district: 'downtown',
    keywords: ['fire', 'station', 'emergency'],
    icon: '🚒',
  },

  // === NIGHTLIFE ===
  {
    id: 'the-underground',
    name: 'The Underground',
    description:
      "Mars's legendary music venue. Hosts Velvet Algorithms and Trust Fall Tim's shows.",
    model: 'commercial-B2',
    position: { x: 10, y: 11 },
    rotation: 3,
    fillerSiteUrl: '/browser/www.bandsnotintown.corn',
    district: 'nightlife',
    keywords: ['underground', 'music', 'venue', 'mars', 'nightclub'],
    icon: '🎸',
  },

  // === ARTS DISTRICT ===
  {
    id: 'chapter-house-books',
    name: 'Chapter House Books',
    description:
      'Independent bookstore. Known for its occult and local history sections.',
    model: 'commercial-E1',
    position: { x: 5, y: 13 },
    rotation: 0,
    district: 'arts',
    keywords: ['books', 'bookstore', 'reading', 'occult'],
    icon: '📚',
  },

  // === TRANSIT ===
  {
    id: 'train-station-central',
    name: 'Central Station',
    description:
      'Main train station. Platform 847 is mysteriously never in service.',
    model: 'train-station',
    position: { x: 4, y: 2 },
    rotation: 0,
    district: 'downtown',
    keywords: ['train', 'station', 'platform', '847'],
    icon: '🚂',
  },

  // === PLAYER HOUSING OPTIONS ===
  // These are residential buildings the player can choose during onboarding
  {
    id: 'oak-street-apartments',
    name: '847 Oak Street',
    description:
      'A cozy apartment building near downtown. Walking distance to everything.',
    model: 'residential-A2',
    position: { x: 1, y: 1 },
    rotation: 0,
    district: 'residential',
    keywords: ['apartment', 'housing', 'oak street'],
    icon: '🏠',
    isPlayerHousing: true,
  },
  {
    id: 'maple-heights',
    name: 'Maple Heights',
    description:
      'Modern apartments with a view of the city. Popular with young professionals.',
    model: 'residential-B2',
    position: { x: 12, y: 1 },
    rotation: 2,
    district: 'residential',
    keywords: ['apartment', 'housing', 'maple', 'modern'],
    icon: '🏠',
    isPlayerHousing: true,
  },
  {
    id: 'riverside-condos',
    name: 'Riverside Condos',
    description:
      'Quiet neighborhood on the south side. Close to Chapter House Books.',
    model: 'residential-C2',
    position: { x: 1, y: 12 },
    rotation: 1,
    district: 'residential',
    keywords: ['condo', 'housing', 'riverside', 'quiet'],
    icon: '🏠',
    isPlayerHousing: true,
  },
  {
    id: 'nightowl-lofts',
    name: 'Night Owl Lofts',
    description:
      'Converted warehouse near The Underground. For those who keep late hours.',
    model: 'residential-D2',
    position: { x: 13, y: 14 },
    rotation: 2,
    district: 'nightlife',
    keywords: ['loft', 'housing', 'nightlife', 'warehouse'],
    icon: '🏠',
    isPlayerHousing: true,
  },
];

/**
 * Get all landmarks
 */
export function getAllLandmarks(): LandmarkConfig[] {
  return LANDMARKS;
}

/**
 * Get player housing options
 */
export function getPlayerHousingOptions(): LandmarkConfig[] {
  return LANDMARKS.filter((l) => l.isPlayerHousing);
}

/**
 * Get non-housing landmarks (actual points of interest)
 */
export function getPointsOfInterest(): LandmarkConfig[] {
  return LANDMARKS.filter((l) => !l.isPlayerHousing);
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
