/**
 * Reusable Context Menu Component
 *
 * Portal-rendered right-click context menu with keyboard navigation,
 * shortcut hints, sub-menus (1 level), and conditional visibility.
 * Use with the useContextMenu hook for easy state management.
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextMenuItem {
  /** Display label. Omit for separators. */
  label?: string
  /** Icon element (emoji or SVG) shown left of label */
  icon?: ReactNode
  /** Keyboard shortcut hint shown right-aligned (e.g., "Ctrl+C") */
  shortcut?: string
  /** Handler when clicked. Omit if item has children (sub-menu parent). */
  onClick?: () => void
  /** Gray out and prevent interaction */
  disabled?: boolean
  /** Render in red/destructive style */
  danger?: boolean
  /** If true, this entry is a visual separator line */
  separator?: boolean
  /** Set to false to hide this item entirely (default: true) */
  visible?: boolean
  /** Show a checkmark indicator */
  checked?: boolean
  /** Sub-menu items (max 1 level deep). Shows arrow indicator. */
  children?: ContextMenuItem[]
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  x: number
  y: number
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Sub-menu Panel (internal)
// ---------------------------------------------------------------------------

function SubMenuPanel({
  items,
  x,
  y,
  onSelect,
}: {
  items: ContextMenuItem[]
  x: number
  y: number
  onSelect: (item: ContextMenuItem) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const el = ref.current
    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${Math.max(8, x - rect.width - 4)}px`
    }
    if (rect.bottom > window.innerHeight - 8) {
      el.style.top = `${Math.max(8, window.innerHeight - rect.height - 8)}px`
    }
  }, [x, y])

  return (
    <div
      ref={ref}
      className="
        fixed z-[9998] min-w-[160px] max-w-[240px]
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-lg shadow-2xl
        py-1 animate-in fade-in zoom-in-95 duration-75
      "
      style={{ left: x, top: y }}
      role="menu"
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="my-1 border-t border-white/10" role="separator" />
        }
        return (
          <button
            key={i}
            role="menuitem"
            tabIndex={-1}
            onClick={() => !item.disabled && onSelect(item)}
            className={`
              w-full px-3 py-1.5 text-left text-sm flex items-center gap-2
              transition-colors outline-none
              ${item.disabled
                ? 'text-white/30 cursor-not-allowed'
                : item.danger
                  ? 'text-red-400 hover:bg-red-500/20'
                  : 'text-white/80 hover:bg-white/10'
              }
            `}
          >
            {item.checked !== undefined ? (
              <span className="w-4 text-center text-xs">{item.checked ? '\u2713' : ''}</span>
            ) : item.icon ? (
              <span className="w-4 text-center">{item.icon}</span>
            ) : (
              <span className="w-4" />
            )}
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut && (
              <span className="text-white/30 text-xs ml-4 shrink-0">{item.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const visibleItems = items.filter(item => item.visible !== false)

  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(-1)
  const [openSubMenu, setOpenSubMenu] = useState<{
    index: number
    x: number
    y: number
  } | null>(null)

  // Adjust main menu position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const el = menuRef.current
    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${Math.max(8, x - rect.width)}px`
    }
    if (rect.bottom > window.innerHeight - 8) {
      el.style.top = `${Math.max(8, y - rect.height)}px`
    }
  }, [x, y])

  // Close on outside click (capture phase)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [onClose])

  // Keyboard navigation
  useEffect(() => {
    const actionable = visibleItems
      .map((item, i) => (!item.separator ? i : -1))
      .filter(i => i !== -1)

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          if (openSubMenu) setOpenSubMenu(null)
          else onClose()
          break

        case 'ArrowDown': {
          e.preventDefault()
          const pos = actionable.indexOf(focusIndex)
          setFocusIndex(
            pos < actionable.length - 1 ? actionable[pos + 1] : actionable[0],
          )
          setOpenSubMenu(null)
          break
        }

        case 'ArrowUp': {
          e.preventDefault()
          const pos = actionable.indexOf(focusIndex)
          setFocusIndex(
            pos > 0 ? actionable[pos - 1] : actionable[actionable.length - 1],
          )
          setOpenSubMenu(null)
          break
        }

        case 'ArrowRight': {
          const item = visibleItems[focusIndex]
          if (item?.children?.length) {
            e.preventDefault()
            const el = menuRef.current?.querySelector<HTMLElement>(
              `[data-index="${focusIndex}"]`,
            )
            if (el) {
              const rect = el.getBoundingClientRect()
              setOpenSubMenu({ index: focusIndex, x: rect.right, y: rect.top })
            }
          }
          break
        }

        case 'ArrowLeft':
          if (openSubMenu) {
            e.preventDefault()
            setOpenSubMenu(null)
          }
          break

        case 'Enter': {
          e.preventDefault()
          const item = visibleItems[focusIndex]
          if (!item || item.disabled || item.separator) break
          if (item.children?.length) {
            const el = menuRef.current?.querySelector<HTMLElement>(
              `[data-index="${focusIndex}"]`,
            )
            if (el) {
              const rect = el.getBoundingClientRect()
              setOpenSubMenu({ index: focusIndex, x: rect.right, y: rect.top })
            }
          } else {
            item.onClick?.()
            onClose()
          }
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusIndex, openSubMenu, visibleItems, onClose])

  // Handle hover on menu items
  const handleMouseEnter = useCallback(
    (index: number) => {
      setFocusIndex(index)
      const item = visibleItems[index]
      if (item?.children?.length) {
        const el = menuRef.current?.querySelector<HTMLElement>(
          `[data-index="${index}"]`,
        )
        if (el) {
          const rect = el.getBoundingClientRect()
          setOpenSubMenu({ index, x: rect.right, y: rect.top })
        }
      } else {
        setOpenSubMenu(null)
      }
    },
    [visibleItems],
  )

  if (visibleItems.length === 0) return null

  // Get sub-menu items if open
  const subMenuItems = openSubMenu
    ? visibleItems[openSubMenu.index]?.children?.filter(i => i.visible !== false)
    : null

  return createPortal(
    <div ref={containerRef}>
      {/* Main menu */}
      <div
        ref={menuRef}
        className="
          fixed z-[9998] min-w-[180px] max-w-[280px]
          bg-[#1a1a2e]/95 backdrop-blur-xl
          border border-white/10 rounded-lg shadow-2xl
          py-1 animate-in fade-in zoom-in-95 duration-100
        "
        style={{ left: x, top: y }}
        role="menu"
      >
        {visibleItems.map((item, i) => {
          if (item.separator) {
            return (
              <div key={`sep-${i}`} className="my-1 border-t border-white/10" role="separator" />
            )
          }

          const isFocused = focusIndex === i
          const hasChildren = !!(item.children && item.children.length > 0)

          return (
            <button
              key={i}
              data-index={i}
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                if (item.disabled || hasChildren) return
                item.onClick?.()
                onClose()
              }}
              onMouseEnter={() => handleMouseEnter(i)}
              className={`
                w-full px-3 py-1.5 text-left text-sm flex items-center gap-2
                transition-colors outline-none
                ${item.disabled
                  ? 'text-white/30 cursor-not-allowed'
                  : item.danger
                    ? isFocused
                      ? 'text-red-300 bg-red-500/20'
                      : 'text-red-400 hover:bg-red-500/20'
                    : isFocused
                      ? 'text-white/90 bg-white/10'
                      : 'text-white/80 hover:bg-white/10'
                }
              `}
            >
              {/* Icon / checkmark column */}
              {item.checked !== undefined ? (
                <span className="w-4 text-center text-xs">
                  {item.checked ? '\u2713' : ''}
                </span>
              ) : item.icon ? (
                <span className="w-4 text-center">{item.icon}</span>
              ) : (
                <span className="w-4" />
              )}

              {/* Label */}
              <span className="flex-1 truncate">{item.label}</span>

              {/* Shortcut or sub-menu arrow */}
              {hasChildren ? (
                <span className="text-white/40 text-xs ml-2">{'\u203A'}</span>
              ) : item.shortcut ? (
                <span className="text-white/30 text-xs ml-4 shrink-0">
                  {item.shortcut}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Sub-menu (1 level max) */}
      {subMenuItems && subMenuItems.length > 0 && openSubMenu && (
        <SubMenuPanel
          items={subMenuItems}
          x={openSubMenu.x}
          y={openSubMenu.y}
          onSelect={item => {
            item.onClick?.()
            onClose()
          }}
        />
      )}
    </div>,
    document.body,
  )
}
