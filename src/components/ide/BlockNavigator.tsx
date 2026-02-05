/**
 * Block Navigator - Sidebar showing STALK block status
 *
 * Vertical list of blocks with status indicators and click-to-scroll.
 */

import { THEME } from './stalk-theme.js'
import type { BlockInfo, BlockName, BlockStatus } from './types.js'

interface BlockNavigatorProps {
  blockInfos: BlockInfo[]
  cursorLine: number
  onClickBlock: (line: number) => void
}

const STATUS_COLORS: Record<BlockStatus, string> = {
  empty: THEME.textMuted,
  content: THEME.success,
  error: THEME.panic,
}

const BLOCK_LABELS: Record<BlockName, string> = {
  REQUIRE: 'REQ',
  CONFIG: 'CFG',
  OBSERVE: 'OBS',
  PREDICT: 'PRD',
  DECLARE: 'DCL',
  IMPACT: 'IMP',
  DISCLAIMER: 'DIS',
}

const BLOCK_DESCRIPTIONS: Record<BlockName, string> = {
  REQUIRE: 'Capabilities',
  CONFIG: 'Configuration',
  OBSERVE: 'Read State',
  PREDICT: 'Predictions',
  DECLARE: 'UI Layout',
  IMPACT: 'Side Effects',
  DISCLAIMER: 'Disclaimers',
}

function isCursorInBlock(cursorLine: number, block: BlockInfo): boolean {
  if (block.startLine === 0) return false
  return cursorLine >= block.startLine && cursorLine < block.startLine + block.lineCount
}

export function BlockNavigator({ blockInfos, cursorLine, onClickBlock }: BlockNavigatorProps) {
  // Filter to just the 7 ordered blocks
  const orderedBlocks: BlockName[] = ['REQUIRE', 'CONFIG', 'OBSERVE', 'PREDICT', 'DECLARE', 'IMPACT', 'DISCLAIMER']

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '8px',
    }}>
      <div style={{
        fontSize: '10px',
        fontFamily: "'Fira Code', monospace",
        color: THEME.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
        padding: '0 4px',
      }}>
        Blocks
      </div>

      {/* Flow indicator line */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        position: 'relative',
      }}>
        {/* Vertical flow line */}
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '16px',
          bottom: '16px',
          width: '1px',
          background: THEME.border,
          zIndex: 0,
        }} />

        {orderedBlocks.map((name) => {
          const info = blockInfos.find(b => b.name === name) || { name, status: 'empty' as const, startLine: 0, lineCount: 0 }
          const isActive = isCursorInBlock(cursorLine, info)
          const statusColor = STATUS_COLORS[info.status]
          const hasContent = info.status !== 'empty'

          return (
            <div
              key={name}
              onClick={() => info.startLine > 0 ? onClickBlock(info.startLine) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                borderRadius: '4px',
                cursor: hasContent ? 'pointer' : 'default',
                background: isActive ? THEME.bgElevated : 'transparent',
                border: isActive ? `1px solid ${THEME.borderFocus}` : '1px solid transparent',
                position: 'relative',
                zIndex: 1,
                fontSize: '11px',
                fontFamily: "'Fira Code', monospace",
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (hasContent) (e.currentTarget as HTMLDivElement).style.background = THEME.bgElevated
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
              }}
            >
              {/* Status dot */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusColor,
                flexShrink: 0,
                boxShadow: isActive ? `0 0 4px ${THEME.borderFocus}` : 'none',
              }} />

              {/* Label */}
              <div style={{
                flex: 1,
                color: hasContent ? THEME.text : THEME.textMuted,
              }}>
                {BLOCK_LABELS[name]}
              </div>

              {/* Line count */}
              {info.lineCount > 0 && (
                <div style={{
                  color: THEME.textMuted,
                  fontSize: '10px',
                }}>
                  {info.lineCount}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
