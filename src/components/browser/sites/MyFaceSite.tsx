/**
 * MyFace Site
 *
 * The OG social network - early 2000s aesthetic.
 * Includes feed, profiles, and messaging.
 */

import { useState, useEffect, useRef } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { MessageThread as MessageThreadComponent } from '../../ui/Message/MessageThread.js'
import { TypingIndicator } from '../../ui/Message/TypingIndicator.js'
import { MESSAGE_CSS_VARS } from '../../ui/Message/styles.js'
import type { MessageStyleConfig } from '../../ui/Message/types.js'
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

export function MyFaceSite({ siteId }: SiteProps) {
  const [currentView, setCurrentView] = useState<MyFaceView>(
    siteId === 'myface-chat' ? 'messages' : 'home'
  )
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const playerProfile = usePlayerProfile()
  const { initialize } = useSocialStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleViewProfile = (profileId: string) => {
    setSelectedProfileId(profileId)
    setCurrentView('profile')
  }

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
            onClick={() => setCurrentView('home')}
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
                onClick={() => setCurrentView(view)}
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
            onBack={() => setCurrentView('home')}
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

  // Get top friends (first 8 profiles)
  const topFriends = Object.values(profiles).slice(0, 8)

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left Column - User Info */}
      <div className="space-y-4">
        {/* Player Card */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-2xl">
              {playerProfile.avatar}
            </div>
            <div>
              <h2 className="font-bold text-[#003366]">{playerProfile.name}</h2>
              <p className="text-xs text-gray-500">"{playerProfile.bio}"</p>
            </div>
          </div>
          <div className="text-xs space-y-1 text-gray-600">
            <p><strong>Mood:</strong> {playerProfile.moodEmoji} {playerProfile.mood}</p>
            <p className="text-green-600"><strong>Online Now!</strong></p>
          </div>
          <button
            onClick={() => onViewProfile('player')}
            className="mt-3 text-xs text-[#003366] hover:underline"
          >
            View My Profile →
          </button>
        </div>

        {/* Top 8 Friends */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">
            {playerProfile.name}'s Top 8
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {topFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onViewProfile(friend.id)}
                className="aspect-square rounded bg-gray-100 flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-gray-200 p-1"
              >
                <span className="text-lg">{friend.avatar}</span>
                <span className="truncate w-full text-center text-[10px] text-gray-600">
                  {friend.name}
                </span>
              </button>
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
        </div>

        {/* Stats */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">My Stats</h3>
          <div className="text-xs space-y-1 text-gray-600">
            <p>Profile Views: <strong>1,337</strong></p>
            <p>Friends: <strong>{Object.keys(profiles).length}</strong></p>
            <p>Posts: <strong>{posts.filter(p => p.authorId === 'player').length}</strong></p>
          </div>
        </div>
      </div>

      {/* Center Column - Feed */}
      <div className="col-span-2 space-y-4">
        {/* Post something */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">Post a Bulletin</h3>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-[#003366]"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePost}
              disabled={!postContent.trim()}
              className="px-4 py-1 text-sm font-medium text-white rounded disabled:opacity-50 transition-opacity"
              style={{ background: '#FF6600' }}
            >
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-3 pb-2 border-b border-gray-200">
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
        </div>
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

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onViewProfile(post.authorId)}
          className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-lg shrink-0 hover:bg-gray-300 transition-colors"
        >
          {post.author.avatar || post.author.name[0]}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onViewProfile(post.authorId)}
              className="font-bold text-[#003366] text-sm hover:underline"
            >
              {post.author.name}
            </button>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(new Date(post.timestamp))}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-[#FF6600] font-medium' : 'text-[#003366] hover:text-[#FF6600]'
              }`}
            >
              {isLiked ? '❤️' : '🤍'} {post.likes.length > 0 && post.likes.length} Kudos
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-[#003366] hover:underline"
            >
              💬 {post.comments.length > 0 && post.comments.length} Comments
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-3 pl-3 border-l-2 border-gray-200">
              {post.comments.map((comment) => (
                <div key={comment.id} className="py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => onViewProfile(comment.authorId)}
                      className="font-medium text-[#003366] text-xs hover:underline"
                    >
                      {comment.author.name}
                    </button>
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(new Date(comment.timestamp))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{comment.content}</p>
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
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#003366]"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="px-2 py-1 text-xs text-white rounded disabled:opacity-50"
                  style={{ background: '#FF6600' }}
                >
                  Post
                </button>
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
      <div
        className="p-4 rounded"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <h3 className="font-bold text-[#003366] mb-4">Browse People</h3>

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
      </div>
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
      <div
        className="p-4 rounded"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#003366] text-lg flex items-center gap-2">
              💕 MyFace Dating
            </h2>
            <p className="text-xs text-gray-500">Find love among your friends</p>
          </div>
          {matches.length > 0 && (
            <div className="text-sm text-[#FF6600]">
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
                  <button
                    key={match.id}
                    onClick={() => onViewProfile(match.npcId)}
                    className="shrink-0 flex flex-col items-center group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ring-2 mb-1 transition-transform group-hover:scale-105 ${
                        match.isNew ? 'ring-[#FF6600]' : 'ring-gray-300'
                      }`}
                      style={{ background: '#f5f5f5' }}
                    >
                      {profile.photos[0] || npc.avatar}
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 truncate w-14 text-center">
                      {npc.name}
                    </span>
                    {match.isNew && (
                      <span className="text-[8px] text-[#FF6600] font-medium">NEW</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* People You May Like */}
        <h3 className="text-sm font-bold text-[#003366] mb-3">People You May Like</h3>

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
      </div>

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
    <div
      className="rounded-lg overflow-hidden transition-shadow hover:shadow-lg cursor-pointer relative"
      style={{ border: '1px solid #ddd', background: 'white' }}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Photo/Avatar */}
      <div
        className="aspect-[3/4] flex items-center justify-center text-6xl relative"
        style={{ background: '#f0f0f0' }}
      >
        {profile.photos[0] || npc.avatar}

        {/* Gradient overlay for text */}
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

      {/* Quick info / expanded details */}
      {showDetails ? (
        <div className="p-3 space-y-2">
          <p className="text-xs text-gray-700 line-clamp-3">{profile.bio}</p>

          {profile.promptAnswers && profile.promptAnswers.length > 0 && (
            <div className="text-xs">
              <p className="text-gray-500 font-medium">{profile.promptAnswers[0].prompt}</p>
              <p className="text-gray-700">{profile.promptAnswers[0].answer}</p>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewProfile()
            }}
            className="text-xs text-[#003366] hover:underline"
          >
            View Full Profile →
          </button>
        </div>
      ) : (
        <div className="p-2">
          <p className="text-xs text-gray-500 truncate">{profile.bio}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPass()
          }}
          className="flex-1 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors border-r border-gray-100"
        >
          ✕ Pass
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLike()
          }}
          className="flex-1 py-2 text-center text-sm font-medium transition-colors hover:bg-pink-50"
          style={{ color: '#FF6600' }}
        >
          ❤️ Like
        </button>
      </div>
    </div>
  )
}

interface ProfileCardProps {
  profile: SocialProfile
  onViewProfile: (id: string) => void
}

function ProfileCard({ profile, onViewProfile }: ProfileCardProps) {
  return (
    <button
      onClick={() => onViewProfile(profile.id)}
      className="flex items-start gap-3 p-3 rounded hover:bg-gray-50 transition-colors text-left"
      style={{ border: '1px solid #ddd' }}
    >
      <div
        className="w-16 h-16 rounded flex items-center justify-center text-2xl shrink-0"
        style={{ background: profile.backgroundColor || '#eee' }}
      >
        {profile.avatar || profile.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#003366] text-sm">{profile.name}</h4>
        <p className="text-xs text-gray-500">@{profile.username}</p>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{profile.bio}</p>
        <div className="flex items-center gap-2 mt-2">
          {profile.isOnline ? (
            <span className="text-[10px] text-green-600">● Online</span>
          ) : (
            <span className="text-[10px] text-gray-400">○ {profile.lastSeen || 'Offline'}</span>
          )}
          {profile.mood && (
            <span className="text-[10px] text-gray-500">
              {profile.moodEmoji} {profile.mood}
            </span>
          )}
        </div>
      </div>
    </button>
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

  // Initialize NPC store
  useEffect(() => {
    initNPCs()
  }, [initNPCs])

  if (!profile) {
    return (
      <div
        className="p-4 rounded"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <button
          onClick={onBack}
          className="text-[#003366] hover:underline text-sm mb-4"
        >
          ← Back to Home
        </button>
        <p className="text-gray-500">Profile not found.</p>
      </div>
    )
  }

  const topFriends = profile.topFriends
    ?.map(id => profiles[id])
    .filter(Boolean)
    .slice(0, 8) || []

  // Get relationship info from NPC store
  const relationshipLevel = npc?.relationship?.level || 'stranger'
  const accessibleApps = npc ? getAccessibleApps(profileId) : []

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-white hover:underline text-sm"
      >
        ← Back to Home
      </button>

      {/* Profile Header - MySpace style with custom colors */}
      <div
        className="rounded overflow-hidden"
        style={{
          background: profile.backgroundColor || 'white',
          border: '1px solid #ccc',
        }}
      >
        <div
          className="p-4"
          style={{
            background: 'linear-gradient(180deg, #003366 0%, #336699 100%)',
            borderBottom: '2px solid #FF6600',
          }}
        >
          <div className="flex items-end gap-4">
            <div
              className="w-24 h-24 rounded flex items-center justify-center text-4xl bg-white shadow-lg"
            >
              {profile.avatar || profile.name[0]}
            </div>
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
              {/* Relationship Badge */}
              {profileId !== 'player' && npc && (
                <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                  relationshipLevel === 'stranger' ? 'bg-gray-500' :
                  relationshipLevel === 'acquaintance' ? 'bg-blue-500' :
                  relationshipLevel === 'friend' ? 'bg-green-500' :
                  relationshipLevel === 'close_friend' ? 'bg-purple-500' :
                  relationshipLevel === 'best_friend' ? 'bg-pink-500' :
                  'bg-red-500'
                } text-white`}>
                  {relationshipLevel.replace('_', ' ')}
                </span>
              )}
            </div>
            {profileId !== 'player' && (
              <div className="flex gap-2 pb-2 relative">
                <button
                  className="px-4 py-1.5 text-sm font-medium text-white rounded"
                  style={{ background: '#FF6600' }}
                >
                  Add Friend
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowContactOptions(!showContactOptions)}
                    className="px-4 py-1.5 text-sm font-medium text-[#003366] bg-white rounded flex items-center gap-1"
                  >
                    Message
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Contact Options Dropdown */}
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
            <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <h3 className="font-bold text-[#003366] mb-2 text-sm border-b border-gray-200 pb-1">
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
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.9)' }}>
                <h3 className="font-bold text-[#003366] mb-2 text-sm border-b border-gray-200 pb-1">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded"
                      style={{ background: '#003366', color: 'white' }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Music */}
            {profile.music && (
              <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.9)' }}>
                <h3 className="font-bold text-[#003366] mb-2 text-sm border-b border-gray-200 pb-1">
                  🎵 Music
                </h3>
                <p className="text-xs text-gray-600">{profile.music}</p>
              </div>
            )}
          </div>

          {/* Center Column - Posts */}
          <div className="col-span-2 space-y-4">
            {/* Top Friends */}
            <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <h3 className="font-bold text-[#003366] mb-2 text-sm border-b border-gray-200 pb-1">
                {profile.name}'s Top {Math.min(topFriends.length, 8)}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {topFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => onViewProfile(friend.id)}
                    className="aspect-square rounded bg-gray-100 flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-gray-200 p-1"
                  >
                    <span className="text-lg">{friend.avatar}</span>
                    <span className="truncate w-full text-center text-[10px] text-gray-600">
                      {friend.name}
                    </span>
                  </button>
                ))}
                {topFriends.length === 0 && (
                  <p className="col-span-4 text-xs text-gray-500">No friends yet</p>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <h3 className="font-bold text-[#003366] mb-2 text-sm border-b border-gray-200 pb-1">
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
            </div>
          </div>
        </div>
      </div>
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
      <div
        className="rounded flex flex-col"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <h3 className="font-bold text-[#003366] p-4 pb-2 border-b border-gray-200 shrink-0">
          Inbox
        </h3>
        {isLoading ? (
          <p className="text-sm text-gray-500 p-4">Loading...</p>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-1">
            {sortedConversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversationId(convo.id)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                  selectedConversationId === convo.id
                    ? 'bg-[#003366]/10'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-sm text-[#003366]">
                  {convo.participants[0]?.avatar || convo.participants[0]?.name[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-[#003366] truncate">
                      {convo.participants[0]?.name || 'Unknown'}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FF6600] text-white text-[10px] flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message thread */}
      <div
        className="col-span-2 rounded flex flex-col"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        {selectedConversation ? (
          <>
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-bold text-[#003366]">
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
                  style={{ background: '#f5f5f5', border: '1px solid #ccc', color: '#333' }}
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  className="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 self-end"
                  style={{ background: '#FF6600', color: 'white' }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-[#003366] p-4 pb-2 border-b border-gray-200">
              Conversation
            </h3>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start chatting
            </div>
          </>
        )}
      </div>
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
  // Get all messaging apps the NPC is on
  const messagingApps = npc.apps.filter(app => {
    const appDef = APP_REGISTRY[app.appId]
    return appDef && (appDef.category === 'messaging' || appDef.messageVariant)
  })

  if (messagingApps.length === 0) {
    return (
      <div
        className="absolute top-full right-0 mt-1 w-64 p-3 rounded shadow-lg z-50"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <p className="text-sm text-gray-500">No messaging apps available</p>
      </div>
    )
  }

  return (
    <div
      className="absolute top-full right-0 mt-1 w-72 rounded shadow-lg z-50"
      style={{ background: 'white', border: '1px solid #ccc' }}
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
            <button
              key={appPresence.appId}
              disabled={!isAccessible}
              onClick={() => {
                if (isAccessible) {
                  // TODO: Navigate to conversation with this NPC on this app
                  console.log(`Opening ${appDef.name} chat with ${npc.name}`)
                  onClose()
                }
              }}
              className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                isAccessible
                  ? 'hover:bg-gray-100 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-gray-50'
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{
                  background: appDef.theme?.primaryColor || '#666',
                  color: 'white',
                }}
              >
                {appDef.icon}
              </div>
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
              {isAccessible ? (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Hint about unlocking more */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <p className="text-[10px] text-gray-500 text-center">
          Build your relationship to unlock more ways to connect!
        </p>
      </div>
    </div>
  )
}

export default MyFaceSite
