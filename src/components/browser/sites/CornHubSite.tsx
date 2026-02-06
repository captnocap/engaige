/**
 * CornHub Site
 *
 * A completely legitimate corn recipe website. Just corn recipes.
 * The orange and black color scheme and "Premium Recipes" section
 * are purely coincidental. We are passionate about corn.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Types
// ============================================================================

interface Recipe {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: number
  rating: number
  author: string
  authorAvatar: string
  authorVerified: boolean
  category: string
  isPremium: boolean
  isHD: boolean
  uploadedAgo: string
  description: string
  ingredients: string[]
  steps: string[]
  tags: string[]
}

interface Comment {
  author: string
  avatar: string
  text: string
  likes: number
  timeAgo: string
  isVerified: boolean
}

interface UserProfile {
  name: string
  avatar: string
  subscribers: number
  recipes: number
  views: number
  verified: boolean
  bio: string
  joinDate: string
}

// ============================================================================
// Sample Data
// ============================================================================

// Hardcoded RECIPES removed -- DB is the sole source of truth

const CATEGORIES = [
  { id: 'all', name: 'All Recipes', count: 847000 },
  { id: 'amateur', name: 'Amateur Cornbread', count: 234000 },
  { id: 'professional', name: 'Professional Chefs', count: 156000 },
  { id: 'homemade', name: 'Homemade', count: 312000 },
  { id: 'experimental', name: 'Experimental', count: 45000 },
  { id: 'grilled', name: 'Grilled', count: 89000 },
  { id: 'creamy', name: 'Creamy', count: 67000 },
  { id: 'spicy', name: 'Spicy', count: 78000 },
]

const SAMPLE_COMMENTS: Comment[] = [
  { author: 'CornEnthusiast42', avatar: '🌽', text: 'This changed my life. I can\'t go back to store-bought cornbread.', likes: 8472, timeAgo: '2 days ago', isVerified: false },
  { author: 'SecretChef', avatar: '🤫', text: 'My wife doesn\'t know I\'m here... learning to cook. She thinks I can only make cereal.', likes: 15234, timeAgo: '1 week ago', isVerified: false },
  { author: 'GrandmaApproved', avatar: '👵', text: 'This is exactly how my grandmother made it. I\'m crying real tears right now.', likes: 5621, timeAgo: '3 days ago', isVerified: true },
  { author: 'MidnightSnacker', avatar: '🌙', text: 'It\'s 3am and I\'m watching corn recipe videos. No regrets.', likes: 9847, timeAgo: '12 hours ago', isVerified: false },
  { author: 'ProChef_Marcus', avatar: '👨‍🍳', text: 'Professional chef here. This technique is actually spot-on. Well done.', likes: 3456, timeAgo: '5 days ago', isVerified: true },
  { author: 'QuantumCoffeeFan', avatar: '☕', text: 'Derek, if you\'re reading this, Jennifer will come back. The corn pudding was worth it.', likes: 847, timeAgo: '847 days ago', isVerified: false },
]

const FEATURED_USERS: UserProfile[] = [
  {
    name: 'SouthernBelle_Bakes',
    avatar: '👩‍🍳',
    subscribers: 2400000,
    recipes: 847,
    views: 156000000,
    verified: true,
    bio: 'Third generation cornbread maker. My cast iron skillet has been in the family for 80 years.',
    joinDate: 'March 2019',
  },
  {
    name: 'ChefMiguel_Official',
    avatar: '👨‍🍳',
    subscribers: 5600000,
    recipes: 234,
    views: 890000000,
    verified: true,
    bio: 'Professional chef. Elote enthusiast. The messier the better.',
    joinDate: 'January 2018',
  },
  {
    name: 'QuantumDerek',
    avatar: '🔬',
    subscribers: 84700,
    recipes: 47,
    views: 8470000,
    verified: true,
    bio: 'Former quantum physicist. Current corn recipe creator. Jennifer, please call me back.',
    joinDate: 'August 2021',
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`
  }
  return views.toString()
}

// ============================================================================
// Components
// ============================================================================

function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg overflow-hidden aspect-video mb-2">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {recipe.thumbnail}
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
          {recipe.duration}
        </div>
        {/* HD badge */}
        {recipe.isHD && (
          <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1 rounded font-bold">
            HD
          </div>
        )}
        {/* Premium badge */}
        {recipe.isPremium && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[10px] px-1 rounded font-bold flex items-center gap-0.5">
            <span>PREMIUM</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-orange-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xl ml-1">▶</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-2">
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg shrink-0">
          {recipe.authorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {recipe.author}
            {recipe.authorVerified && <span className="text-orange-500">✓</span>}
          </p>
          <p className="text-xs text-gray-500">
            {formatViews(recipe.views)} views - {recipe.uploadedAgo}
          </p>
        </div>
      </div>
    </div>
  )
}

function RecipeDetail({ recipe, onBack, allRecipes }: { recipe: Recipe; onBack: () => void; allRecipes: Recipe[] }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Video Player Area */}
      <div className="bg-black rounded-lg overflow-hidden mb-4">
        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-orange-900 to-black">
          <div className="text-center">
            <span className="text-[150px] block">{recipe.thumbnail}</span>
            <div className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 cursor-pointer hover:bg-orange-600 transition-colors">
              <span className="text-2xl">▶</span>
              <span className="font-bold">Watch Recipe Video</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title and Actions */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white mb-2">{recipe.title}</h1>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-gray-400">
            {formatViews(recipe.views)} views - {recipe.uploadedAgo}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 px-3 py-1 rounded ${liked ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{(recipe.rating * 1000 + (liked ? 1 : 0)).toLocaleString()}</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-700 text-gray-300"
            >
              <span>{saved ? '📁' : '➕'}</span>
              <span>Save</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded bg-gray-700 text-gray-300">
              <span>↗️</span>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rating bar */}
      <div className="mb-4 bg-gray-800 rounded p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-500 font-bold">{recipe.rating}%</span>
          <div className="flex-1 h-1 bg-gray-600 rounded overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${recipe.rating}%` }} />
          </div>
          <span className="text-gray-400 text-sm">{formatViews(recipe.views)} ratings</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
              {recipe.authorAvatar}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium flex items-center gap-1">
                {recipe.author}
                {recipe.authorVerified && <span className="text-orange-500 text-sm">✓</span>}
              </p>
              <p className="text-gray-400 text-sm">1.2M subscribers</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              backgroundColor="#f97316"
              textColor="#ffffff"
            >
              Subscribe
            </Button>
          </div>

          {/* Description */}
          <div className="bg-gray-800 rounded p-4 mb-6">
            <p className="text-gray-300 text-sm whitespace-pre-line">{recipe.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.tags.map(tag => (
                <span key={tag} className="text-xs text-orange-400 hover:text-orange-300 cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-gray-800 rounded p-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📝</span> Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">{i + 1}</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="bg-gray-800 rounded p-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>👨‍🍳</span> Instructions
            </h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Comments */}
          <div className="bg-gray-800 rounded p-4">
            <h3 className="text-lg font-bold text-white mb-4">
              {SAMPLE_COMMENTS.length.toLocaleString()} Comments
            </h3>
            <div className="space-y-4">
              {SAMPLE_COMMENTS.map((comment, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-lg shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="text-gray-300 font-medium">{comment.author}</span>
                      {comment.isVerified && <span className="text-orange-500 ml-1">✓</span>}
                      <span className="text-gray-500 ml-2">{comment.timeAgo}</span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{comment.text}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <button className="hover:text-white">👍 {comment.likes.toLocaleString()}</button>
                      <button className="hover:text-white">👎</button>
                      <button className="hover:text-white">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            textColor="#f97316"
            onClick={onBack}
            className="mb-2"
          >
            ← Back to recipes
          </Button>

          <h3 className="text-white font-bold">Recommended For You</h3>
          {allRecipes.filter(r => r.id !== recipe.id).slice(0, 5).map(r => (
            <div key={r.id} className="flex gap-2 cursor-pointer group">
              <div className="w-40 aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center text-2xl shrink-0 relative">
                {r.thumbnail}
                <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[10px] px-1 rounded">
                  {r.duration}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs text-white line-clamp-2 group-hover:text-orange-400">{r.title}</h4>
                <p className="text-xs text-gray-500">{r.author}</p>
                <p className="text-xs text-gray-500">{formatViews(r.views)} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UserProfileView({ user, onBack, allRecipes }: { user: UserProfile; onBack: () => void; allRecipes: Recipe[] }) {
  const userRecipes = allRecipes.filter(r => r.author === user.name)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-t-lg h-32" />
      <div className="bg-gray-800 rounded-b-lg p-6 mb-6">
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-gray-800 flex items-center justify-center text-5xl">
            {user.avatar}
          </div>
          <div className="flex-1 pt-12">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {user.name}
              {user.verified && <span className="text-orange-500">✓</span>}
            </h1>
            <p className="text-gray-400 text-sm">
              {formatViews(user.subscribers)} subscribers - {user.recipes} recipes - {formatViews(user.views)} total views
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            backgroundColor="#f97316"
            textColor="#ffffff"
          >
            Subscribe
          </Button>
        </div>
        <p className="text-gray-300">{user.bio}</p>
        <p className="text-gray-500 text-sm mt-2">Joined {user.joinDate}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        textColor="#f97316"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to recipes
      </Button>

      <h2 className="text-lg font-bold text-white mb-4">Recipes by {user.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {userRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => {}} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

/**
 * Adapter: maps SiteContentItem to local Recipe interface.
 * Expects metadata to carry recipe-specific fields (duration, author, ingredients, steps, etc.)
 */
function dbToRecipe(item: SiteContentItem): Recipe {
  return {
    id: item.slug,
    title: item.title,
    thumbnail: item.thumbnailEmoji ?? '🌽',
    duration: item.metadata?.duration ?? '0:00',
    views: item.viewCount ?? item.metadata?.views ?? 0,
    rating: item.metadata?.rating ?? 90,
    author: item.metadata?.author ?? 'Anonymous',
    authorAvatar: item.metadata?.authorAvatar ?? '👤',
    authorVerified: item.metadata?.authorVerified ?? false,
    category: item.category ?? item.metadata?.category ?? 'Homemade',
    isPremium: item.metadata?.isPremium ?? false,
    isHD: item.metadata?.isHD ?? true,
    uploadedAgo: item.metadata?.uploadedAgo ?? (item.publishedAt ? formatTimeAgo(item.publishedAt) : 'Unknown'),
    description: item.body ?? item.summary ?? '',
    ingredients: item.metadata?.ingredients ?? [],
    steps: item.metadata?.steps ?? [],
    tags: item.tags ?? [],
  }
}

/** Helper to format a timestamp into a relative time string */
function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `${Math.floor(days / 30)} months ago`
  if (days > 7) return `${Math.floor(days / 7)} weeks ago`
  if (days > 0) return `${days} days ago`
  return 'Today'
}

export function CornHubSite({ siteId }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('cornhub')

  const recipes = useMemo(() => dbContent.map(dbToRecipe), [dbContent])

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [ageVerified, setAgeVerified] = useState(false)

  const filteredRecipes = selectedCategory === 'all'
    ? recipes
    : recipes.filter(r => r.category.toLowerCase().includes(selectedCategory) || r.tags.includes(selectedCategory))

  // Age verification modal (the joke setup)
  if (!ageVerified) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <StyledCard bgColor="#ffffff" borderColor="transparent" padding="none" borderRadius="lg" shadow="lg" className="max-w-md w-full mx-4 overflow-hidden">
          {/* Warning header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
            <span className="text-6xl block mb-3">🌽</span>
            <h1 className="text-2xl font-bold text-white">CornHub</h1>
            <p className="text-orange-100 text-sm">Premium Corn Recipes</p>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-4 text-lg font-medium">
              You must verify your age to view this content.
            </p>

            <StyledCard bgColor="#fef3c7" borderColor="transparent" padding="md" borderRadius="lg" className="mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Notice:</strong> This website contains <strong>extremely detailed corn recipes</strong>.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                By proceeding, you confirm:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>You are old enough to operate a stove</li>
                <li>You can handle <strong>hot, buttery content</strong></li>
                <li>You accept that elote can get messy</li>
                <li>You understand that 847 is just a number</li>
              </ul>
            </StyledCard>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                backgroundColor="#f97316"
                textColor="#ffffff"
                width="full"
                onClick={() => setAgeVerified(true)}
              >
                I Accept - Show Me The Corn
              </Button>
              <Button
                variant="secondary"
                size="lg"
                backgroundColor="#e5e7eb"
                textColor="#4b5563"
                width="full"
                onClick={() => window.history.back()}
              >
                I'm Not Ready For This Much Corn
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              CornHub - Free Corn Recipes Since 2019
            </p>
          </div>
        </StyledCard>
      </div>
    )
  }

  return (
    <div className="min-h-full" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { setSelectedRecipe(null); setSelectedUser(null) }}
            >
              <span className="text-4xl">🌽</span>
              <div>
                <h1 className="text-2xl font-bold text-orange-500">CornHub</h1>
                <p className="text-gray-500 text-xs">Free Corn Recipes</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search 847,000 corn recipes..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-orange-500 outline-none"
                />
                <button className="absolute right-0 top-0 h-full px-4 bg-orange-500 rounded-r text-white hover:bg-orange-600">
                  🔍
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white">
                <span className="text-xl">📤</span>
              </button>
              <Button
                variant="primary"
                size="sm"
                backgroundColor="#f97316"
                textColor="#ffffff"
              >
                Premium
              </Button>
              <button className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                👤
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category bar */}
      <div className="bg-gray-900 border-b border-gray-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 py-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap text-sm py-1 border-b-2 transition-colors ${
                  selectedCategory === cat.id
                    ? 'text-orange-500 border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedUser ? (
          <UserProfileView user={selectedUser} onBack={() => setSelectedUser(null)} allRecipes={recipes} />
        ) : selectedRecipe ? (
          <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} allRecipes={recipes} />
        ) : (
          <>
            {/* Premium Banner */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-500 rounded-lg p-6 mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Premium Recipes</h2>
                <p className="text-yellow-100">
                  Unlock exclusive chef techniques, extended recipe videos, and secret ingredients.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                backgroundColor="#ffffff"
                textColor="#f97316"
              >
                Try Premium Free
              </Button>
            </div>

            <div className="flex gap-8">
              {/* Main feed */}
              <div className="flex-1">
                {/* Most Watched */}
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-orange-500">🔥</span> Most Watched Recipes
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredRecipes.slice(0, 4).map(recipe => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => setSelectedRecipe(recipe)}
                      />
                    ))}
                  </div>
                </section>

                {/* Recent Uploads */}
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-white mb-4">Recently Uploaded</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredRecipes.slice(4).map(recipe => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => setSelectedRecipe(recipe)}
                      />
                    ))}
                  </div>
                </section>

                {/* Featured Creators */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4">Featured Recipe Creators</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FEATURED_USERS.map(user => (
                      <StyledCard
                        key={user.name}
                        bgColor="#2d2d2d"
                        borderColor="#404040"
                        padding="md"
                        borderRadius="lg"
                        interactive
                        onClick={() => setSelectedUser(user)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-1">
                              {user.name}
                              {user.verified && <span className="text-orange-500">✓</span>}
                            </p>
                            <p className="text-gray-500 text-sm">{formatViews(user.subscribers)} subscribers</p>
                            <p className="text-gray-500 text-xs">{user.recipes} recipes</p>
                          </div>
                        </div>
                      </StyledCard>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <aside className="w-72 hidden lg:block space-y-6">
                <div>
                  <h3 className="text-white font-bold mb-3">Recommended For You</h3>
                  <div className="space-y-3">
                    {recipes.slice(0, 5).map(recipe => (
                      <div
                        key={recipe.id}
                        className="flex gap-2 cursor-pointer group"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <div className="w-24 aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center text-xl shrink-0 relative">
                          {recipe.thumbnail}
                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] px-0.5 rounded">
                            {recipe.duration}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs text-white line-clamp-2 group-hover:text-orange-400">{recipe.title}</h4>
                          <p className="text-xs text-gray-500">{recipe.author}</p>
                          <p className="text-xs text-gray-500">{formatViews(recipe.views)} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories sidebar */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {cat.name}
                        <span className="text-xs text-gray-500 ml-1">({formatViews(cat.count)})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ad placeholder */}
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-xs mb-2">Advertisement</p>
                  <div className="bg-orange-500/20 rounded p-4">
                    <span className="text-4xl block mb-2">☕</span>
                    <p className="text-orange-400 text-sm font-bold">Quantum Coffee</p>
                    <p className="text-gray-400 text-xs">Observe your morning differently</p>
                    <p className="text-gray-500 text-xs mt-1">$47/cup - Worth it</p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 mt-12 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌽</span>
                <span className="text-xl font-bold text-orange-500">CornHub</span>
              </div>
              <p className="text-sm text-gray-500">
                The world's largest collection of free corn recipes. We're passionate about corn.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Recipes</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="hover:text-orange-400 cursor-pointer">Cornbread</li>
                <li className="hover:text-orange-400 cursor-pointer">Elote</li>
                <li className="hover:text-orange-400 cursor-pointer">Corn Chowder</li>
                <li className="hover:text-orange-400 cursor-pointer">Popcorn</li>
                <li className="hover:text-orange-400 cursor-pointer">Creamed Corn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Community</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="hover:text-orange-400 cursor-pointer">Upload Recipe</li>
                <li className="hover:text-orange-400 cursor-pointer">Become a Creator</li>
                <li className="hover:text-orange-400 cursor-pointer">Community Guidelines</li>
                <li className="hover:text-orange-400 cursor-pointer">Safety Center</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Company</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="hover:text-orange-400 cursor-pointer">About CornHub</li>
                <li className="hover:text-orange-400 cursor-pointer">Careers</li>
                <li className="hover:text-orange-400 cursor-pointer">Press</li>
                <li className="hover:text-orange-400 cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-600">
            <p>2024 CornHub - The Legitimate Corn Recipe Website</p>
            <p className="mt-2">
              Yes, we know what you thought this was. No, we don't know what you're talking about.
            </p>
            <p className="mt-2 text-xs">
              "It's just corn." - Legal Department
            </p>
            <p className="mt-2 text-xs text-gray-700">
              847,000 recipes and counting. Derek, call Jennifer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CornHubSite
