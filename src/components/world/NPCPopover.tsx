/**
 * NPC Popover
 *
 * Shows NPC info on hover. Rich card for AI NPCs, simple tooltip for background NPCs.
 */

import { useEffect, useState } from 'react';
import { useWorldStore } from '../../stores/worldStore.js';
import { useWSStore } from '../../stores/wsStore.js';

interface NPCPopoverProps {
  npcId: string;
  position: { x: number; y: number };
}

interface NPCData {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  occupation?: string;
}

export default function NPCPopover({ npcId, position }: NPCPopoverProps) {
  const { aiNPCs, backgroundNPCs, getBuilding, getLandmarkByBuildingId } = useWorldStore();
  const { request } = useWSStore();

  const [npcData, setNPCData] = useState<NPCData | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if this is an AI NPC or background NPC
  const aiNPC = aiNPCs.find((n) => n.npcId === npcId);
  const bgNPC = backgroundNPCs.find((n) => n.id === npcId);

  const isAINPC = !!aiNPC;
  const isBackgroundNPC = !!bgNPC;

  // Fetch AI NPC data if needed
  useEffect(() => {
    if (!isAINPC || npcData) return;

    const fetchNPCData = async () => {
      setLoading(true);
      try {
        const response = await request('npc:getById', { id: npcId });
        if (response.success && response.payload) {
          setNPCData(response.payload as NPCData);
        }
      } catch (err) {
        console.error('[NPCPopover] Failed to fetch NPC data:', err);
      }
      setLoading(false);
    };

    fetchNPCData();
  }, [npcId, isAINPC, request]);

  // Get building info for AI NPC
  const building = aiNPC?.buildingId ? getBuilding(aiNPC.buildingId) : null;
  const landmark = building ? getLandmarkByBuildingId(building.id) : null;

  // Position the popover
  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x + 15,
    top: position.y - 10,
    zIndex: 1000,
  };

  // Keep popover on screen
  if (position.x > window.innerWidth - 250) {
    style.left = position.x - 250;
  }
  if (position.y > window.innerHeight - 200) {
    style.top = position.y - 200;
  }

  // Background NPC - Simple tooltip
  if (isBackgroundNPC && bgNPC) {
    return (
      <div
        style={style}
        className="bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded px-3 py-2 shadow-lg pointer-events-none"
      >
        <div className="text-sm text-[var(--color-text)]">
          {bgNPC.name}, {bgNPC.activityLabel}
        </div>
      </div>
    );
  }

  // AI NPC - Rich card
  if (isAINPC && aiNPC) {
    return (
      <div
        style={style}
        className="bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded-lg shadow-lg w-60 pointer-events-none"
      >
        {/* Header */}
        <div className="p-3 border-b border-[var(--color-border)]">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-[var(--color-bgTertiary)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {npcData?.avatar_url ? (
                <img
                  src={npcData.avatar_url}
                  alt={npcData.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {(npcData?.display_name || 'NPC')[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Name & Status */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[var(--color-text)] truncate">
                {loading ? 'Loading...' : npcData?.display_name || 'Unknown'}
              </div>
              <div className="text-xs text-[var(--color-textMuted)] truncate">
                {npcData?.occupation || 'Resident'}
              </div>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="p-3 space-y-2">
          {/* Current Activity */}
          <div className="flex items-center gap-2 text-sm">
            <ActivityIcon activity={aiNPC.activity} />
            <span className="text-[var(--color-text)]">
              {aiNPC.activityDescription || formatActivity(aiNPC.activity)}
            </span>
          </div>

          {/* Location */}
          {building && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-textMuted)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {landmark?.iconEmoji && `${landmark.iconEmoji} `}
                {building.name}
              </span>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="px-3 pb-2 text-xs text-[var(--color-textMuted)]">
          Click to open profile
        </div>
      </div>
    );
  }

  // Unknown NPC
  return null;
}

// ============================================================================
// Helpers
// ============================================================================

function formatActivity(activity: string): string {
  switch (activity) {
    case 'at_home':
      return 'At home';
    case 'at_work':
      return 'Working';
    case 'walking':
      return 'Walking';
    case 'commuting':
      return 'Commuting';
    case 'socializing':
      return 'Hanging out';
    case 'inside_building':
      return 'Inside';
    case 'idle':
      return 'Idle';
    default:
      return activity;
  }
}

function ActivityIcon({ activity }: { activity: string }) {
  const iconClass = "w-4 h-4 text-[var(--color-textMuted)]";

  switch (activity) {
    case 'at_home':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'at_work':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'walking':
    case 'commuting':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'socializing':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}
