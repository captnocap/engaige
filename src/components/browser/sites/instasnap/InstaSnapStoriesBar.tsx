/**
 * InstaSnap Stories Bar
 *
 * Horizontal scrollable stories bar at the top of the feed.
 */

import { useInstaSnapStore } from '../../../../stores/instaSnapStore.js'
import { usePlayerProfile } from '../../../../stores/socialStore.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapStoriesBarProps {
  onViewStory: (authorId: string) => void
}

export function InstaSnapStoriesBar({ onViewStory }: InstaSnapStoriesBarProps) {
  const playerProfile = usePlayerProfile()
  const { getActiveStories, hasViewedStory } = useInstaSnapStore()
  const activeStories = getActiveStories()

  // Group stories by author
  const storyAuthors = activeStories.reduce((acc, story) => {
    if (!acc[story.authorId]) {
      acc[story.authorId] = {
        author: story.author,
        stories: [],
        hasUnviewed: false,
      }
    }
    acc[story.authorId].stories.push(story)
    if (!hasViewedStory(story.id)) {
      acc[story.authorId].hasUnviewed = true
    }
    return acc
  }, {} as Record<string, { author: typeof activeStories[0]['author'], stories: typeof activeStories, hasUnviewed: boolean }>)

  const authorsList = Object.entries(storyAuthors)

  return (
    <div
      className="border-b py-4 px-2"
      style={{
        background: INSTASNAP_THEME.cardBg,
        borderColor: INSTASNAP_THEME.border,
      }}
    >
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Your Story */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2"
              style={{
                background: INSTASNAP_THEME.background,
                borderColor: INSTASNAP_THEME.border,
              }}
            >
              {playerProfile.avatar || playerProfile.name[0]}
            </div>
            <button
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
              style={{ background: INSTASNAP_THEME.primary }}
            >
              +
            </button>
          </div>
          <span
            className="text-[11px] mt-1 max-w-[64px] truncate"
            style={{ color: INSTASNAP_THEME.text }}
          >
            Your Story
          </span>
        </div>

        {/* Other Stories */}
        {authorsList.map(([authorId, data]) => (
          <StoryAvatar
            key={authorId}
            authorId={authorId}
            author={data.author}
            hasUnviewed={data.hasUnviewed}
            storyCount={data.stories.length}
            onClick={() => onViewStory(authorId)}
          />
        ))}

        {/* Empty state */}
        {authorsList.length === 0 && (
          <div className="flex items-center px-4">
            <p className="text-sm" style={{ color: INSTASNAP_THEME.textMuted }}>
              No stories yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Story Avatar Component
// ============================================================================

interface StoryAvatarProps {
  authorId: string
  author: {
    name: string
    username: string
    avatar?: string
  }
  hasUnviewed: boolean
  storyCount: number
  onClick: () => void
}

function StoryAvatar({ author, hasUnviewed, onClick }: StoryAvatarProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center shrink-0 group"
    >
      <div
        className="w-16 h-16 rounded-full p-[2px] transition-transform group-hover:scale-105"
        style={{
          background: hasUnviewed ? INSTASNAP_THEME.gradient : INSTASNAP_THEME.border,
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-2xl border-2"
          style={{
            background: INSTASNAP_THEME.cardBg,
            borderColor: INSTASNAP_THEME.cardBg,
          }}
        >
          {author.avatar || author.name[0]}
        </div>
      </div>
      <span
        className="text-[11px] mt-1 max-w-[64px] truncate"
        style={{ color: hasUnviewed ? INSTASNAP_THEME.text : INSTASNAP_THEME.textMuted }}
      >
        {author.username}
      </span>
    </button>
  )
}

export default InstaSnapStoriesBar
