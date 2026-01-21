/**
 * InstaSnap Feed
 *
 * Main feed view with stories bar and photo posts.
 */

import { usePosts } from '../../../../stores/socialStore.js'
import { InstaSnapStoriesBar } from './InstaSnapStoriesBar.js'
import { InstaSnapPostCard } from './InstaSnapPostCard.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapFeedProps {
  onViewProfile: (profileId: string) => void
  onViewPost: (postId: string) => void
  onViewStory: (authorId: string) => void
}

export function InstaSnapFeed({ onViewProfile, onViewPost, onViewStory }: InstaSnapFeedProps) {
  // Get posts for instasnap platform, fall back to all posts if none exist
  const instaSnapPosts = usePosts('instasnap')
  const allPosts = usePosts()

  // Use instasnap posts if available, otherwise show all posts for demo
  const posts = instaSnapPosts.length > 0 ? instaSnapPosts : allPosts

  return (
    <div>
      {/* Stories Bar */}
      <InstaSnapStoriesBar onViewStory={onViewStory} />

      {/* Feed Posts */}
      <div className="divide-y" style={{ borderColor: INSTASNAP_THEME.border }}>
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="font-semibold mb-2" style={{ color: INSTASNAP_THEME.text }}>
              No Posts Yet
            </h3>
            <p className="text-sm" style={{ color: INSTASNAP_THEME.textMuted }}>
              Follow people to see their photos and videos here.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <InstaSnapPostCard
              key={post.id}
              post={post}
              onViewProfile={onViewProfile}
              onViewPost={onViewPost}
            />
          ))
        )}
      </div>

      {/* Suggestions */}
      {posts.length > 0 && (
        <div className="py-6 px-4">
          <p className="text-sm text-center" style={{ color: INSTASNAP_THEME.textMuted }}>
            You're all caught up from the past 3 days
          </p>
        </div>
      )}
    </div>
  )
}

export default InstaSnapFeed
