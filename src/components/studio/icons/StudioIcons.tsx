/**
 * Studio SVG Icon System
 *
 * Monochrome SVG icons for the Creative Suite.
 * All icons are 20x20 by default, accept `size` and `color` props.
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaults: Required<Pick<IconProps, 'size' | 'color'>> = {
  size: 20,
  color: 'currentColor',
};

function svgProps({ size = defaults.size, color = defaults.color, className }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
}

// ============================================================================
// Tool Icons
// ============================================================================

export function PencilIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M13.5 3.5l3 3L6 17H3v-3L13.5 3.5z" />
    </svg>
  );
}

export function BrushIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M15.5 2.5c1.1 1.1 1.1 2.9 0 4L9 13l-3 1 1-3 6.5-6.5c1.1-1.1 2.9-1.1 4 0z" />
      <path d="M5 15c-1.5 0-3 1.5-3 3 2 0 3.5-1 3.5-2.5" />
    </svg>
  );
}

export function EraserIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M16 8l-5 5-4-4 5-5 4 4z" />
      <path d="M7 13l-3.5 3.5h7L13 14" />
      <line x1="3" y1="17" x2="17" y2="17" />
    </svg>
  );
}

export function LineIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <line x1="4" y1="16" x2="16" y2="4" />
    </svg>
  );
}

export function RectangleIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="4" width="14" height="12" rx="1" />
    </svg>
  );
}

export function EllipseIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <ellipse cx="10" cy="10" rx="7" ry="5" />
    </svg>
  );
}

export function FillIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M5 14l5.5-9.5L16 10l-5.5 9.5L5 14z" />
      <path d="M15 13c0 0 2 2.5 2 4s-1 2-2 2-2-.5-2-2 2-4 2-4z" fill={props.color || 'currentColor'} stroke="none" />
    </svg>
  );
}

export function EyedropperIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M15 2c1.1 0 2 .9 2 2 0 .5-.2 1-.5 1.4L10 12l-3 1 1-3 6.5-6.5c.4-.3.9-.5 1.5-.5z" />
      <path d="M6 14l-3 3" />
    </svg>
  );
}

export function SelectIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 4h3M13 4h3M4 4v3M16 4v3M4 13v3M16 13v3M4 16h3M13 16h3" strokeDasharray="0" />
    </svg>
  );
}

// ============================================================================
// UI Icons
// ============================================================================

export function LayersIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M10 2l8 4-8 4-8-4 8-4z" />
      <path d="M2 10l8 4 8-4" />
      <path d="M2 14l8 4 8-4" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 10a7 7 0 1 1 1 4" />
      <path d="M3 5v5h5" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

export function PropertiesIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <line x1="4" y1="6" x2="16" y2="6" />
      <line x1="4" y1="10" x2="16" y2="10" />
      <line x1="4" y1="14" x2="16" y2="14" />
      <circle cx="7" cy="6" r="1.5" fill={props.color || 'currentColor'} />
      <circle cx="12" cy="10" r="1.5" fill={props.color || 'currentColor'} />
      <circle cx="9" cy="14" r="1.5" fill={props.color || 'currentColor'} />
    </svg>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="3" width="16" height="14" rx="1" />
      <line x1="6" y1="3" x2="6" y2="17" />
      <line x1="10" y1="3" x2="10" y2="17" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M5 7l5 5 5-5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M7 5l5 5-5 5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M15 17H5a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v8a2 2 0 01-2 2z" />
      <path d="M13 17v-5H7v5" />
      <path d="M7 3v4h5" />
    </svg>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 8h10a3 3 0 0 1 0 6H11" />
      <path d="M7 5L4 8l3 3" />
    </svg>
  );
}

export function RedoIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M16 8H6a3 3 0 0 0 0 6h3" />
      <path d="M13 5l3 3-3 3" />
    </svg>
  );
}

export function ZoomInIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="9" cy="9" r="5" />
      <path d="M13 13l4 4" />
      <line x1="9" y1="7" x2="9" y2="11" />
      <line x1="7" y1="9" x2="11" y2="9" />
    </svg>
  );
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="9" cy="9" r="5" />
      <path d="M13 13l4 4" />
      <line x1="7" y1="9" x2="11" y2="9" />
    </svg>
  );
}

export function GenerateIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
      <path d="M15 13l.75 2.25L18 16l-2.25.75L15 19l-.75-2.25L12 16l2.25-.75L15 13z" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="4" width="12" height="12" rx="1" />
      <path d="M14 8l4-2v8l-4-2" />
    </svg>
  );
}

export function PublishIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 12v5a2 2 0 002 2h8a2 2 0 002-2v-5" />
      <path d="M10 3v10" />
      <path d="M7 6l3-3 3 3" />
    </svg>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2" y="3" width="16" height="14" rx="2" />
      <circle cx="7" cy="8" r="1.5" />
      <path d="M18 13l-4-4-6 6" />
    </svg>
  );
}
