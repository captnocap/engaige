/**
 * Site Content Hooks
 *
 * Generic React hooks for fetching site content from the server.
 * Used by all filler site components to load DB-seeded content
 * with fallback to hardcoded data when DB is empty.
 */

import { useState, useEffect, useRef } from 'react'
import { useWSStore } from '../stores/wsStore.js'

// ============================================================================
// Types (mirrored from server/src/services/site-content.ts)
// ============================================================================

export interface SiteContentItem {
  id: string
  siteId: string
  contentType: string
  slug: string
  channelId?: string
  parentId?: string
  category?: string
  title: string
  subtitle?: string
  body?: string
  summary?: string
  thumbnailEmoji?: string
  thumbnailUrl?: string
  mediaUrls: string[]
  metadata: Record<string, any>
  tags: string[]
  entities: string[]
  keywords?: string
  viewCount: number
  likeCount: number
  commentCount: number
  engagementScore: number
  isFeatured: boolean
  isPinned: boolean
  isArchived: boolean
  publishedAt?: number
  createdAt: number
  updatedAt: number
}

export interface SiteChannel {
  id: string
  siteId: string
  slug: string
  name: string
  avatarEmoji?: string
  avatarUrl?: string
  description?: string
  metadata: Record<string, any>
  followerCount: number
  contentCount: number
  createdAt: number
  updatedAt: number
}

export interface SiteCategory {
  id: string
  siteId: string
  slug: string
  name: string
  description?: string
  iconEmoji?: string
  parentId?: string
  sortOrder: number
}

export interface SiteComment {
  id: string
  contentId: string
  parentCommentId?: string
  authorName: string
  authorAvatar?: string
  content: string
  likeCount: number
  dislikeCount: number
  isCreator: boolean
  publishedAt?: number
  createdAt: number
}

export interface SiteCommentTree extends SiteComment {
  replies: SiteCommentTree[]
}

export interface NewsArticle {
  id: string
  slug: string
  source: string
  headline: string
  subheadline?: string
  summary: string
  content: string
  category: string
  author: string
  publishedAt: number
  imageUrl?: string
  imageCaption?: string
  imageEmoji?: string
  tags: string[]
  entities: string[]
  sentiment?: string
  npcMentions: number
  createdAt: number
}

// ============================================================================
// Cache
// ============================================================================

const contentCache = new Map<string, { data: any; fetchedAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = contentCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    contentCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: any): void {
  contentCache.set(key, { data, fetchedAt: Date.now() })
}

// ============================================================================
// Hooks
// ============================================================================

export function useSiteContent(
  siteId: string,
  options?: {
    contentType?: string
    category?: string
    channelId?: string
    limit?: number
    offset?: number
    featured?: boolean
  }
) {
  const [content, setContent] = useState<SiteContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const request = useWSStore((s) => s.request)
  const connected = useWSStore((s) => s.connected)
  const fetchedRef = useRef(false)

  const cacheKey = `sites:${siteId}:${options?.contentType || ''}:${options?.category || ''}:${options?.channelId || ''}:${options?.limit || ''}:${options?.offset || ''}:${options?.featured ?? ''}`

  useEffect(() => {
    if (!connected || fetchedRef.current) return

    const cached = getCached<SiteContentItem[]>(cacheKey)
    if (cached) {
      setContent(cached)
      setLoading(false)
      fetchedRef.current = true
      return
    }

    fetchedRef.current = true
    request<any, { content: SiteContentItem[] }>('sites:getContent', {
      siteId,
      ...options,
    })
      .then((res) => {
        const items = res?.content ?? []
        setContent(items)
        setCache(cacheKey, items)
        setLoading(false)
      })
      .catch((err) => {
        console.warn(`[useSiteContent] Failed to fetch ${siteId}:`, err.message)
        setError(err.message)
        setLoading(false)
      })
  }, [connected]) // eslint-disable-line react-hooks/exhaustive-deps

  return { content, loading, error }
}

export function useSiteContentBySlug(siteId: string, slug: string | null) {
  const [item, setItem] = useState<SiteContentItem | null>(null)
  const [comments, setComments] = useState<SiteCommentTree[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const request = useWSStore((s) => s.request)
  const connected = useWSStore((s) => s.connected)

  useEffect(() => {
    if (!connected || !slug) {
      setLoading(false)
      return
    }

    const cacheKey = `sites:${siteId}:slug:${slug}`
    const cached = getCached<{ content: SiteContentItem | null; comments: SiteCommentTree[] }>(cacheKey)
    if (cached) {
      setItem(cached.content)
      setComments(cached.comments)
      setLoading(false)
      return
    }

    setLoading(true)
    request<any, { content: SiteContentItem | null; comments: SiteCommentTree[] }>('sites:getContentBySlug', {
      siteId,
      slug,
    })
      .then((res) => {
        setItem(res.content)
        setComments(res.comments || [])
        setCache(cacheKey, res)
        setLoading(false)
      })
      .catch((err) => {
        console.warn(`[useSiteContentBySlug] Failed to fetch ${siteId}/${slug}:`, err.message)
        setError(err.message)
        setLoading(false)
      })
  }, [connected, slug]) // eslint-disable-line react-hooks/exhaustive-deps

  return { item, comments, loading, error }
}

export function useSiteChannels(siteId: string) {
  const [channels, setChannels] = useState<SiteChannel[]>([])
  const [loading, setLoading] = useState(true)
  const request = useWSStore((s) => s.request)
  const connected = useWSStore((s) => s.connected)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!connected || fetchedRef.current) return

    const cacheKey = `channels:${siteId}`
    const cached = getCached<SiteChannel[]>(cacheKey)
    if (cached) {
      setChannels(cached)
      setLoading(false)
      fetchedRef.current = true
      return
    }

    fetchedRef.current = true
    request<any, { channels: SiteChannel[] }>('sites:getChannels', { siteId })
      .then((res) => {
        setChannels(res.channels)
        setCache(cacheKey, res.channels)
        setLoading(false)
      })
      .catch((err) => {
        console.warn(`[useSiteChannels] Failed to fetch channels for ${siteId}:`, err.message)
        setLoading(false)
      })
  }, [connected]) // eslint-disable-line react-hooks/exhaustive-deps

  return { channels, loading }
}

export function useSiteCategories(siteId: string) {
  const [categories, setCategories] = useState<SiteCategory[]>([])
  const [loading, setLoading] = useState(true)
  const request = useWSStore((s) => s.request)
  const connected = useWSStore((s) => s.connected)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!connected || fetchedRef.current) return

    const cacheKey = `categories:${siteId}`
    const cached = getCached<SiteCategory[]>(cacheKey)
    if (cached) {
      setCategories(cached)
      setLoading(false)
      fetchedRef.current = true
      return
    }

    fetchedRef.current = true
    request<any, { categories: SiteCategory[] }>('sites:getCategories', { siteId })
      .then((res) => {
        setCategories(res.categories)
        setCache(cacheKey, res.categories)
        setLoading(false)
      })
      .catch((err) => {
        console.warn(`[useSiteCategories] Failed to fetch categories for ${siteId}:`, err.message)
        setLoading(false)
      })
  }, [connected]) // eslint-disable-line react-hooks/exhaustive-deps

  return { categories, loading }
}

export function useNewsArticles(options?: { limit?: number; category?: string }) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const request = useWSStore((s) => s.request)
  const connected = useWSStore((s) => s.connected)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!connected || fetchedRef.current) return

    const cacheKey = `news:articles:${options?.limit || ''}:${options?.category || ''}`
    const cached = getCached<NewsArticle[]>(cacheKey)
    if (cached) {
      setArticles(cached)
      setLoading(false)
      fetchedRef.current = true
      return
    }

    fetchedRef.current = true
    request<any, { articles: NewsArticle[] }>('news:getArticles', options || {})
      .then((res) => {
        setArticles(res.articles)
        setCache(cacheKey, res.articles)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('[useNewsArticles] Failed to fetch articles:', err.message)
        setLoading(false)
      })
  }, [connected]) // eslint-disable-line react-hooks/exhaustive-deps

  return { articles, loading }
}

export function useNewsArticle(slug: string | null) {
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const request = useWSStore((s) => s.request)
  const connected = useWSStore((s) => s.connected)

  useEffect(() => {
    if (!connected || !slug) {
      setLoading(false)
      return
    }

    const cacheKey = `news:article:${slug}`
    const cached = getCached<NewsArticle>(cacheKey)
    if (cached) {
      setArticle(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    request<any, { article: NewsArticle | null }>('news:getArticle', { slug })
      .then((res) => {
        setArticle(res.article)
        if (res.article) setCache(cacheKey, res.article)
        setLoading(false)
      })
      .catch((err) => {
        console.warn(`[useNewsArticle] Failed to fetch article ${slug}:`, err.message)
        setLoading(false)
      })
  }, [connected, slug]) // eslint-disable-line react-hooks/exhaustive-deps

  return { article, loading }
}
