/**
 * Studio Context
 *
 * Shared state for the Creative Studio window with draft persistence.
 * Stores asset IDs as references, not full objects.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type Dispatch,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type StudioMode = 'generate' | 'video' | 'compose' | 'library';

export type AssetSource = 'all' | 'generated' | 'imported' | 'npc' | 'system';
export type AssetUsage = 'all' | 'used' | 'unused';

export interface AssetFilters {
  source: AssetSource;
  usage: AssetUsage;
  search: string;
}

export interface StudioDraft {
  mediaIds: string[];
  videoConfigId?: string;
  caption: string;
  platforms: ('myface' | 'chirp' | 'instasnap')[];
}

export interface PendingGeneration {
  requestId: string;
  prompt: string;
  startedAt: number;
}

export interface StudioBudget {
  spent: number;
  remaining: number;
  costPerImage: number;
}

export interface StudioState {
  activeMode: StudioMode;

  // Asset Library
  filters: AssetFilters;
  selectedAssetIds: string[];

  // Current Draft (persisted)
  currentDraft: StudioDraft;

  // Generation state
  pendingGeneration: PendingGeneration | null;
  recentGenerationIds: string[];

  // Budget
  budget: StudioBudget | null;
}

// ============================================================================
// Actions
// ============================================================================

export type StudioAction =
  | { type: 'SET_MODE'; payload: StudioMode }
  | { type: 'SET_FILTERS'; payload: Partial<AssetFilters> }
  | { type: 'SELECT_ASSET'; payload: string }
  | { type: 'DESELECT_ASSET'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_TO_DRAFT'; payload: string }
  | { type: 'REMOVE_FROM_DRAFT'; payload: string }
  | { type: 'SET_VIDEO_CONFIG'; payload: string | undefined }
  | { type: 'SET_CAPTION'; payload: string }
  | { type: 'TOGGLE_PLATFORM'; payload: 'myface' | 'chirp' | 'instasnap' }
  | { type: 'CLEAR_DRAFT' }
  | { type: 'RESTORE_DRAFT'; payload: StudioDraft }
  | { type: 'SET_PENDING_GENERATION'; payload: PendingGeneration | null }
  | { type: 'ADD_RECENT_GENERATION'; payload: string }
  | { type: 'SET_BUDGET'; payload: StudioBudget | null }
  | { type: 'BATCH_UPDATE'; payload: Partial<StudioDraft> };

// ============================================================================
// Initial State
// ============================================================================

const EMPTY_DRAFT: StudioDraft = {
  mediaIds: [],
  videoConfigId: undefined,
  caption: '',
  platforms: ['myface'],
};

const initialState: StudioState = {
  activeMode: 'generate',
  filters: {
    source: 'all',
    usage: 'all',
    search: '',
  },
  selectedAssetIds: [],
  currentDraft: { ...EMPTY_DRAFT },
  pendingGeneration: null,
  recentGenerationIds: [],
  budget: null,
};

// ============================================================================
// Reducer
// ============================================================================

function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, activeMode: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'SELECT_ASSET':
      if (state.selectedAssetIds.includes(action.payload)) return state;
      return { ...state, selectedAssetIds: [...state.selectedAssetIds, action.payload] };

    case 'DESELECT_ASSET':
      return {
        ...state,
        selectedAssetIds: state.selectedAssetIds.filter((id) => id !== action.payload),
      };

    case 'CLEAR_SELECTION':
      return { ...state, selectedAssetIds: [] };

    case 'ADD_TO_DRAFT':
      if (state.currentDraft.mediaIds.includes(action.payload)) return state;
      return {
        ...state,
        currentDraft: {
          ...state.currentDraft,
          mediaIds: [...state.currentDraft.mediaIds, action.payload],
        },
      };

    case 'REMOVE_FROM_DRAFT':
      return {
        ...state,
        currentDraft: {
          ...state.currentDraft,
          mediaIds: state.currentDraft.mediaIds.filter((id) => id !== action.payload),
        },
      };

    case 'SET_VIDEO_CONFIG':
      return {
        ...state,
        currentDraft: { ...state.currentDraft, videoConfigId: action.payload },
      };

    case 'SET_CAPTION':
      return {
        ...state,
        currentDraft: { ...state.currentDraft, caption: action.payload },
      };

    case 'TOGGLE_PLATFORM': {
      const platforms = state.currentDraft.platforms.includes(action.payload)
        ? state.currentDraft.platforms.filter((p) => p !== action.payload)
        : [...state.currentDraft.platforms, action.payload];
      // Ensure at least one platform is selected
      if (platforms.length === 0) return state;
      return { ...state, currentDraft: { ...state.currentDraft, platforms } };
    }

    case 'CLEAR_DRAFT':
      return { ...state, currentDraft: { ...EMPTY_DRAFT } };

    case 'RESTORE_DRAFT':
      return { ...state, currentDraft: action.payload };

    case 'SET_PENDING_GENERATION':
      return { ...state, pendingGeneration: action.payload };

    case 'ADD_RECENT_GENERATION':
      return {
        ...state,
        recentGenerationIds: [action.payload, ...state.recentGenerationIds.slice(0, 19)],
      };

    case 'SET_BUDGET':
      return { ...state, budget: action.payload };

    case 'BATCH_UPDATE':
      return {
        ...state,
        currentDraft: { ...state.currentDraft, ...action.payload },
      };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface StudioContextValue {
  state: StudioState;
  dispatch: Dispatch<StudioAction>;

  // Convenience methods
  setMode: (mode: StudioMode) => void;
  selectAsset: (id: string) => void;
  deselectAsset: (id: string) => void;
  addToDraft: (id: string) => void;
  removeFromDraft: (id: string) => void;
  setCaption: (caption: string) => void;
  togglePlatform: (platform: 'myface' | 'chirp' | 'instasnap') => void;
  clearDraft: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

const DRAFT_STORAGE_KEY = 'engaige-studio-draft';
const DRAFT_SAVE_DEBOUNCE_MS = 500;

interface StudioProviderProps {
  children: ReactNode;
}

export function StudioProvider({ children }: StudioProviderProps) {
  const [state, dispatch] = useReducer(studioReducer, initialState);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StudioDraft;
        // Validate structure
        if (
          Array.isArray(parsed.mediaIds) &&
          typeof parsed.caption === 'string' &&
          Array.isArray(parsed.platforms)
        ) {
          dispatch({ type: 'RESTORE_DRAFT', payload: parsed });
        }
      }
    } catch (e) {
      console.warn('[Studio] Failed to restore draft from localStorage:', e);
    }
  }, []);

  // Debounced save to localStorage when draft changes
  useEffect(() => {
    // Skip initial render
    if (!initialLoadDone.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state.currentDraft));
      } catch (e) {
        console.warn('[Studio] Failed to save draft to localStorage:', e);
      }
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.currentDraft]);

  // Convenience methods
  const setMode = useCallback((mode: StudioMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const selectAsset = useCallback((id: string) => {
    dispatch({ type: 'SELECT_ASSET', payload: id });
  }, []);

  const deselectAsset = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_ASSET', payload: id });
  }, []);

  const addToDraft = useCallback((id: string) => {
    dispatch({ type: 'ADD_TO_DRAFT', payload: id });
  }, []);

  const removeFromDraft = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_DRAFT', payload: id });
  }, []);

  const setCaption = useCallback((caption: string) => {
    dispatch({ type: 'SET_CAPTION', payload: caption });
  }, []);

  const togglePlatform = useCallback((platform: 'myface' | 'chirp' | 'instasnap') => {
    dispatch({ type: 'TOGGLE_PLATFORM', payload: platform });
  }, []);

  const clearDraft = useCallback(() => {
    dispatch({ type: 'CLEAR_DRAFT' });
    // Also clear from localStorage
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }, []);

  const value: StudioContextValue = {
    state,
    dispatch,
    setMode,
    selectAsset,
    deselectAsset,
    addToDraft,
    removeFromDraft,
    setCaption,
    togglePlatform,
    clearDraft,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}

export default StudioContext;
