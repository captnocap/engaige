/**
 * MyFace Site
 *
 * The OG social network - early 2000s aesthetic.
 * Includes feed, profiles, and messaging.
 *
 * Refactored to use shared UI components: StyledCard, Button, Avatar, MetaRow
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { MessageThread as MessageThreadComponent } from '../../ui/Message/MessageThread.js'
import { TypingIndicator } from '../../ui/Message/TypingIndicator.js'
import { MESSAGE_CSS_VARS } from '../../ui/Message/styles.js'
import type { MessageStyleConfig } from '../../ui/Message/types.js'
import { StyledCard, Button, Avatar, MetaRow, type MetaRowItem } from '../../ui/shared/index.js'
import {
  useConversationStore,
  useConversations,
  useConversationMessages,
  useTypingIndicator,
} from '../../../stores/conversationStore.js'
import {
  useSocialStore,
  usePosts,
  usePlayerProfile,
  type SocialProfile,
  type Post,
} from '../../../stores/socialStore.js'
import { useNPCStore, useNPC, useNPCsOnDatingSite } from '../../../stores/npcStore.js'
import { APP_REGISTRY, type AccessLevel } from '../../../config/app-registry.js'
import { useDatingStore, useMatches, usePendingCelebration } from '../../../stores/datingStore.js'
import { getDatingSite } from '../../../config/dating-registry.js'
import { DatingCard } from '../../dating/DatingCard.js'
import { MatchModal } from '../../dating/MatchModal.js'

// MyFace color scheme
const MYFACE_COLORS = {
  primary: '#003366',
  accent: '#FF6600',
  bg: 'white',
  border: '#ccc',
}

// MyFace style configuration for browser (uses myspace style for early 2000s aesthetic)
const MYFACE_CONFIG: MessageStyleConfig = {
  variant: 'myspace',
  layout: 'flat',
  alignment: 'left',
  showAvatar: true,
  showTimestamp: true,
  showStatus: false,
  showReadReceipts: false,
  showReactions: true,
  showUsername: true,
  groupByTime: true,
  groupTimeWindow: 10 * 60 * 1000,
  avatarSize: 'md',
  timestampFormat: 'relative',
  currentUserId: 'player',
}

type MyFaceView = 'home' | 'profile' | 'messages' | 'browse' | 'dating'

export function MyFaceSite({ siteId, path, onPathChange }: SiteProps) {
  const [currentView, setCurrentView] = useState<MyFaceView>(
    siteId === 'myface-chat' ? 'messages' : 'home'
  )
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const playerProfile = usePlayerProfile()
  const { initialize } = useSocialStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    if (!path) {
      setCurrentView('home')
      setSelectedProfileId(null)
    } else if (path.startsWith('/profile/')) {
      const profileId = path.slice(9)
      setSelectedProfileId(profileId)
      setCurrentView('profile')
    } else if (path === '/messages') {
      setCurrentView('messages')
      setSelectedProfileId(null)
    } else if (path === '/browse') {
      setCurrentView('browse')
      setSelectedProfileId(null)
    } else if (path === '/dating') {
      setCurrentView('dating')
      setSelectedProfileId(null)
    } else {
      setCurrentView('home')
      setSelectedProfileId(null)
    }
  }, [path])

  // Navigation handlers that update both state and path
  const handleNavigateView = useCallback((view: MyFaceView) => {
    setCurrentView(view)
    setSelectedProfileId(null)
    if (view === 'home') {
      onPathChange(null)
    } else {
      onPathChange('/' + view)
    }
  }, [onPathChange])

  const handleViewProfile = useCallback((profileId: string) => {
    setSelectedProfileId(profileId)
    setCurrentView('profile')
    onPathChange('/profile/' + profileId)
  }, [onPathChange])

  return (
    <div className="min-h-full pb-8" style={{ background: '#336699' }}>
      {/* MyFace Header */}
      <header
        className="px-4 py-2 sticky top-0 z-10"
        style={{
          background: 'linear-gradient(180deg, #003366 0%, #336699 100%)',
          borderBottom: '2px solid #FF6600',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavigateView('home')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
              My<span style={{ color: '#FF6600' }}>Face</span>
            </span>
            <span className="text-xs text-white/60">a place for friends</span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {(['home', 'browse', 'dating', 'messages'] as MyFaceView[]).map((view) => (
              <button
                key={view}
                onClick={() => handleNavigateView(view)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentView === view
                    ? 'bg-[#FF6600] text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>

          {/* User */}
          <button
            onClick={() => handleViewProfile('player')}
            className="flex items-center gap-2 hover:bg-white/10 rounded px-2 py-1 transition-colors"
          >
            <span className="text-sm text-white/80">Hello, {playerProfile.name}!</span>
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white text-sm">
              {playerProfile.avatar || playerProfile.name[0]}
            </div>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-4 px-4">
        {currentView === 'home' && <MyFaceHome onViewProfile={handleViewProfile} />}
        {currentView === 'browse' && <MyFaceBrowse onViewProfile={handleViewProfile} />}
        {currentView === 'dating' && <MyFaceDating onViewProfile={handleViewProfile} />}
        {currentView === 'messages' && <MyFaceMessages />}
        {currentView === 'profile' && selectedProfileId && (
          <MyFaceProfile
            profileId={selectedProfileId}
            onBack={() => handleNavigateView('home')}
            onViewProfile={handleViewProfile}
          />
        )}
      </main>
    </div>
  )
}

function MyFaceHome({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  const [postContent, setPostContent] = useState('')
  const playerProfile = usePlayerProfile()
  const posts = usePosts('myface')
  const { createPost, likePost, unlikePost, profiles } = useSocialStore()

  const handlePost = () => {
    if (!postContent.trim()) return
    createPost(postContent.trim())
    setPostContent('')
  }

  const topFriends = Object.values(profiles).slice(0, 8)

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left Column - User Info */}
      <div className="space-y-4">
        {/* Player Card */}
        <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
          <div className="flex items-center gap-3 mb-3">
            <Avatar size="lg" initials={playerProfile.avatar} shape="rounded" />
            <div>
              <h2 className="font-bold" style={{ color: MYFACE_COLORS.primary }}>{playerProfile.name}</h2>
              <p className="text-xs text-gray-500">"{playerProfile.bio}"</p>
            </div>
          </div>
          <div className="text-xs space-y-1 text-gray-600">
            <p><strong>Mood:</strong> {playerProfile.moodEmoji} {playerProfile.mood}</p>
            <p className="text-green-600"><strong>Online Now!</strong></p>
          </div>
          <Button
            size="xs"
            variant="link"
            textColor={MYFACE_COLORS.primary}
            onClick={() => onViewProfile('player')}
            className="mt-3"
          >
            View My Profile →
          </Button>
        </StyledCard>

        {/* Top 8 Friends */}
        <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
          <h3 className="font-bold mb-2 text-sm" style={{ color: MYFACE_COLORS.primary }}>
            {playerProfile.name}'s Top 8
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {topFriends.map((friend) => (
              <Button
                key={friend.id}
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile(friend.id)}
                className="aspect-square flex flex-col items-center justify-center text-xs p-1"
                style={{ background: '#f0f0f0' }}
              >
                <span className="text-lg">{friend.avatar}</span>
                <span className="truncate w-full text-center text-[10px] text-gray-600 mt-1">
                  {friend.name}
                </span>
              </Button>
            ))}
            {Array.from({ length: Math.max(0, 8 - topFriends.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
              >
                +
              </div>
            ))}
          </div>
        </StyledCard>

        {/* Stats */}
        <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
          <h3 className="font-bold mb-2 text-sm" style={{ color: MYFACE_COLORS.primary }}>My Stats</h3>
          <div className="text-xs space-y-1 text-gray-600">
            <p>Profile Views: <strong>1,337</strong></p>
            <p>Friends: <strong>{Object.keys(profiles).length}</strong></p>
            <p>Posts: <strong>{posts.filter(p => p.authorId === 'player').length}</strong></p>
          </div>
        </StyledCard>
      </div>

      {/* Center Column - Feed */}
      <div className="col-span-2 space-y-4">
        {/* Post something */}
        <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
          <h3 className="font-bold mb-2 text-sm" style={{ color: MYFACE_COLORS.primary }}>Post a Bulletin</h3>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none"
            style={{ borderColor: MYFACE_COLORS.border, color: '#333' }}
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              backgroundColor={MYFACE_COLORS.accent}
              textColor="white"
              onClick={handlePost}
              disabled={!postContent.trim()}
            >
              Post
            </Button>
          </div>
        </StyledCard>

        {/* Feed */}
        <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
          <h3 className="font-bold mb-3 pb-2 border-b border-gray-200" style={{ color: MYFACE_COLORS.primary }}>
            Bulletin Board
          </h3>

          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No bulletins yet. Be the first to post!
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => post.likes.includes('player') ? unlikePost(post.id) : likePost(post.id)}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          )}
        </StyledCard>
      </div>
    </div>
  )
}

interface PostCardProps {
  post: Post
  onLike: () => void
  onViewProfile: (id: string) => void
}

function PostCard({ post, onLike, onViewProfile }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const { addComment } = useSocialStore()
  const isLiked = post.likes.includes('player')

  const handleComment = () => {
    if (!commentText.trim()) return
    addComment(post.id, commentText.trim())
    setCommentText('')
  }

  const metaItems: MetaRowItem[] = [
    { value: post.author.name, onClick: () => onViewProfile(post.authorId) },
    { value: formatRelativeTime(new Date(post.timestamp)) },
  ]

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar
          size="sm"
          initials={post.author.avatar || post.author.name[0]}
          onClick={() => onViewProfile(post.authorId)}
          bgColor="#e5e7eb"
        />
        <div className="flex-1 min-w-0">
          <MetaRow items={metaItems} textColor={MYFACE_COLORS.primary} mutedColor="#9ca3af" />
          <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <Button
              size="xs"
              variant="ghost"
              textColor={isLiked ? MYFACE_COLORS.accent : MYFACE_COLORS.primary}
              onClick={onLike}
            >
              {isLiked ? '❤️' : '🤍'} {post.likes.length > 0 && post.likes.length} Kudos
            </Button>
            <Button
              size="xs"
              variant="link"
              textColor={MYFACE_COLORS.primary}
              onClick={() => setShowComments(!showComments)}
            >
              💬 {post.comments.length > 0 && post.comments.length} Comments
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-3 pl-3 border-l-2 border-gray-200">
              {post.comments.map((comment) => (
                <div key={comment.id} className="py-2">
                  <MetaRow
                    items={[
                      { value: comment.author.name, onClick: () => onViewProfile(comment.authorId) },
                      { value: formatRelativeTime(new Date(comment.timestamp)) },
                    ]}
                    textColor={MYFACE_COLORS.primary}
                    mutedColor="#9ca3af"
                    textSize="xs"
                  />
                  <p className="text-xs text-gray-600 mt-1">{comment.content}</p>
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none"
                  style={{ borderColor: MYFACE_COLORS.border, color: '#333' }}
                />
                <Button
                  size="xs"
                  backgroundColor={MYFACE_COLORS.accent}
                  textColor="white"
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MyFaceBrowse({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  const { profiles } = useSocialStore()
  const profileList = Object.values(profiles)

  return (
    <div className="space-y-4">
      <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
        <h3 className="font-bold mb-4" style={{ color: MYFACE_COLORS.primary }}>Browse People</h3>

        <div className="grid grid-cols-2 gap-4">
          {profileList.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>

        {profileList.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            No profiles found.
          </p>
        )}
      </StyledCard>
    </div>
  )
}

// ============================================================================
// MyFace Dating - Grid-based dating section
// ============================================================================

const MYFACE_DATING_SITE_ID = 'myface-dating'

function MyFaceDating({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedNpcId, setMatchedNpcId] = useState<string | null>(null)

  const npcsOnSite = useNPCsOnDatingSite(MYFACE_DATING_SITE_ID)
  const { getNPC, getDatingProfile, initialize: initNPCs } = useNPCStore()
  const {
    swipeRight,
    swipeLeft,
    hasSwipedOn,
    clearPendingCelebration,
    initialize: initDating,
  } = useDatingStore()
  const pendingCelebration = usePendingCelebration()
  const matches = useMatches(MYFACE_DATING_SITE_ID)
  const site = getDatingSite(MYFACE_DATING_SITE_ID)!

  useEffect(() => {
    initNPCs()
    initDating()
  }, [initNPCs, initDating])

  // Filter to NPCs we haven't swiped on yet
  const unseenNPCs = npcsOnSite.filter(npc => !hasSwipedOn(MYFACE_DATING_SITE_ID, npc.id))

  // Handle pending match celebration
  useEffect(() => {
    if (pendingCelebration && pendingCelebration.siteId === MYFACE_DATING_SITE_ID) {
      setMatchedNpcId(pendingCelebration.npcId)
      setShowMatchModal(true)
    }
  }, [pendingCelebration])

  const handleLike = (npcId: string) => {
    swipeRight(MYFACE_DATING_SITE_ID, npcId)
  }

  const handlePass = (npcId: string) => {
    swipeLeft(MYFACE_DATING_SITE_ID, npcId)
  }

  const handleCloseMatch = () => {
    setShowMatchModal(false)
    setMatchedNpcId(null)
    clearPendingCelebration()
  }

  const matchedNpc = matchedNpcId ? getNPC(matchedNpcId) : undefined
  const matchedProfile = matchedNpc ? getDatingProfile(matchedNpc.id, MYFACE_DATING_SITE_ID) : undefined

  return (
    <div className="space-y-4">
      {/* Dating Header */}
      <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: MYFACE_COLORS.primary }}>
              💕 MyFace Dating
            </h2>
            <p className="text-xs text-gray-500">Find love among your friends</p>
          </div>
          {matches.length > 0 && (
            <div className="text-sm" style={{ color: MYFACE_COLORS.accent }}>
              ❤️ {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
            </div>
          )}
        </div>

        {/* Matches Row */}
        {matches.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 mb-2">Your Matches</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {matches.map((match) => {
                const npc = getNPC(match.npcId)
                const profile = getDatingProfile(match.npcId, MYFACE_DATING_SITE_ID)
                if (!npc || !profile) return null

                return (
                  <Button
                    key={match.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProfile(match.npcId)}
                    className="shrink-0 flex flex-col items-center"
                  >
                    <Avatar
                      size="lg"
                      initials={profile.photos[0] || npc.avatar}
                      bgColor="#f5f5f5"
                      border={match.isNew ? `2px solid ${MYFACE_COLORS.accent}` : `2px solid #d1d5db`}
                      shape="circle"
                    />
                    <span className="text-[10px] font-medium text-gray-700 truncate w-14 text-center mt-1">
                      {npc.name}
                    </span>
                    {match.isNew && (
                      <span className="text-[8px] font-medium" style={{ color: MYFACE_COLORS.accent }}>NEW</span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* People You May Like */}
        <h3 className="text-sm font-bold mb-3" style={{ color: MYFACE_COLORS.primary }}>People You May Like</h3>

        {unseenNPCs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💔</div>
            <p className="text-gray-500 text-sm">
              No more profiles to browse right now.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Check back later for new people!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {unseenNPCs.map((npc) => {
              const profile = getDatingProfile(npc.id, MYFACE_DATING_SITE_ID)
              if (!profile) return null

              return (
                <DatingProfileCard
                  key={npc.id}
                  npc={npc}
                  profile={profile}
                  site={site}
                  onLike={() => handleLike(npc.id)}
                  onPass={() => handlePass(npc.id)}
                  onViewProfile={() => onViewProfile(npc.id)}
                />
              )
            })}
          </div>
        )}
      </StyledCard>

      {/* Match Modal */}
      {showMatchModal && matchedNpc && matchedProfile && site && (
        <MatchModal
          npc={matchedNpc}
          datingProfile={matchedProfile}
          site={site}
          onSendMessage={handleCloseMatch}
          onKeepSwiping={handleCloseMatch}
        />
      )}
    </div>
  )
}

interface DatingProfileCardProps {
  npc: import('../../../stores/npcStore.js').NPC
  profile: import('../../../stores/npcStore.js').NPCDatingProfile
  site: import('../../../config/dating-registry.js').DatingSiteDefinition
  onLike: () => void
  onPass: () => void
  onViewProfile: () => void
}

function DatingProfileCard({ npc, profile, site, onLike, onPass, onViewProfile }: DatingProfileCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <StyledCard
      bgColor={MYFACE_COLORS.bg}
      borderColor="#ddd"
      borderRadius="lg"
      shadow="md"
      onClick={() => setShowDetails(!showDetails)}
      className="overflow-hidden p-0"
      interactive
    >
      {/* Photo/Avatar */}
      <div
        className="aspect-[3/4] flex items-center justify-center text-6xl relative"
        style={{ background: '#f0f0f0' }}
      >
        {profile.photos[0] || npc.avatar}

        {/* Gradient overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          }}
        />

        {/* Name & Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h4 className="font-bold text-sm">{npc.name}, {npc.age}</h4>
          <p className="text-xs opacity-90 truncate">{profile.lookingFor}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        {showDetails ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-700 line-clamp-3">{profile.bio}</p>
            {profile.promptAnswers && profile.promptAnswers.length > 0 && (
              <div className="text-xs">
                <p className="text-gray-500 font-medium">{profile.promptAnswers[0].prompt}</p>
                <p className="text-gray-700">{profile.promptAnswers[0].answer}</p>
              </div>
            )}
            <Button
              size="xs"
              variant="link"
              textColor={MYFACE_COLORS.primary}
              onClick={(e) => {
                e.stopPropagation()
                onViewProfile()
              }}
            >
              View Full Profile →
            </Button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 truncate">{profile.bio}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-gray-100">
        <Button
          size="sm"
          variant="ghost"
          textColor="#9ca3af"
          onClick={(e) => {
            e.stopPropagation()
            onPass()
          }}
          width="full"
          className="border-r border-gray-100"
        >
          ✕ Pass
        </Button>
        <Button
          size="sm"
          variant="ghost"
          backgroundColor="transparent"
          textColor={MYFACE_COLORS.accent}
          onClick={(e) => {
            e.stopPropagation()
            onLike()
          }}
          width="full"
        >
          ❤️ Like
        </Button>
      </div>
    </StyledCard>
  )
}

interface ProfileCardProps {
  profile: SocialProfile
  onViewProfile: (id: string) => void
}

function ProfileCard({ profile, onViewProfile }: ProfileCardProps) {
  const statusItems: MetaRowItem[] = [
    {
      value: profile.isOnline ? '● Online' : `○ ${profile.lastSeen || 'Offline'}`,
    },
  ]
  if (profile.mood) {
    statusItems.push({
      value: `${profile.moodEmoji} ${profile.mood}`,
    })
  }

  return (
    <StyledCard
      bgColor={MYFACE_COLORS.bg}
      borderColor={MYFACE_COLORS.border}
      padding="md"
      interactive
      onClick={() => onViewProfile(profile.id)}
      className="flex items-start gap-3"
    >
      <Avatar
        size="lg"
        initials={profile.avatar || profile.name[0]}
        bgColor={profile.backgroundColor || '#eee'}
        shape="rounded"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm" style={{ color: MYFACE_COLORS.primary }}>{profile.name}</h4>
        <p className="text-xs text-gray-500">@{profile.username}</p>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{profile.bio}</p>
        <MetaRow
          items={statusItems}
          textSize="xs"
          textColor="#6b7280"
          gap={8}
          separator="•"
          className="mt-2"
        />
      </div>
    </StyledCard>
  )
}

interface MyFaceProfileProps {
  profileId: string
  onBack: () => void
  onViewProfile: (id: string) => void
}

function MyFaceProfile({ profileId, onBack, onViewProfile }: MyFaceProfileProps) {
  const [showContactOptions, setShowContactOptions] = useState(false)
  const { getProfile, getPostsByAuthor, profiles, likePost, unlikePost } = useSocialStore()
  const { initialize: initNPCs, getAccessibleApps, canContactVia } = useNPCStore()
  const npc = useNPC(profileId)
  const profile = getProfile(profileId)
  const posts = getPostsByAuthor(profileId)

  useEffect(() => {
    initNPCs()
  }, [initNPCs])

  if (!profile) {
    return (
      <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} padding="lg">
        <Button variant="link" textColor={MYFACE_COLORS.primary} onClick={onBack} className="mb-4">
          ← Back to Home
        </Button>
        <p className="text-gray-500">Profile not found.</p>
      </StyledCard>
    )
  }

  const topFriends = profile.topFriends
    ?.map(id => profiles[id])
    .filter(Boolean)
    .slice(0, 8) || []

  const relationshipLevel = npc?.relationship?.level || 'stranger'
  const accessibleApps = npc ? getAccessibleApps(profileId) : []

  const relationshipBgColor = {
    stranger: '#6b7280',
    acquaintance: '#3b82f6',
    friend: '#10b981',
    close_friend: '#a855f7',
    best_friend: '#ec4899',
  }[relationshipLevel] || '#ef4444'

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="link" textColor="white" onClick={onBack}>
        ← Back to Home
      </Button>

      {/* Profile Header */}
      <StyledCard
        bgColor={profile.backgroundColor || MYFACE_COLORS.bg}
        borderColor={MYFACE_COLORS.border}
        borderRadius="lg"
        shadow="md"
        padding={0}
        className="overflow-hidden"
      >
        <div style={{ background: 'linear-gradient(180deg, #003366 0%, #336699 100%)', borderBottom: '2px solid #FF6600' }} className="p-4">
          <div className="flex items-end gap-4">
            <Avatar size="xl" initials={profile.avatar || profile.name[0]} bgColor="white" shape="rounded" />
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-white/60 text-sm">@{profile.username}</p>
              {profile.isOnline ? (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-500 text-white rounded">
                  Online Now!
                </span>
              ) : (
                <span className="text-xs text-white/50 mt-1 block">
                  Last seen: {profile.lastSeen || 'Unknown'}
                </span>
              )}
              {profileId !== 'player' && npc && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded text-white" style={{ background: relationshipBgColor }}>
                  {relationshipLevel.replace('_', ' ')}
                </span>
              )}
            </div>
            {profileId !== 'player' && (
              <div className="flex gap-2 pb-2 relative">
                <Button size="sm" backgroundColor={MYFACE_COLORS.accent} textColor="white">
                  Add Friend
                </Button>
                <div className="relative">
                  <Button
                    size="sm"
                    backgroundColor="white"
                    textColor={MYFACE_COLORS.primary}
                    onClick={() => setShowContactOptions(!showContactOptions)}
                  >
                    Message ▼
                  </Button>
                  {showContactOptions && npc && (
                    <ContactOptionsDropdown
                      npc={npc}
                      accessibleApps={accessibleApps}
                      canContactVia={canContactVia}
                      onClose={() => setShowContactOptions(false)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Body */}
        <div className="grid grid-cols-3 gap-4 p-4" style={{ color: profile.textColor || '#333' }}>
          {/* Left Column */}
          <div className="space-y-4">
            {/* About */}
            <StyledCard bgColor="rgba(255,255,255,0.9)" borderColor={MYFACE_COLORS.border} padding="md">
              <h3 className="font-bold mb-2 text-sm border-b border-gray-200 pb-1" style={{ color: MYFACE_COLORS.primary }}>
                About Me
              </h3>
              <p className="text-sm">{profile.bio}</p>
              {profile.mood && (
                <p className="text-xs mt-2 text-gray-600">
                  <strong>Mood:</strong> {profile.moodEmoji} {profile.mood}
                </p>
              )}
              {profile.location && (
                <p className="text-xs mt-1 text-gray-600">
                  <strong>Location:</strong> {profile.location}
                </p>
              )}
            </StyledCard>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <StyledCard bgColor="rgba(255,255,255,0.9)" borderColor={MYFACE_COLORS.border} padding="md">
                <h3 className="font-bold mb-2 text-sm border-b border-gray-200 pb-1" style={{ color: MYFACE_COLORS.primary }}>
                  Interests
                </h3>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.map((interest, i) => (
                    <Button
                      key={i}
                      size="xs"
                      variant="primary"
                      backgroundColor={MYFACE_COLORS.primary}
                      textColor="white"
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </StyledCard>
            )}

            {/* Music */}
            {profile.music && (
              <StyledCard bgColor="rgba(255,255,255,0.9)" borderColor={MYFACE_COLORS.border} padding="md">
                <h3 className="font-bold mb-2 text-sm border-b border-gray-200 pb-1" style={{ color: MYFACE_COLORS.primary }}>
                  🎵 Music
                </h3>
                <p className="text-xs text-gray-600">{profile.music}</p>
              </StyledCard>
            )}
          </div>

          {/* Center Column - Posts */}
          <div className="col-span-2 space-y-4">
            {/* Top Friends */}
            <StyledCard bgColor="rgba(255,255,255,0.9)" borderColor={MYFACE_COLORS.border} padding="md">
              <h3 className="font-bold mb-2 text-sm border-b border-gray-200 pb-1" style={{ color: MYFACE_COLORS.primary }}>
                {profile.name}'s Top {Math.min(topFriends.length, 8)}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {topFriends.map((friend) => (
                  <Button
                    key={friend.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProfile(friend.id)}
                    className="aspect-square flex flex-col items-center justify-center p-1"
                    style={{ background: '#f3f4f6' }}
                  >
                    <span className="text-lg">{friend.avatar}</span>
                    <span className="truncate w-full text-center text-[10px] text-gray-600 mt-1">
                      {friend.name}
                    </span>
                  </Button>
                ))}
                {topFriends.length === 0 && (
                  <p className="col-span-4 text-xs text-gray-500">No friends yet</p>
                )}
              </div>
            </StyledCard>

            {/* Posts */}
            <StyledCard bgColor="rgba(255,255,255,0.9)" borderColor={MYFACE_COLORS.border} padding="md">
              <h3 className="font-bold mb-2 text-sm border-b border-gray-200 pb-1" style={{ color: MYFACE_COLORS.primary }}>
                {profile.name}'s Bulletins
              </h3>
              {posts.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No bulletins yet.</p>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => post.likes.includes('player') ? unlikePost(post.id) : likePost(post.id)}
                      onViewProfile={onViewProfile}
                    />
                  ))}
                </div>
              )}
            </StyledCard>
          </div>
        </div>
      </StyledCard>
    </div>
  )
}

function MyFaceMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const allConversations = useConversations()
  const { initialize, isLoading, sendMessage, isSending, setActiveConversation } = useConversationStore()
  const messages = useConversationMessages(selectedConversationId)
  const typingParticipant = useTypingIndicator(selectedConversationId)

  const selectedConversation = selectedConversationId
    ? allConversations.find(c => c.id === selectedConversationId)
    : null

  useEffect(() => {
    if (allConversations.length === 0) {
      initialize()
    }
  }, [initialize, allConversations.length])

  useEffect(() => {
    if (selectedConversationId) {
      setActiveConversation(selectedConversationId)
    }
    return () => setActiveConversation(null)
  }, [selectedConversationId, setActiveConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typingParticipant])

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !selectedConversationId) return
    const content = inputValue
    setInputValue('')
    await sendMessage(selectedConversationId, content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const sortedConversations = [...allConversations].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const cssVars = MESSAGE_CSS_VARS.myspace || {}

  return (
    <div className="grid grid-cols-3 gap-4 h-[500px]" style={cssVars as React.CSSProperties}>
      {/* Conversation list */}
      <StyledCard bgColor={MYFACE_COLORS.bg} borderColor={MYFACE_COLORS.border} borderRadius="md" padding={0} className="flex flex-col overflow-hidden">
        <h3 className="font-bold p-4 pb-2 border-b border-gray-200 shrink-0" style={{ color: MYFACE_COLORS.primary }}>
          Inbox
        </h3>
        {isLoading ? (
          <p className="text-sm text-gray-500 p-4">Loading...</p>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-1">
            {sortedConversations.map((convo) => (
              <Button
                key={convo.id}
                variant="ghost"
                onClick={() => setSelectedConversationId(convo.id)}
                width="full"
                className={`justify-start flex items-center gap-2 p-2 ${
                  selectedConversationId === convo.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                <Avatar
                  size="sm"
                  initials={convo.participants[0]?.avatar || convo.participants[0]?.name[0] || '?'}
                  bgColor="#e5e7eb"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm" style={{ color: MYFACE_COLORS.primary }} >
                      {convo.participants[0]?.name || 'Unknown'}
                    </p>
                    {convo.unreadCount > 0 && (
                      <Avatar badge={convo.unreadCount} size="xs" initials="" bgColor={MYFACE_COLORS.accent} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        )}
      </StyledCard>

      {/* Message thread */}
      <StyledCard
        bgColor={MYFACE_COLORS.bg}
        borderColor={MYFACE_COLORS.border}
        borderRadius="md"
        padding={0}
        className="col-span-2 flex flex-col overflow-hidden"
      >
        {selectedConversation ? (
          <>
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-bold" style={{ color: MYFACE_COLORS.primary }}>
                {selectedConversation.participants[0]?.name || 'Unknown'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <MessageThreadComponent
                messages={messages}
                config={MYFACE_CONFIG}
              />

              {typingParticipant && (
                <div className="text-sm text-gray-500 py-2">
                  <TypingIndicator
                    users={[{ id: typingParticipant.id, name: typingParticipant.name }]}
                    variant="text"
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message..."
                  className="flex-1 px-3 py-2 rounded text-sm outline-none resize-none"
                  style={{ background: '#f5f5f5', border: `1px solid ${MYFACE_COLORS.border}`, color: '#333' }}
                  rows={2}
                />
                <Button
                  size="sm"
                  backgroundColor={MYFACE_COLORS.accent}
                  textColor="white"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  className="self-end"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold p-4 pb-2 border-b border-gray-200" style={{ color: MYFACE_COLORS.primary }}>
              Conversation
            </h3>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start chatting
            </div>
          </>
        )}
      </StyledCard>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ============================================================================
// Contact Options Dropdown
// ============================================================================

interface ContactOptionsDropdownProps {
  npc: import('../../../stores/npcStore.js').NPC
  accessibleApps: string[]
  canContactVia: (npcId: string, appId: string) => boolean
  onClose: () => void
}

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  stranger: 'Anyone',
  acquaintance: 'Acquaintances+',
  friend: 'Friends+',
  close_friend: 'Close Friends+',
  partner: 'Partner Only',
}

function ContactOptionsDropdown({ npc, accessibleApps, canContactVia, onClose }: ContactOptionsDropdownProps) {
  const messagingApps = npc.apps.filter(app => {
    const appDef = APP_REGISTRY[app.appId]
    return appDef && (appDef.category === 'messaging' || appDef.messageVariant)
  })

  if (messagingApps.length === 0) {
    return (
      <StyledCard
        bgColor={MYFACE_COLORS.bg}
        borderColor={MYFACE_COLORS.border}
        padding="md"
        shadow="lg"
        className="absolute top-full right-0 mt-1 w-64 z-50"
      >
        <p className="text-sm text-gray-500">No messaging apps available</p>
      </StyledCard>
    )
  }

  return (
    <StyledCard
      bgColor={MYFACE_COLORS.bg}
      borderColor={MYFACE_COLORS.border}
      padding={0}
      shadow="lg"
      className="absolute top-full right-0 mt-1 w-72 z-50 overflow-hidden"
    >
      <div className="p-2 border-b border-gray-200">
        <p className="text-xs text-gray-500 font-medium">Contact {npc.name} via:</p>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {messagingApps.map(appPresence => {
          const appDef = APP_REGISTRY[appPresence.appId]
          if (!appDef) return null

          const isAccessible = canContactVia(npc.id, appPresence.appId)
          const requiredLevel = appDef.accessLevel

          return (
            <Button
              key={appPresence.appId}
              variant="ghost"
              disabled={!isAccessible}
              onClick={() => {
                if (isAccessible) {
                  console.log(`Opening ${appDef.name} chat with ${npc.name}`)
                  onClose()
                }
              }}
              width="full"
              className="justify-start flex items-center gap-3 p-3 text-left"
              textColor={isAccessible ? '#1f2937' : '#9ca3af'}
            >
              <Avatar
                size="sm"
                initials={appDef.icon as string}
                bgColor={appDef.theme?.primaryColor || '#666'}
                shape="rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{appDef.name}</span>
                  {isAccessible && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">
                      Available
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">@{appPresence.username}</p>
                {!isAccessible && (
                  <p className="text-[10px] text-orange-600 mt-0.5">
                    🔒 Requires: {ACCESS_LEVEL_LABELS[requiredLevel]}
                  </p>
                )}
              </div>
              {isAccessible ? '→' : '🔒'}
            </Button>
          )
        })}
      </div>

      {/* Hint */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <p className="text-[10px] text-gray-500 text-center">
          Build your relationship to unlock more ways to connect!
        </p>
      </div>
    </StyledCard>
  )
}

export default MyFaceSite
