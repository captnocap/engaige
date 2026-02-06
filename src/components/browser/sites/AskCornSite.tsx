/**
 * AskCorn Site - Stack Overflow / Yahoo Answers Parody
 *
 * A Q&A site where questions range from technical to unhinged.
 * Features corn kernels as reputation points and lore-integrated questions.
 *
 * All Q&A content is fetched exclusively from the database.
 *
 * URL: www.askcorn.corn
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, useSiteCategories, type SiteContentItem, type SiteCategory } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Site Theme Configuration
// ============================================================================

const SITE_THEME = {
  id: 'askcorn',
  name: 'AskCorn',
  tagline: 'Where Every Question Pops',
  url: 'www.askcorn.corn',
  icon: '\u{1F33D}',
  primary: '#F48024',      // Stack Overflow orange
  secondary: '#0077CC',    // Stack Overflow blue
  background: '#f8f9f9',   // Light grey
  surface: '#ffffff',      // White
  text: '#232629',         // Near black
  textMuted: '#6a737c',    // Grey
  border: '#d6d9dc',       // Light border
  tagBg: '#e1ecf4',        // Tag background
  tagText: '#39739d',      // Tag text
  accepted: '#2f6f44',     // Accepted answer green
  closed: '#9199a1',       // Closed question grey
  gold: '#ffcc00',         // Gold badge
  silver: '#b4b8bc',       // Silver badge
  bronze: '#d1a684',       // Bronze badge
}

// ============================================================================
// Types
// ============================================================================

interface Tag {
  name: string
  count: number
}

interface Answer {
  id: string
  author: string
  authorRep: number
  content: string
  votes: number
  isAccepted: boolean
  timestamp: string
  comments?: AnswerComment[]
}

interface AnswerComment {
  author: string
  content: string
  timestamp: string
}

interface Question {
  id: string
  title: string
  content: string
  author: string
  authorRep: number
  votes: number
  views: number
  answerCount: number
  timestamp: string
  tags: string[]
  answers: Answer[]
  isClosed?: boolean
  closeReason?: string
  isDuplicate?: boolean
  duplicateOf?: string
}

interface User {
  username: string
  reputation: number
  badges: { gold: number; silver: number; bronze: number }
  about?: string
  topTags?: string[]
}

// ============================================================================
// DB-to-Local Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Question interface */
function dbToQuestion(item: SiteContentItem): Question {
  const m = item.metadata || {}
  // Map answers from metadata, adapting each to the local Answer interface
  const rawAnswers: any[] = m.answers || []
  const answers: Answer[] = rawAnswers.map((a: any, idx: number) => ({
    id: a.id || `${item.slug}_a${idx}`,
    author: a.author || 'anonymous',
    authorRep: a.authorRep ?? 0,
    content: a.content || '',
    votes: a.votes ?? 0,
    isAccepted: a.isAccepted ?? false,
    timestamp: a.timestamp || '',
    comments: (a.comments || []).map((c: any) => ({
      author: c.author || 'anonymous',
      content: c.content || '',
      timestamp: c.timestamp || '',
    })),
  }))

  return {
    id: item.slug,
    title: item.title,
    content: item.body || item.summary || '',
    author: m.author || 'anonymous',
    authorRep: m.authorRep ?? 0,
    votes: item.likeCount || m.votes || 0,
    views: item.viewCount || m.views || 0,
    answerCount: m.answerCount ?? answers.length,
    timestamp: m.timestamp || '',
    tags: item.tags,
    answers,
    isClosed: m.isClosed,
    closeReason: m.closeReason,
    isDuplicate: m.isDuplicate,
    duplicateOf: m.duplicateOf,
  }
}

/** Adapt a DB SiteCategory to the local Tag interface */
function dbCategoryToTag(cat: SiteCategory): Tag {
  return {
    name: cat.slug,
    count: cat.sortOrder || 0,
  }
}

/** Adapt a DB SiteContentItem (user-type content) to the local User interface */
function dbToUser(item: SiteContentItem): User {
  const m = item.metadata || {}
  return {
    username: item.slug,
    reputation: m.reputation ?? item.likeCount ?? 0,
    badges: m.badges || { gold: 0, silver: 0, bronze: 0 },
    about: item.summary || m.about || undefined,
    topTags: m.topTags || item.tags || undefined,
  }
}

// ============================================================================
// Hot Network Questions (Sidebar) - static UI config
// ============================================================================

const HOT_NETWORK_QUESTIONS = [
  { title: 'Why does my quantum-brewed coffee taste like regret?', site: 'cooking.askcorn', votes: 156 },
  { title: 'Is it legal to marry a building? Asking for research purposes', site: 'law.askcorn', votes: 234 },
  { title: 'How to explain to my parents I\'m a professional trust faller?', site: 'parenting.askcorn', votes: 892 },
  { title: 'My AI assistant started speaking in tongues after visiting floor 7', site: 'tech.askcorn', votes: 1234 },
  { title: 'Can cats observe quantum states? My cat says yes', site: 'pets.askcorn', votes: 567 },
  { title: 'Recovering from a 6-foot trust fall drop: AMA', site: 'health.askcorn', votes: 847 },
]

// ============================================================================
// Components
// ============================================================================

export function AskCornSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB (database is the sole source of truth)
  const { content: dbContent } = useSiteContent('askcorn')
  const { content: dbUserContent } = useSiteContent('askcorn', { contentType: 'user' })
  const { categories: dbCategories } = useSiteCategories('askcorn')

  // Derive questions from DB content (database is the sole source of truth)
  const questions = useMemo(() => {
    const questionContent = dbContent.filter(item => item.contentType !== 'user')
    return questionContent.map(dbToQuestion)
  }, [dbContent])

  // Derive tags from DB categories (database is the sole source of truth)
  const popularTags = useMemo(() => dbCategories.map(dbCategoryToTag), [dbCategories])

  // Derive users from DB user-type content (database is the sole source of truth)
  const sampleUsers = useMemo((): Record<string, User> => {
    const map: Record<string, User> = {}
    for (const item of dbUserContent) {
      const user = dbToUser(item)
      map[user.username] = user
    }
    return map
  }, [dbUserContent])

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'questions' | 'tags' | 'users'>('questions')
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})

  // Track if we're updating from path
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path || path === '/') {
      // Homepage - clear all selections
      setSelectedQuestion(null)
      setSelectedUser(null)
      setSelectedTag(null)
    } else if (path.startsWith('/question/')) {
      // Question detail view: /question/question-id
      const questionId = path.slice('/question/'.length)
      const question = questions.find(q => q.id === questionId)
      if (question) {
        setSelectedQuestion(question)
        setSelectedUser(null)
        setSelectedTag(null)
      }
    } else if (path.startsWith('/user/')) {
      // User profile view: /user/username
      const username = path.slice('/user/'.length)
      const user = sampleUsers[username]
      if (user) {
        setSelectedUser(user)
        setSelectedQuestion(null)
        setSelectedTag(null)
      }
    } else if (path.startsWith('/tag/')) {
      // Tag filter view: /tag/tagname
      const tagName = path.slice('/tag/'.length)
      setSelectedTag(tagName)
      setSelectedQuestion(null)
      setSelectedUser(null)
      setActiveTab('questions')
    }

    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, questions, sampleUsers])

  // Navigation handlers
  const handleSelectQuestion = (question: Question) => {
    // Find full question data
    const fullQuestion = questions.find(q => q.id === question.id)
    if (fullQuestion) {
      setSelectedQuestion(fullQuestion)
      setSelectedUser(null)
      setSelectedTag(null)
      onPathChange('/question/' + question.id)
    }
  }

  const handleSelectUser = (username: string) => {
    const user = sampleUsers[username]
    if (user) {
      setSelectedUser(user)
      setSelectedQuestion(null)
      setSelectedTag(null)
      onPathChange('/user/' + username)
    }
  }

  const handleSelectTag = (tagName: string) => {
    setSelectedTag(tagName)
    setSelectedQuestion(null)
    setSelectedUser(null)
    setActiveTab('questions')
    onPathChange('/tag/' + tagName)
  }

  const handleBackToHome = () => {
    setSelectedQuestion(null)
    setSelectedUser(null)
    setSelectedTag(null)
    onPathChange(null)
  }

  const handleVote = (id: string, direction: 1 | -1) => {
    setUserVotes(prev => ({
      ...prev,
      [id]: prev[id] === direction ? 0 : direction,
    }))
  }

  // All questions for listing (DB provides the full set)
  const allQuestionsForList = questions

  // Filter questions by selected tag if applicable
  const filteredQuestions = selectedTag
    ? allQuestionsForList.filter(q => q.tags.includes(selectedTag))
    : allQuestionsForList

  return (
    <div className="min-h-full" style={{ background: SITE_THEME.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: SITE_THEME.surface, borderBottom: `1px solid ${SITE_THEME.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-12 gap-4">
            {/* Logo */}
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:opacity-80 shrink-0"
            >
              <span className="text-2xl">{SITE_THEME.icon}</span>
              <span className="text-xl font-bold" style={{ color: SITE_THEME.text }}>
                ask<span style={{ color: SITE_THEME.primary }}>corn</span>
              </span>
            </button>

            {/* Navigation */}
            <nav className="flex items-center gap-1 ml-4">
              {(['questions', 'tags', 'users'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    handleBackToHome()
                  }}
                  className="px-3 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                  style={{
                    color: activeTab === tab ? SITE_THEME.primary : SITE_THEME.textMuted,
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-xl ml-4">
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full px-3 py-1.5 text-sm rounded"
                style={{
                  background: SITE_THEME.background,
                  border: `1px solid ${SITE_THEME.border}`,
                  color: SITE_THEME.text,
                }}
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="primary"
                size="sm"
                backgroundColor={SITE_THEME.primary}
                textColor="white"
              >
                Log In
              </Button>
              <Button
                variant="secondary"
                size="sm"
                backgroundColor={SITE_THEME.secondary}
                textColor="white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-40 shrink-0 hidden lg:block">
            <nav className="space-y-1">
              <SidebarLink label="Home" isActive icon="\u{1F3E0}" onClick={handleBackToHome} />
              <SidebarLink label="Questions" icon="\u{2753}" onClick={() => setActiveTab('questions')} />
              <SidebarLink label="Tags" icon="\u{1F3F7}\u{FE0F}" onClick={() => setActiveTab('tags')} />
              <SidebarLink label="Users" icon="\u{1F465}" onClick={() => setActiveTab('users')} />
              <div className="pt-4 pb-2">
                <span className="text-xs font-semibold uppercase" style={{ color: SITE_THEME.textMuted }}>
                  Collectives
                </span>
              </div>
              <SidebarLink label="Quantum Coffee" icon="\u{2615}" />
              <SidebarLink label="Hartwell Research" icon="\u{1F3DA}\u{FE0F}" />
              <SidebarLink label="Trust Fall Network" icon="\u{1F646}\u{200D}\u{2642}\u{FE0F}" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {selectedQuestion ? (
              <QuestionDetail
                question={selectedQuestion}
                onBack={handleBackToHome}
                userVotes={userVotes}
                onVote={handleVote}
                onSelectUser={handleSelectUser}
                onSelectTag={handleSelectTag}
              />
            ) : selectedUser ? (
              <UserProfile
                user={selectedUser}
                questions={questions}
                onBack={handleBackToHome}
                onSelectQuestion={handleSelectQuestion}
              />
            ) : selectedTag ? (
              <TagFilterView
                tagName={selectedTag}
                questions={filteredQuestions}
                popularTags={popularTags}
                onBack={handleBackToHome}
                onSelectQuestion={handleSelectQuestion}
                userVotes={userVotes}
                onVote={handleVote}
              />
            ) : activeTab === 'tags' ? (
              <TagsList tags={popularTags} onSelectTag={handleSelectTag} />
            ) : activeTab === 'users' ? (
              <UsersList users={Object.values(sampleUsers)} onSelectUser={handleSelectUser} />
            ) : (
              <QuestionsList
                questions={filteredQuestions}
                onSelectQuestion={handleSelectQuestion}
                userVotes={userVotes}
                onVote={handleVote}
                onSelectTag={handleSelectTag}
              />
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-72 shrink-0 space-y-4 hidden md:block">
            {/* Hot Network Questions */}
            <StyledCard
              bgColor={SITE_THEME.surface}
              borderColor={SITE_THEME.border}
              padding="0"
              borderRadius="sm"
              shadow="sm"
              className="overflow-hidden"
            >
              <div
                className="px-3 py-2 text-sm font-semibold"
                style={{ background: SITE_THEME.tagBg, color: SITE_THEME.text }}
              >
                Hot Network Questions
              </div>
              <div className="divide-y" style={{ borderColor: SITE_THEME.border }}>
                {HOT_NETWORK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-xs mb-1" style={{ color: SITE_THEME.secondary }}>
                      {q.site}
                    </p>
                    <p className="text-sm leading-snug" style={{ color: SITE_THEME.secondary }}>
                      {q.title}
                    </p>
                  </button>
                ))}
              </div>
            </StyledCard>

            {/* Popular Tags */}
            <StyledCard
              bgColor={SITE_THEME.surface}
              borderColor={SITE_THEME.border}
              padding="md"
              borderRadius="sm"
              shadow="sm"
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: SITE_THEME.text }}>
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 6).map((tag) => (
                  <TagBadge key={tag.name} name={tag.name} count={tag.count} onClick={() => handleSelectTag(tag.name)} />
                ))}
              </div>
            </StyledCard>

            {/* Ad Widget */}
            <SidebarAdWidget
              siteId="askcorn"
              onNavigate={onNavigate}
              title="Sponsored"
              count={1}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Sidebar Link Component
// ============================================================================

interface SidebarLinkProps {
  label: string
  icon?: string
  isActive?: boolean
  onClick?: () => void
}

function SidebarLink({ label, icon, isActive, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors"
      style={{
        background: isActive ? SITE_THEME.tagBg : 'transparent',
        color: isActive ? SITE_THEME.text : SITE_THEME.textMuted,
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  )
}

// ============================================================================
// Tag Badge Component
// ============================================================================

interface TagBadgeProps {
  name: string
  count?: number
  size?: 'sm' | 'md'
  onClick?: () => void
}

function TagBadge({ name, count, size = 'sm', onClick }: TagBadgeProps) {
  const baseClasses = `inline-flex items-center gap-1 rounded ${size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'}`
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${clickableClasses}`}
        style={{ background: SITE_THEME.tagBg, color: SITE_THEME.tagText }}
      >
        {name}
        {count !== undefined && (
          <span style={{ color: SITE_THEME.textMuted }}>x{count.toLocaleString()}</span>
        )}
      </button>
    )
  }

  return (
    <span
      className={baseClasses}
      style={{ background: SITE_THEME.tagBg, color: SITE_THEME.tagText }}
    >
      {name}
      {count !== undefined && (
        <span style={{ color: SITE_THEME.textMuted }}>x{count.toLocaleString()}</span>
      )}
    </span>
  )
}

// ============================================================================
// Questions List Component
// ============================================================================

interface QuestionsListProps {
  questions: Question[]
  onSelectQuestion: (question: Question) => void
  userVotes: Record<string, number>
  onVote: (id: string, direction: 1 | -1) => void
  onSelectTag?: (tagName: string) => void
}

function QuestionsList({ questions, onSelectQuestion, userVotes, onVote, onSelectTag }: QuestionsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl" style={{ color: SITE_THEME.text }}>All Questions</h1>
        <Button
          variant="primary"
          size="sm"
          backgroundColor={SITE_THEME.secondary}
          textColor="white"
        >
          Ask Question
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <span className="text-sm" style={{ color: SITE_THEME.textMuted }}>
          {questions.length.toLocaleString()} questions
        </span>
        <div className="flex-1" />
        <div className="flex gap-1">
          {['Newest', 'Active', 'Unanswered'].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1 text-sm rounded"
              style={{
                background: filter === 'Newest' ? SITE_THEME.primary : 'transparent',
                color: filter === 'Newest' ? 'white' : SITE_THEME.textMuted,
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: SITE_THEME.border }}>
        {questions.map((question) => (
          <QuestionRow
            key={question.id}
            question={question}
            onClick={() => onSelectQuestion(question)}
            userVote={userVotes[question.id] || 0}
            onVote={(dir) => onVote(question.id, dir)}
            onSelectTag={onSelectTag}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Question Row Component
// ============================================================================

interface QuestionRowProps {
  question: Question
  onClick: () => void
  userVote: number
  onVote: (direction: 1 | -1) => void
  onSelectTag?: (tagName: string) => void
}

function QuestionRow({ question, onClick, userVote, onVote, onSelectTag }: QuestionRowProps) {
  const displayVotes = question.votes + userVote

  return (
    <div className="py-4 flex gap-4">
      {/* Stats */}
      <div className="w-24 shrink-0 text-right space-y-1">
        <div
          className="text-sm"
          style={{ color: userVote !== 0 ? SITE_THEME.primary : SITE_THEME.text }}
        >
          <span className="font-semibold">{displayVotes.toLocaleString()}</span>
          <span className="ml-1" style={{ color: SITE_THEME.textMuted }}>votes</span>
        </div>
        <div
          className="text-sm px-2 py-0.5 rounded"
          style={{
            background: question.answerCount > 0 && question.answers?.some(a => a.isAccepted)
              ? SITE_THEME.accepted
              : question.answerCount > 0 ? SITE_THEME.tagBg : 'transparent',
            color: question.answerCount > 0 && question.answers?.some(a => a.isAccepted)
              ? 'white'
              : question.answerCount > 0 ? SITE_THEME.accepted : SITE_THEME.textMuted,
            border: question.answerCount > 0 ? 'none' : `1px solid ${SITE_THEME.border}`,
          }}
        >
          <span className="font-semibold">{question.answerCount}</span>
          <span className="ml-1">answers</span>
        </div>
        <div className="text-sm" style={{ color: SITE_THEME.textMuted }}>
          {question.views.toLocaleString()} views
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <button
          onClick={onClick}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <h3
            className="text-base font-normal leading-snug mb-1"
            style={{ color: SITE_THEME.secondary }}
          >
            {question.isClosed && (
              <span
                className="inline-block px-1.5 py-0.5 text-xs rounded mr-2"
                style={{ background: SITE_THEME.closed, color: 'white' }}
              >
                {question.isDuplicate ? 'duplicate' : 'closed'}
              </span>
            )}
            {question.title}
          </h3>
        </button>

        <div className="flex flex-wrap gap-1 mb-2">
          {question.tags.map((tag) => (
            <TagBadge key={tag} name={tag} onClick={onSelectTag ? () => onSelectTag(tag) : undefined} />
          ))}
        </div>

        <MetaRow
          items={[
            { value: question.timestamp },
            { value: `asked by ${question.author}`, style: { color: SITE_THEME.secondary } },
            { value: `${question.authorRep?.toLocaleString() || '0'} kernels` },
          ]}
          textSize="xs"
          textColor={SITE_THEME.text}
          mutedColor={SITE_THEME.textMuted}
          separator=""
          className="gap-2"
        />
      </div>
    </div>
  )
}

// ============================================================================
// Question Detail Component
// ============================================================================

interface QuestionDetailProps {
  question: Question
  onBack: () => void
  userVotes: Record<string, number>
  onVote: (id: string, direction: 1 | -1) => void
  onSelectUser: (username: string) => void
  onSelectTag: (tagName: string) => void
}

function QuestionDetail({ question, onBack, userVotes, onVote, onSelectUser, onSelectTag }: QuestionDetailProps) {
  const displayVotes = question.votes + (userVotes[question.id] || 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-4 pb-4" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-xl leading-snug" style={{ color: SITE_THEME.text }}>
            {question.title}
          </h1>
          <Button
            variant="primary"
            size="sm"
            backgroundColor={SITE_THEME.secondary}
            textColor="white"
            className="shrink-0"
          >
            Ask Question
          </Button>
        </div>
        <MetaRow
          items={[
            { value: `Asked ${question.timestamp}` },
            { value: `Viewed ${question.views.toLocaleString()} times` },
          ]}
          textSize="sm"
          textColor={SITE_THEME.text}
          mutedColor={SITE_THEME.textMuted}
          separator=""
          className="gap-4"
        />
      </div>

      {/* Closed Notice */}
      {question.isClosed && (
        <div
          className="mb-4 p-3 rounded text-sm"
          style={{ background: '#fdf7e2', border: '1px solid #e6cf7e' }}
        >
          <strong>Closed.</strong> {question.closeReason}
          {question.isDuplicate && (
            <span className="ml-1" style={{ color: SITE_THEME.secondary }}>
              This question already has answers here.
            </span>
          )}
        </div>
      )}

      {/* Question Content */}
      <div className="flex gap-4 mb-6">
        {/* Vote Column */}
        <div className="w-12 shrink-0 flex flex-col items-center gap-1">
          <button
            onClick={() => onVote(question.id, 1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 36 36"
              fill={userVotes[question.id] === 1 ? SITE_THEME.primary : SITE_THEME.border}
            >
              <path d="M18 6l-12 12h8v12h8v-12h8z" />
            </svg>
          </button>
          <span
            className="text-xl font-medium"
            style={{ color: userVotes[question.id] ? SITE_THEME.primary : SITE_THEME.text }}
          >
            {displayVotes}
          </span>
          <button
            onClick={() => onVote(question.id, -1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 36 36"
              fill={userVotes[question.id] === -1 ? SITE_THEME.primary : SITE_THEME.border}
            >
              <path d="M18 30l12-12h-8v-12h-8v12h-8z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div
            className="prose prose-sm max-w-none mb-4 whitespace-pre-wrap"
            style={{ color: SITE_THEME.text }}
          >
            {question.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {question.tags.map((tag) => (
              <TagBadge key={tag} name={tag} onClick={() => onSelectTag(tag)} />
            ))}
          </div>

          {/* Author Card */}
          <div className="flex justify-end">
            <button
              onClick={() => onSelectUser(question.author)}
              className="p-3 rounded text-left hover:bg-gray-50 transition-colors"
              style={{ background: SITE_THEME.tagBg }}
            >
              <div className="text-xs mb-1" style={{ color: SITE_THEME.textMuted }}>
                asked {question.timestamp}
              </div>
              <div className="flex items-center gap-2">
                <Avatar
                  name={question.author}
                  size="sm"
                  backgroundColor={SITE_THEME.primary}
                  textColor="white"
                />
                <div>
                  <div className="text-sm" style={{ color: SITE_THEME.secondary }}>
                    {question.author}
                  </div>
                  <div className="text-xs" style={{ color: SITE_THEME.textMuted }}>
                    {question.authorRep.toLocaleString()} corn kernels
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-4">
        <h2 className="text-lg mb-4" style={{ color: SITE_THEME.text }}>
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>

        <div className="space-y-6">
          {question.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              userVote={userVotes[answer.id] || 0}
              onVote={(dir) => onVote(answer.id, dir)}
              onSelectUser={onSelectUser}
            />
          ))}
        </div>
      </div>

      {/* Your Answer */}
      <div className="pt-4" style={{ borderTop: `1px solid ${SITE_THEME.border}` }}>
        <h2 className="text-lg mb-4" style={{ color: SITE_THEME.text }}>
          Your Answer
        </h2>
        <textarea
          className="w-full p-3 rounded text-sm resize-none mb-3"
          rows={8}
          placeholder="Write your answer here..."
          style={{
            border: `1px solid ${SITE_THEME.border}`,
            color: SITE_THEME.text,
          }}
        />
        <Button
          variant="primary"
          backgroundColor={SITE_THEME.secondary}
          textColor="white"
        >
          Post Your Answer
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Answer Card Component
// ============================================================================

interface AnswerCardProps {
  answer: Answer
  userVote: number
  onVote: (direction: 1 | -1) => void
  onSelectUser: (username: string) => void
}

function AnswerCard({ answer, userVote, onVote, onSelectUser }: AnswerCardProps) {
  const displayVotes = answer.votes + userVote

  return (
    <div className="flex gap-4 pb-6" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
      {/* Vote Column */}
      <div className="w-12 shrink-0 flex flex-col items-center gap-1">
        <button
          onClick={() => onVote(1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 36 36"
            fill={userVote === 1 ? SITE_THEME.primary : SITE_THEME.border}
          >
            <path d="M18 6l-12 12h8v12h8v-12h8z" />
          </svg>
        </button>
        <span
          className="text-xl font-medium"
          style={{ color: userVote ? SITE_THEME.primary : SITE_THEME.text }}
        >
          {displayVotes}
        </span>
        <button
          onClick={() => onVote(-1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 36 36"
            fill={userVote === -1 ? SITE_THEME.primary : SITE_THEME.border}
          >
            <path d="M18 30l12-12h-8v-12h-8v12h-8z" />
          </svg>
        </button>
        {answer.isAccepted && (
          <svg
            className="w-10 h-10 mt-2"
            viewBox="0 0 36 36"
            fill={SITE_THEME.accepted}
          >
            <path d="M6 18l8 8 16-16-3-3-13 13-5-5z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div
          className="prose prose-sm max-w-none mb-4 whitespace-pre-wrap"
          style={{ color: SITE_THEME.text }}
        >
          {answer.content}
        </div>

        {/* Author Card */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => onSelectUser(answer.author)}
            className="p-3 rounded text-left hover:bg-gray-50 transition-colors"
            style={{ background: answer.isAccepted ? '#d4edda' : SITE_THEME.background }}
          >
            <div className="text-xs mb-1" style={{ color: SITE_THEME.textMuted }}>
              answered {answer.timestamp}
            </div>
            <div className="flex items-center gap-2">
              <Avatar
                name={answer.author}
                size="sm"
                backgroundColor={answer.isAccepted ? SITE_THEME.accepted : SITE_THEME.secondary}
                textColor="white"
              />
              <div>
                <div className="text-sm" style={{ color: SITE_THEME.secondary }}>
                  {answer.author}
                </div>
                <div className="text-xs" style={{ color: SITE_THEME.textMuted }}>
                  {answer.authorRep.toLocaleString()} corn kernels
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Comments */}
        {answer.comments && answer.comments.length > 0 && (
          <div className="pl-4" style={{ borderLeft: `2px solid ${SITE_THEME.border}` }}>
            {answer.comments.map((comment, i) => (
              <div
                key={i}
                className="py-2 text-sm"
                style={{ borderBottom: i < answer.comments!.length - 1 ? `1px solid ${SITE_THEME.border}` : 'none' }}
              >
                <span style={{ color: SITE_THEME.text }}>{comment.content}</span>
                <span className="mx-1" style={{ color: SITE_THEME.textMuted }}>-</span>
                <span style={{ color: SITE_THEME.secondary }}>{comment.author}</span>
                <span className="ml-2" style={{ color: SITE_THEME.textMuted }}>{comment.timestamp}</span>
              </div>
            ))}
            <button
              className="text-sm py-2"
              style={{ color: SITE_THEME.textMuted }}
            >
              Add a comment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Tags List Component
// ============================================================================

interface TagsListProps {
  tags: Tag[]
  onSelectTag: (tagName: string) => void
}

function TagsList({ tags, onSelectTag }: TagsListProps) {
  return (
    <div>
      <h1 className="text-2xl mb-4" style={{ color: SITE_THEME.text }}>Tags</h1>
      <p className="text-sm mb-4" style={{ color: SITE_THEME.textMuted }}>
        A tag is a keyword or label that categorizes your question with other, similar questions.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => onSelectTag(tag.name)}
            className="text-left p-4 rounded hover:shadow-md transition-shadow"
            style={{ background: SITE_THEME.surface, border: `1px solid ${SITE_THEME.border}` }}
          >
            <TagBadge name={tag.name} size="md" />
            <p className="text-sm mt-2" style={{ color: SITE_THEME.textMuted }}>
              {tag.count.toLocaleString()} questions
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Tag Filter View Component
// ============================================================================

interface TagFilterViewProps {
  tagName: string
  questions: Question[]
  popularTags: Tag[]
  onBack: () => void
  onSelectQuestion: (question: Question) => void
  userVotes: Record<string, number>
  onVote: (id: string, direction: 1 | -1) => void
}

function TagFilterView({ tagName, questions, popularTags, onBack, onSelectQuestion, userVotes, onVote }: TagFilterViewProps) {
  // Find tag info from popularTags if available
  const tagInfo = popularTags.find(t => t.name === tagName)

  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={SITE_THEME.secondary}
        className="mb-4"
      >
        &larr; Back to all questions
      </Button>

      <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <TagBadge name={tagName} size="md" />
        <div>
          <h1 className="text-xl" style={{ color: SITE_THEME.text }}>
            Questions tagged [{tagName}]
          </h1>
          <p className="text-sm" style={{ color: SITE_THEME.textMuted }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
            {tagInfo && ` (${tagInfo.count.toLocaleString()} total)`}
          </p>
        </div>
      </div>

      {questions.length > 0 ? (
        <div className="divide-y" style={{ borderColor: SITE_THEME.border }}>
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              onClick={() => onSelectQuestion(question)}
              userVote={userVotes[question.id] || 0}
              onVote={(dir) => onVote(question.id, dir)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: SITE_THEME.textMuted }}>
          No questions found with this tag.
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Users List Component
// ============================================================================

interface UsersListProps {
  users: User[]
  onSelectUser: (username: string) => void
}

function UsersList({ users, onSelectUser }: UsersListProps) {
  return (
    <div>
      <h1 className="text-2xl mb-4" style={{ color: SITE_THEME.text }}>Users</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <button
            key={user.username}
            onClick={() => onSelectUser(user.username)}
            className="text-left p-4 rounded hover:shadow-md transition-shadow"
            style={{ background: SITE_THEME.surface, border: `1px solid ${SITE_THEME.border}` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Avatar
                name={user.username}
                size="md"
                backgroundColor={SITE_THEME.primary}
                textColor="white"
              />
              <div>
                <div className="font-medium" style={{ color: SITE_THEME.secondary }}>
                  {user.username}
                </div>
                <div className="text-sm" style={{ color: SITE_THEME.textMuted }}>
                  {user.reputation.toLocaleString()} kernels
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs" style={{ color: SITE_THEME.gold }}>
                {'\u25CF'} {user.badges.gold}
              </span>
              <span className="text-xs" style={{ color: SITE_THEME.silver }}>
                {'\u25CF'} {user.badges.silver}
              </span>
              <span className="text-xs" style={{ color: SITE_THEME.bronze }}>
                {'\u25CF'} {user.badges.bronze}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// User Profile Component
// ============================================================================

interface UserProfileProps {
  user: User
  questions: Question[]
  onBack: () => void
  onSelectQuestion: (question: Question) => void
}

function UserProfile({ user, questions, onBack, onSelectQuestion }: UserProfileProps) {
  // Find questions by this user from the passed-in questions array
  const userQuestions = questions.filter(q => q.author === user.username)

  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={SITE_THEME.secondary}
        className="mb-4"
      >
        &larr; Back to questions
      </Button>

      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-6 pb-6" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <Avatar
          name={user.username}
          size="lg"
          backgroundColor={SITE_THEME.primary}
          textColor="white"
        />
        <div className="flex-1">
          <h1 className="text-2xl mb-1" style={{ color: SITE_THEME.text }}>
            {user.username}
          </h1>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-lg font-semibold" style={{ color: SITE_THEME.primary }}>
              {user.reputation.toLocaleString()} corn kernels
            </span>
            <div className="flex gap-2">
              <span style={{ color: SITE_THEME.gold }}>
                {'\u25CF'} {user.badges.gold} gold
              </span>
              <span style={{ color: SITE_THEME.silver }}>
                {'\u25CF'} {user.badges.silver} silver
              </span>
              <span style={{ color: SITE_THEME.bronze }}>
                {'\u25CF'} {user.badges.bronze} bronze
              </span>
            </div>
          </div>
          {user.about && (
            <p className="text-sm" style={{ color: SITE_THEME.textMuted }}>
              {user.about}
            </p>
          )}
        </div>
      </div>

      {/* Top Tags */}
      {user.topTags && user.topTags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg mb-3" style={{ color: SITE_THEME.text }}>Top Tags</h2>
          <div className="flex flex-wrap gap-2">
            {user.topTags.map((tag) => (
              <TagBadge key={tag} name={tag} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* User's Questions */}
      <div>
        <h2 className="text-lg mb-3" style={{ color: SITE_THEME.text }}>Questions</h2>
        {userQuestions.length > 0 ? (
          <div className="space-y-3">
            {userQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="w-full text-left p-3 rounded hover:bg-gray-50 transition-colors"
                style={{ border: `1px solid ${SITE_THEME.border}` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{ background: SITE_THEME.tagBg, color: SITE_THEME.accepted }}
                  >
                    {q.votes}
                  </span>
                  <span style={{ color: SITE_THEME.secondary }}>{q.title}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: SITE_THEME.textMuted }}>
            No questions yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default AskCornSite
