/**
 * Search Service
 *
 * Provides full-text search across the .corn internet.
 * Uses FTS5 with BM25 ranking and proximity boosting.
 *
 * Handles:
 * - Static content indexing (filler sites on startup)
 * - Dynamic content indexing (NPC-generated content in real-time)
 * - Search queries with filters
 * - Autocomplete suggestions
 */

import {
  initializeSearchIndex,
  indexStaticContentBatch,
  indexContent,
  search as searchIndex,
  autocomplete as autocompleteIndex,
  getIndexStats,
  type IndexableContent,
  type SearchResult,
  type SearchOptions,
} from '../db/search-index.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';

// ============================================================================
// Types
// ============================================================================

export interface SearchQuery {
  query: string;
  domain?: string;
  contentType?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  took: number; // milliseconds
  stats?: {
    indexed: number;
    byDomain: Record<string, number>;
    byType: Record<string, number>;
  };
}

export interface AutocompleteResponse {
  prefix: string;
  suggestions: Array<{
    title: string;
    url: string;
    contentType: string;
  }>;
}

// ============================================================================
// Static Content (Core Lore)
// ============================================================================

// TODO: This should be loaded from the site manifests (src/data/site-manifests.ts)
// For now, this is a server-side copy of the core lore content.
// The frontend uses the manifest system for client-side search.
// When WebSocket search is enabled, this FTS5 index will be the source of truth.
//
// Future: Create a shared JSON file that both frontend and backend can consume,
// or have the server load manifests from the frontend build output.
const STATIC_CONTENT: IndexableContent[] = [
  // DailyBuzz Articles
  {
    id: 'dailybuzz_article_1',
    url: 'www.dailybuzz.corn/article/local-band-cancels-show',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'Local Band Cancels Show Due to "Ongoing Existential Crisis"',
    body: 'The Velvet Algorithms, the electronic duo known for their experimental sound and sold-out shows at The Underground, have cancelled tonight\'s highly anticipated performance, citing an "ongoing existential crisis" that has affected both band members.',
    snippet: 'The Velvet Algorithms cite "fundamental questioning of musical purpose" as reason for postponement',
    author: 'Sarah Chen',
    tags: ['music', 'local', 'The Velvet Algorithms', 'The Underground'],
  },
  {
    id: 'dailybuzz_article_2',
    url: 'www.dailybuzz.corn/article/quantum-cafe-opens',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'New Quantum Cafe Opens Downtown, Charges $47 Per Cup',
    body: 'A new quantum coffee establishment opened its doors downtown this morning, becoming the city\'s first dedicated "Q-Cafe" and immediately attracting lines that wrapped around the block. Qubit Coffee, located in the former Hartwell Building lobby, offers what owner Dana Kim calls "the most scientifically advanced coffee experience available to consumers."',
    snippet: 'Enthusiasts line up for hours; scientists remain skeptical',
    author: 'Michael Torres',
    tags: ['coffee', 'quantum', 'local business', 'downtown', 'Hartwell Building'],
  },
  {
    id: 'dailybuzz_article_5',
    url: 'www.dailybuzz.corn/article/trust-fall-record',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'Local Man Breaks Trust Fall Record with 2,847 Consecutive Falls',
    body: 'Tim Henderson, known locally as "Trust Fall Tim," has officially broken the world record for consecutive trust falls, completing his 2,847th fall yesterday at the downtown plaza. Henderson, 34, has been performing daily trust falls for the past eight years.',
    snippet: 'Trust Fall Tim achieves 78.5% catch rate over eight-year experiment',
    author: 'Amanda Price',
    tags: ['local', 'record', 'Trust Fall Tim', 'human interest'],
  },

  // WikiKnow Articles
  {
    id: 'wikiknow_quantum_coffee',
    url: 'www.wikiknow.corn/wiki/Quantum_Coffee_Brewing',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'Quantum Coffee Brewing',
    body: 'Quantum coffee brewing is a controversial preparation method that claims to use quantum mechanical principles to enhance the extraction of flavor compounds from coffee beans. The practice gained mainstream attention following the publication of the Martinez Study in 2024.',
    snippet: 'Controversial preparation method claiming to use quantum mechanics to enhance coffee extraction',
    tags: ['coffee', 'quantum', 'pseudoscience', 'Martinez Study'],
  },
  {
    id: 'wikiknow_hartwell_building',
    url: 'www.wikiknow.corn/wiki/Hartwell_Building',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'Hartwell Building',
    body: 'The Hartwell Building is a 14-story commercial building located in downtown, notable for its controversial architectural history and the persistent urban legend surrounding its "missing" 13th floor. Built in 1923 by industrialist Edmund Hartwell.',
    snippet: 'Historic downtown building notable for its "missing" 13th floor mystery',
    tags: ['architecture', 'downtown', 'mystery', 'Floor 13'],
  },
  {
    id: 'wikiknow_underground',
    url: 'www.wikiknow.corn/wiki/The_Underground_(venue)',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'The Underground (venue)',
    body: 'The Underground is a music venue located in the basement of the former Meridian Theater building. Founded in 2018 by Marcus "Mars" Williams, the venue has become known for hosting experimental electronic, post-punk, and avant-garde performances.',
    snippet: 'Experimental music venue known for hosting avant-garde performances',
    tags: ['music', 'venue', 'The Underground', 'Mars Williams'],
  },
  {
    id: 'wikiknow_trust_fall_tim',
    url: 'www.wikiknow.corn/wiki/Trust_Fall_Tim',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'Trust Fall Tim',
    body: 'Timothy "Trust Fall Tim" Henderson is a local performance artist known for his ongoing project involving daily trust falls in public spaces. Since 2018, Henderson has performed over 2,847 documented trust falls.',
    snippet: 'Performance artist known for daily public trust falls since 2018',
    tags: ['performance art', 'Trust Fall Tim', 'local celebrity'],
  },
  {
    id: 'wikiknow_velvet_algorithms',
    url: 'www.wikiknow.corn/wiki/The_Velvet_Algorithms',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'The Velvet Algorithms',
    body: 'The Velvet Algorithms are an electronic music duo known for their experimental sound and frequent cancellation of performances due to "philosophical crises."',
    snippet: 'Experimental electronic duo known for philosophical performance cancellations',
    tags: ['music', 'electronic', 'The Velvet Algorithms', 'experimental'],
  },

  // VidTube Videos
  {
    id: 'vidtube_quantum_coffee_explained',
    url: 'www.vidtube.corn/watch/quantum_coffee_explained',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'I Tried $47 Quantum Coffee for 30 Days - Here\'s What Happened',
    body: 'In this video, I document my experience drinking quantum coffee every day for 30 days. Does quantum coffee actually work? Is it worth the $47 price tag?',
    snippet: 'Month-long experiment with $47 quantum coffee from Qubit Coffee',
    author: 'ScienceBro',
    tags: ['coffee', 'quantum', 'experiment', 'review'],
  },
  {
    id: 'vidtube_floor_13_investigation',
    url: 'www.vidtube.corn/watch/hartwell_floor_13',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'We Snuck Into the Hartwell Building\'s Missing Floor 13 (GONE WRONG)',
    body: 'The Hartwell Building claims not to have a 13th floor, but architectural surveys show 12 feet of unaccounted space. We got access to the building after hours and tried to find where Floor 13 should be.',
    snippet: 'Urban exploration of the Hartwell Building\'s mysterious missing floor',
    author: 'ParanormalPatrol',
    tags: ['Hartwell Building', 'urban exploration', 'mystery', 'Floor 13'],
  },
  {
    id: 'vidtube_trust_fall_compilation',
    url: 'www.vidtube.corn/watch/trust_fall_tim_best_fails',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'Trust Fall Tim\'s Most Epic Falls (21.5% Fail Rate Compilation)',
    body: 'A compilation of Trust Fall Tim\'s most memorable falls, including the ones where nobody caught him.',
    snippet: 'Compilation of Trust Fall Tim\'s greatest misses and the stories behind them',
    author: 'ViralMoments',
    tags: ['Trust Fall Tim', 'compilation', 'fails', 'viral'],
  },

  // AskCorn Questions
  {
    id: 'askcorn_quantum_coffee_worth',
    url: 'www.askcorn.corn/question/is-quantum-coffee-worth-47',
    siteDomain: 'askcorn.corn',
    contentType: 'question',
    title: 'Is quantum coffee worth $47 per cup?',
    body: 'I keep hearing about this new quantum coffee place downtown (Qubit Coffee) and everyone seems to have strong opinions. Some people swear it\'s life-changing, others say it\'s a scam.',
    snippet: 'Discussion about whether quantum coffee from Qubit Coffee is worth the price',
    author: 'CuriousCaffeineConsumer',
    tags: ['coffee', 'quantum', 'money', 'review'],
  },
  {
    id: 'askcorn_floor_13_hartwell',
    url: 'www.askcorn.corn/question/what-happened-to-floor-13-hartwell',
    siteDomain: 'askcorn.corn',
    contentType: 'question',
    title: 'What really happened to Floor 13 of the Hartwell Building?',
    body: 'I work in the Hartwell Building and I\'ve noticed some weird things. The elevator skips from 12 to 14, which is normal for superstition, but the stairwell has a landing between 12 and 14 that\'s always locked.',
    snippet: 'Discussion about the mysterious missing floor in the Hartwell Building',
    author: 'BuildingTenant2024',
    tags: ['Hartwell Building', 'mystery', 'Floor 13', 'urban legend'],
  },

  // Threadit Threads
  {
    id: 'threadit_quantum_coffee_ama',
    url: 'www.threadit.corn/t/quantum_coffee_ama',
    siteDomain: 'threadit.corn',
    contentType: 'thread',
    title: 'I work at Qubit Coffee AMA - Ask me anything about quantum brewing',
    body: 'I\'m the Quantum Sommelier at Qubit Coffee (yes, that\'s my real job title). I have a PhD in physics but I moonlight as a barista because student loans are real.',
    snippet: 'AMA with Qubit Coffee\'s Quantum Sommelier about the reality of quantum brewing',
    author: 'QuantumBarista',
    tags: ['AMA', 'quantum coffee', 'Qubit Coffee', 'science'],
  },
  {
    id: 'threadit_floor_13_theory',
    url: 'www.threadit.corn/t/floor_13_theory',
    siteDomain: 'threadit.corn',
    contentType: 'thread',
    title: '[THEORY] The Hartwell Building Floor 13 is a dimensional pocket',
    body: 'Okay hear me out. The 12 feet of unaccounted space in the Hartwell Building isn\'t just a quirky architectural choice. I\'ve been researching Edmund Hartwell and found records showing he was involved in "experimental architecture" in the 1920s.',
    snippet: 'Conspiracy theory about the true nature of the Hartwell Building\'s missing floor',
    author: 'UrbanMysteryHunter',
    tags: ['Hartwell Building', 'Floor 13', 'conspiracy', 'theory'],
  },

  // HuskReviews Businesses
  {
    id: 'huskreviews_qubit_coffee',
    url: 'www.huskreviews.corn/business/qubit-coffee',
    siteDomain: 'huskreviews.corn',
    contentType: 'business',
    title: 'Qubit Coffee',
    body: 'Downtown\'s first quantum coffee establishment. The $47 "Collapsing Wave" signature drink takes 45 minutes to prepare through what they call "quantum entanglement brewing."',
    snippet: 'Downtown quantum coffee shop in the Hartwell Building, $47 signature drink',
    tags: ['coffee', 'quantum', 'downtown', 'Hartwell Building'],
  },
  {
    id: 'huskreviews_underground',
    url: 'www.huskreviews.corn/business/the-underground',
    siteDomain: 'huskreviews.corn',
    contentType: 'business',
    title: 'The Underground',
    body: 'Basement music venue specializing in experimental and avant-garde performances. Owned by the legendary Mars Williams.',
    snippet: 'Experimental music venue in a basement, 200-person capacity, great acoustics',
    tags: ['music venue', 'The Underground', 'live music', 'Mars Williams'],
  },

  // CobFundMe Campaigns
  {
    id: 'cobfundme_quantum_research',
    url: 'www.cobfundme.corn/campaign/quantum-coffee-research',
    siteDomain: 'cobfundme.corn',
    contentType: 'campaign',
    title: 'Fund Derek\'s Quantum Coffee Research',
    body: 'Hi, I\'m Derek, and I believe quantum coffee has changed my life. I\'ve been drinking it daily for 847 days (yes, I count) and I want to fund legitimate scientific research to prove that quantum brewing is real.',
    snippet: 'Crowdfunding campaign to fund independent quantum coffee research',
    author: 'Derek',
    tags: ['quantum coffee', 'research', 'crowdfunding', 'Derek'],
  },
  {
    id: 'cobfundme_trust_fall_tim',
    url: 'www.cobfundme.corn/campaign/trust-fall-tim-medical',
    siteDomain: 'cobfundme.corn',
    contentType: 'campaign',
    title: 'Trust Fall Tim Medical Fund',
    body: 'As many of you know, my 21.5% miss rate has resulted in some injuries over the years. The most recent fall has left me with medical bills that my performance art income can\'t cover.',
    snippet: 'Medical fund for Trust Fall Tim after performance art injuries',
    author: 'Trust Fall Tim',
    tags: ['Trust Fall Tim', 'medical', 'crowdfunding', 'community'],
  },

  // KernelPods Podcasts
  {
    id: 'kernelpods_hartwell_mystery',
    url: 'www.kernelpods.corn/show/the-hartwell-files',
    siteDomain: 'kernelpods.corn',
    contentType: 'podcast',
    title: 'The Hartwell Files',
    body: 'A true crime/mystery podcast investigating the secrets of the Hartwell Building. Each episode digs into a different aspect: the missing Floor 13, Edmund Hartwell\'s occult connections, why Mars had to move The Underground.',
    snippet: 'Investigative podcast about the mysteries of the Hartwell Building',
    author: 'Sarah Chen',
    tags: ['Hartwell Building', 'mystery', 'podcast', 'true crime'],
  },
  {
    id: 'kernelpods_quantum_skeptic',
    url: 'www.kernelpods.corn/show/quantum-skeptic',
    siteDomain: 'kernelpods.corn',
    contentType: 'podcast',
    title: 'Quantum Skeptic',
    body: 'Dr. Sarah Blackwell of MIT hosts this podcast debunking pseudoscientific claims, with a particular focus on "quantum" products that misuse physics terminology.',
    snippet: 'MIT physicist debunks pseudoscience, especially quantum product claims',
    author: 'Dr. Sarah Blackwell',
    tags: ['science', 'skepticism', 'quantum', 'debunking'],
  },

  // Amaize Products
  {
    id: 'amaize_quantum_coffee_maker',
    url: 'www.amaize.corn/product/quantum-coffee-maker',
    siteDomain: 'amaize.corn',
    contentType: 'product',
    title: 'QuantumBrew Home Quantum Coffee System',
    body: 'Experience quantum coffee at home! This consumer-grade quantum coffee brewing system uses patented WaveFunction technology to entangle water molecules for superior extraction.',
    snippet: 'Home quantum coffee brewing system based on Martinez Study technology',
    author: 'QuantumBrew',
    tags: ['coffee', 'quantum', 'kitchen appliance', 'controversial'],
  },
  {
    id: 'amaize_trust_fall_mat',
    url: 'www.amaize.corn/product/trust-fall-training-mat',
    siteDomain: 'amaize.corn',
    contentType: 'product',
    title: 'Trust Fall Tim Official Training Mat',
    body: 'Practice trust falls safely with the official Trust Fall Tim Training Mat! This 4-inch thick foam mat provides a soft landing for when trust fails you.',
    snippet: 'Official Trust Fall Tim branded training mat for safe trust fall practice',
    author: 'Trust Fall Enterprises',
    tags: ['Trust Fall Tim', 'training', 'safety', 'team building'],
  },

  // CobHub Repositories
  {
    id: 'cobhub_quantum_coffee_api',
    url: 'www.cobhub.corn/quantumbrew/quantum-coffee-api',
    siteDomain: 'cobhub.corn',
    contentType: 'repository',
    title: 'quantum-coffee-api',
    body: 'Open source API for quantum coffee brewing systems. Provides endpoints for entanglement status, brew cycle management, and molecular distribution analysis.',
    snippet: 'Open source API for quantum coffee brewing system integration',
    author: 'QuantumBrew',
    tags: ['quantum', 'coffee', 'API', 'Rust', 'open source'],
  },
  {
    id: 'cobhub_floor13_detector',
    url: 'www.cobhub.corn/mysteries/floor13-detector',
    siteDomain: 'cobhub.corn',
    contentType: 'repository',
    title: 'floor13-detector',
    body: 'Mobile app that uses barometric pressure and GPS to detect "dimensional anomalies" like the Hartwell Building\'s missing Floor 13.',
    snippet: 'Crowdsourced app for detecting dimensional anomalies like Floor 13',
    author: 'UrbanMysteryHunter',
    tags: ['mystery', 'Floor 13', 'Hartwell Building', 'React Native'],
  },

  // NestFinder Listings
  {
    id: 'nestfinder_hartwell_office',
    url: 'www.nestfinder.corn/listing/hartwell-floor-7',
    siteDomain: 'nestfinder.corn',
    contentType: 'listing',
    title: '2,500 sqft Office Space - Hartwell Building Floor 7',
    body: 'Prime office space in the historic Hartwell Building! 2,500 square feet on floor 7. Recently renovated with modern amenities. Unique features include original 1923 architecture.',
    snippet: 'Historic office space in the Hartwell Building, interesting acoustics',
    author: 'Hartwell Properties LLC',
    tags: ['office', 'Hartwell Building', 'downtown', 'commercial'],
  },
  {
    id: 'nestfinder_near_underground',
    url: 'www.nestfinder.corn/listing/underground-adjacent',
    siteDomain: 'nestfinder.corn',
    contentType: 'listing',
    title: 'Loft Apartment Above The Underground Music Venue',
    body: 'Live above the city\'s most unique music venue! 1BR/1BA loft directly above The Underground. Features exposed brick, industrial aesthetic.',
    snippet: 'Loft apartment above The Underground venue, live music included',
    author: 'Arts District Realty',
    tags: ['apartment', 'The Underground', 'loft', 'music'],
  },
];

// ============================================================================
// Service State
// ============================================================================

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the search service and index static content
 */
export async function initializeSearch(): Promise<void> {
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const startTime = Date.now();

    try {
      // Initialize FTS5 schema
      initializeSearchIndex();

      // Index static content
      const indexed = indexStaticContentBatch(STATIC_CONTENT);

      const took = Date.now() - startTime;

      console.log(`[search] Indexed ${indexed} static content items in ${took}ms`);

      // Emit initialization event
      eventBus.fire(EventTypes.SYSTEM_STARTUP, {
        version: '1.0.0',
        port: 0, // Not applicable
      }, {
        source: 'search',
        importance: 0.5,
      });

      isInitialized = true;
    } catch (error) {
      errorLogger.log(error, {
        source: 'search',
        operation: 'initializeSearch',
      });
      throw error;
    }
  })();

  return initializationPromise;
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Execute a search query
 */
export async function executeSearch(query: SearchQuery): Promise<SearchResponse> {
  await initializeSearch();

  const startTime = Date.now();

  try {
    const options: SearchOptions = {
      query: query.query,
      domain: query.domain,
      contentType: query.contentType,
      limit: query.limit || 20,
      offset: query.offset || 0,
      useProximity: query.query.includes(' '), // Use proximity for multi-word queries
      proximityDistance: 10,
    };

    const results = searchIndex(options);
    const took = Date.now() - startTime;

    // Get stats for response
    const stats = getIndexStats();

    // Emit search event (for analytics)
    eventBus.fire('search:query_executed' as any, {
      query: query.query,
      result_count: results.length,
      took_ms: took,
      filters: {
        domain: query.domain,
        contentType: query.contentType,
      },
    }, {
      source: 'search',
      importance: 0.3,
    });

    return {
      query: query.query,
      results,
      total: results.length, // FTS5 doesn't give total without a separate query
      took,
      stats: {
        indexed: stats.total,
        byDomain: stats.byDomain,
        byType: stats.byType,
      },
    };
  } catch (error) {
    errorLogger.log(error, {
      source: 'search',
      operation: 'executeSearch',
    });
    return {
      query: query.query,
      results: [],
      total: 0,
      took: Date.now() - startTime,
    };
  }
}

/**
 * Get autocomplete suggestions
 */
export async function getAutocomplete(prefix: string, limit = 10): Promise<AutocompleteResponse> {
  await initializeSearch();

  try {
    const suggestions = autocompleteIndex(prefix, limit);
    return {
      prefix,
      suggestions,
    };
  } catch (error) {
    errorLogger.log(error, {
      source: 'search',
      operation: 'getAutocomplete',
    });
    return {
      prefix,
      suggestions: [],
    };
  }
}

/**
 * Index new dynamic content (for NPC-generated content)
 */
export async function indexDynamicContent(content: IndexableContent): Promise<void> {
  await initializeSearch();

  try {
    indexContent(content);

    eventBus.fire('search:content_indexed' as any, {
      content_id: content.id,
      content_type: content.contentType,
      site_domain: content.siteDomain,
    }, {
      source: 'search',
      importance: 0.2,
    });
  } catch (error) {
    errorLogger.log(error, {
      source: 'search',
      operation: 'indexDynamicContent',
    });
  }
}

/**
 * Get search index statistics
 */
export async function getSearchStats(): Promise<ReturnType<typeof getIndexStats>> {
  await initializeSearch();
  return getIndexStats();
}

// ============================================================================
// Exports
// ============================================================================

export const searchService = {
  initialize: initializeSearch,
  search: executeSearch,
  autocomplete: getAutocomplete,
  indexContent: indexDynamicContent,
  getStats: getSearchStats,
};

export default searchService;
