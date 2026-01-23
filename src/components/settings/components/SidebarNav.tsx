/**
 * Sidebar navigation item definition
 */
export interface SidebarNavItem<T extends string = string> {
  /** Unique identifier for the nav item */
  id: T
  /** Display label */
  label: string
  /** Emoji or icon to display */
  icon: string
}

/**
 * Props for the SidebarNav component
 */
interface SidebarNavProps<T extends string = string> {
  /** Array of navigation items */
  items: SidebarNavItem<T>[]
  /** Currently active item ID */
  activeItem: T
  /** Callback when an item is clicked */
  onItemClick: (id: T) => void
}

/**
 * SidebarNav Component
 *
 * A vertical navigation sidebar with icon and label support. Active item
 * is highlighted with a border and background color. Uses CSS variables for theming.
 *
 * Usage:
 * ```tsx
 * const navItems = [
 *   { id: 'display', label: 'Display', icon: '🖥️' },
 *   { id: 'audio', label: 'Audio', icon: '🔊' },
 * ]
 *
 * <SidebarNav
 *   items={navItems}
 *   activeItem={activeTab}
 *   onItemClick={setActiveTab}
 * />
 * ```
 */
export function SidebarNav<T extends string = string>({
  items,
  activeItem,
  onItemClick,
}: SidebarNavProps<T>) {
  return (
    <nav
      className="w-48 p-4 overflow-y-auto"
      style={{
        background: 'var(--color-bgSecondary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="w-full px-4 py-3 rounded text-left flex items-center gap-3 transition-all"
          style={{
            background: activeItem === item.id ? 'var(--color-primary)/10' : 'transparent',
            color: activeItem === item.id ? 'var(--color-primary)' : 'var(--color-text)',
            borderLeft: activeItem === item.id ? '3px solid var(--color-primary)' : '3px solid transparent',
            marginTop: '2px',
            marginBottom: '2px',
          }}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
