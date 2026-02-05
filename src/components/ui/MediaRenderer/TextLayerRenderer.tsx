/**
 * TextLayerRenderer
 *
 * Renders animated text segments with enter/exit effects.
 * Handles positioning, timing, and text animations.
 */

import { useMemo } from 'react';
import type { TextLayer, TextSegment, TextStyle, TextEffectType, TextPosition, SafeZone } from './types.js';

interface TextLayerRendererProps {
  layer: TextLayer;
  time: number;
  duration: number;
  safeZone: SafeZone;
  isPaused: boolean;
}

export function TextLayerRenderer({
  layer,
  time,
  duration,
  safeZone,
  isPaused,
}: TextLayerRendererProps) {
  // Find active segments
  const activeSegments = useMemo(() => {
    return layer.segments.filter((segment) => {
      const start = segment.start;
      const end = segment.end ?? (getNextSegmentStart(layer.segments, segment) ?? duration);
      return time >= start && time < end;
    });
  }, [layer.segments, time, duration]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        paddingTop: `${safeZone.top}%`,
        paddingBottom: `${safeZone.bottom}%`,
        paddingLeft: `${safeZone.left}%`,
        paddingRight: `${safeZone.right}%`,
      }}
    >
      {activeSegments.map((segment, index) => (
        <TextSegmentRenderer
          key={`${segment.start}-${segment.text.slice(0, 10)}`}
          segment={segment}
          defaultStyle={layer.default_style}
          time={time}
          duration={duration}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Text Segment Renderer
// ============================================================================

interface TextSegmentRendererProps {
  segment: TextSegment;
  defaultStyle?: TextStyle;
  time: number;
  duration: number;
}

function TextSegmentRenderer({
  segment,
  defaultStyle,
  time,
  duration,
}: TextSegmentRendererProps) {
  const style = { ...defaultStyle, ...segment.style };
  const enterEffect = segment.enter_effect ?? 'fade_in';

  // Calculate animation progress
  const segmentStart = segment.start;
  const enterDuration = getEnterDuration(enterEffect);
  const enterProgress = Math.min(1, (time - segmentStart) / enterDuration);

  // Get position styles
  const positionStyles = getPositionStyles(segment.position);

  // Get animation styles
  const animationStyles = getAnimationStyles(enterEffect, enterProgress, time);

  // Get text styles
  const textStyles = getTextStyles(style);

  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        ...positionStyles,
        ...animationStyles,
      }}
    >
      <TextContent
        text={segment.text}
        style={style}
        textStyles={textStyles}
        effect={enterEffect}
        progress={enterProgress}
        time={time}
      />
    </div>
  );
}

// ============================================================================
// Text Content (handles typewriter and special effects)
// ============================================================================

interface TextContentProps {
  text: string;
  style: TextStyle;
  textStyles: React.CSSProperties;
  effect: TextEffectType;
  progress: number;
  time: number;
}

function TextContent({ text, style, textStyles, effect, progress, time }: TextContentProps) {
  // Typewriter effect - reveal characters over time
  if (effect === 'typewriter') {
    const visibleChars = Math.floor(progress * text.length);
    const displayText = text.slice(0, visibleChars);
    const cursor = progress < 1 ? '|' : '';

    return (
      <span style={textStyles}>
        {displayText}
        <span className="animate-pulse">{cursor}</span>
      </span>
    );
  }

  // Word by word effect
  if (effect === 'word_by_word') {
    const words = text.split(' ');
    const visibleWords = Math.floor(progress * words.length);

    return (
      <span style={textStyles}>
        {words.slice(0, visibleWords).join(' ')}
      </span>
    );
  }

  // Rainbow effect - cycle colors
  if (effect === 'rainbow') {
    const hue = (time * 100) % 360;
    return (
      <span
        style={{
          ...textStyles,
          color: `hsl(${hue}, 80%, 60%)`,
          textShadow: `0 0 10px hsl(${hue}, 80%, 50%)`,
        }}
      >
        {text}
      </span>
    );
  }

  // Glitch effect - occasional character swaps
  if (effect === 'glitch') {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const glitchText = text
      .split('')
      .map((char, i) => {
        if (Math.random() < 0.1) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
      })
      .join('');

    return <span style={textStyles}>{glitchText}</span>;
  }

  // Default: just render the text
  return <span style={textStyles}>{text}</span>;
}

// ============================================================================
// Style Helpers
// ============================================================================

function getPositionStyles(position: TextPosition): React.CSSProperties {
  if (typeof position === 'object') {
    return {
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)',
    };
  }

  switch (position) {
    case 'top':
      return {
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        textAlign: 'center',
      };
    case 'center':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        textAlign: 'center',
      };
    case 'bottom':
      return {
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        textAlign: 'center',
      };
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
  }
}

function getTextStyles(style: TextStyle): React.CSSProperties {
  const sizeMap: Record<string, string> = {
    small: '1rem',
    medium: '1.5rem',
    large: '2.5rem',
    huge: '4rem',
  };

  const styles: React.CSSProperties = {
    fontFamily: style.font ?? 'system-ui, -apple-system, sans-serif',
    fontSize: sizeMap[style.size ?? 'medium'],
    color: style.color ?? '#ffffff',
    fontWeight: 'bold',
    lineHeight: 1.3,
    wordWrap: 'break-word',
  };

  // Text stroke
  if (style.stroke_color && style.stroke_width) {
    styles.WebkitTextStroke = `${style.stroke_width}px ${style.stroke_color}`;
    styles.paintOrder = 'stroke fill';
  }

  // Shadow
  if (style.shadow) {
    styles.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)';
  }

  // Background
  if (style.background) {
    styles.backgroundColor = style.background;
    styles.padding = `${style.padding ?? 8}px ${(style.padding ?? 8) * 2}px`;
    styles.borderRadius = '4px';
  }

  return styles;
}

function getAnimationStyles(
  effect: TextEffectType,
  progress: number,
  time: number
): React.CSSProperties {
  const eased = easeOutCubic(progress);

  switch (effect) {
    case 'none':
      return {};

    case 'fade_in':
      return { opacity: eased };

    case 'slam':
      const scale = 1 + (1 - eased) * 2;
      return {
        opacity: eased,
        transform: `scale(${scale})`,
      };

    case 'bounce':
      const bounceY = Math.sin(progress * Math.PI) * -20 * (1 - progress);
      return {
        opacity: eased,
        transform: `translateY(${bounceY}px)`,
      };

    case 'slide_up':
      const slideUpY = (1 - eased) * 50;
      return {
        opacity: eased,
        transform: `translateY(${slideUpY}px)`,
      };

    case 'slide_down':
      const slideDownY = (1 - eased) * -50;
      return {
        opacity: eased,
        transform: `translateY(${slideDownY}px)`,
      };

    case 'slide_left':
      const slideLeftX = (1 - eased) * 50;
      return {
        opacity: eased,
        transform: `translateX(${slideLeftX}px)`,
      };

    case 'slide_right':
      const slideRightX = (1 - eased) * -50;
      return {
        opacity: eased,
        transform: `translateX(${slideRightX}px)`,
      };

    case 'zoom_in':
      const zoomInScale = eased;
      return {
        opacity: eased,
        transform: `scale(${zoomInScale})`,
      };

    case 'zoom_out':
      const zoomOutScale = 2 - eased;
      return {
        opacity: eased,
        transform: `scale(${zoomOutScale})`,
      };

    case 'shake':
      const shakeX = Math.sin(time * 30) * 3;
      const shakeY = Math.cos(time * 25) * 2;
      return {
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      };

    case 'pulse':
      const pulseScale = 1 + Math.sin(time * 5) * 0.1;
      return {
        transform: `scale(${pulseScale})`,
      };

    case 'float':
      const floatY = Math.sin(time * 2) * 5;
      return {
        transform: `translateY(${floatY}px)`,
      };

    case 'typewriter':
    case 'word_by_word':
    case 'rainbow':
    case 'glitch':
      // These effects are handled in TextContent
      return { opacity: 1 };

    default:
      return { opacity: eased };
  }
}

function getEnterDuration(effect: TextEffectType): number {
  switch (effect) {
    case 'typewriter':
      return 1.5;
    case 'word_by_word':
      return 1.0;
    case 'slam':
      return 0.3;
    case 'bounce':
      return 0.5;
    case 'fade_in':
      return 0.5;
    default:
      return 0.5;
  }
}

function getNextSegmentStart(segments: TextSegment[], current: TextSegment): number | null {
  const currentIndex = segments.findIndex((s) => s === current);
  const nextSegment = segments[currentIndex + 1];
  return nextSegment?.start ?? null;
}

// Easing function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default TextLayerRenderer;
