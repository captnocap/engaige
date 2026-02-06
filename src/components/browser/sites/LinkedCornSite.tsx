/**
 * LinkedCorn Site - Professional Networking for the Corn Industry
 *
 * A parody of LinkedIn (www.linkedcorn.corn) featuring:
 * - Blue professional color scheme
 * - Corporate buzzword-heavy posts about corn
 * - Job listings at lore companies (Omnicorp, Quantum Brew, Hartwell Industries)
 * - "People You May Know" with established NPCs
 * - Endorsement skills like "Corn Synergy" and "Kernel Optimization"
 * - The 847 easter egg throughout
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// Use the config or define locally
const site = FILLER_SITES.linkedcorn ?? {
  id: 'linkedcorn',
  name: 'LinkedCorn',
  tagline: 'The Professional Network for Agricultural Excellence',
  url: 'www.linkedcorn.corn',
  icon: '🌽',
  theme: {
    primary: '#0a66c2',      // LinkedIn blue
    secondary: '#004182',    // Darker blue
    background: '#f4f2ee',   // LinkedIn warm grey
    surface: '#ffffff',      // White cards
    text: '#191919',         // Near black
    textMuted: '#666666',    // Grey
    border: '#e0dfdc',       // Light border
    accent: '#57a773',       // Corn green accent
  },
}

// ============================================================================
// Types
// ============================================================================

interface Profile {
  id: string
  name: string
  headline: string
  company: string
  avatar: string
  connections: number
  isOpenToWork?: boolean
  isHiring?: boolean
  pronouns?: string
  location?: string
  skills: string[]
  experience?: {
    title: string
    company: string
    duration: string
    description?: string
  }[]
  education?: {
    school: string
    degree: string
    year: string
  }[]
}

interface Post {
  id: string
  author: Profile
  content: string
  timestamp: string
  likes: number
  comments: number
  reposts: number
  hashtags?: string[]
  isRepost?: boolean
  repostAuthor?: string
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  posted: string
  applicants: number
  description: string
  requirements: string[]
  companyLogo: string
}

interface Notification {
  id: string
  type: 'view' | 'connection' | 'like' | 'comment' | 'job'
  content: string
  timestamp: string
  read: boolean
}

// ============================================================================
// Sample Data - Profiles
// ============================================================================

const PROFILES: Profile[] = [
  {
    id: 'derek',
    name: 'Derek Observerson',
    headline: 'Independent Quantum Beverage Researcher | Coffee Futurist | 847 Trials & Counting',
    company: 'Self-Employed',
    avatar: '☕',
    connections: 847,
    location: 'Downtown, Near Hartwell Building',
    pronouns: 'he/him',
    skills: [
      'Quantum Observation',
      'Coffee Wave Function Collapse',
      'Martinez Study Implementation',
      'Brew Entanglement',
      'Particle Percolation',
    ],
    experience: [
      {
        title: 'Independent Quantum Beverage Researcher',
        company: 'Self-Employed',
        duration: '3 yrs',
        description: 'Conducting independent research into quantum-observable coffee phenomena. Have completed 847 trials with varying degrees of wave function success.',
      },
      {
        title: 'Barista (Terminated)',
        company: 'StarCups Coffee',
        duration: '6 mos',
        description: 'Left to pursue my passion full-time after a disagreement about the importance of quantum observation in espresso extraction.',
      },
    ],
    education: [
      {
        school: 'University of State',
        degree: 'Physics (Incomplete)',
        year: '2019',
      },
    ],
  },
  {
    id: 'mars',
    name: 'Marcus "Mars" Chen',
    headline: 'Venue Owner & Experience Curator | The Underground | Creating Spaces for Connection',
    company: 'The Underground',
    avatar: '🎸',
    connections: 2847,
    location: 'Downtown District',
    skills: [
      'Venue Management',
      'Community Building',
      'Live Event Curation',
      'Artist Relations',
      'Acoustic Engineering',
      'Crisis Management',
    ],
    experience: [
      {
        title: 'Owner & Experience Curator',
        company: 'The Underground',
        duration: '8 yrs',
        description: 'Relocated venue from its original location near Hartwell Building. We dont talk about why.',
      },
    ],
  },
  {
    id: 'smallkevin',
    name: 'Kevin "Small Kevin" Thompson',
    headline: 'Trust Fall Safety Coordinator (Former) | Seeking New Opportunities | #OpenToWork',
    company: 'Open to Opportunities',
    avatar: '🤕',
    connections: 12,
    isOpenToWork: true,
    location: 'Anywhere But The Underground',
    skills: [
      'Safety Protocol Development',
      'Risk Assessment',
      'Incident Documentation',
      'Physical Therapy',
      'Workers Compensation Filing',
    ],
    experience: [
      {
        title: 'Trust Fall Safety Coordinator',
        company: 'The Underground',
        duration: '2 mos',
        description: 'Responsible for ensuring safe catch protocols during Trust Fall Tim events. Position ended after The Incident.',
      },
    ],
  },
  {
    id: 'jennifer',
    name: 'Jennifer Observerson',
    headline: 'Moving On | Open to Opportunities | Ex-Wife of the Year | Finding Myself',
    company: 'Life Transition Specialist (Self)',
    avatar: '💪',
    connections: 1247,
    isOpenToWork: true,
    location: 'Anywhere But Near Derek',
    pronouns: 'she/her',
    skills: [
      'Divorce Survival',
      'Setting Boundaries',
      'Self-Care Implementation',
      'Not Listening to Coffee Lectures',
      'Starting Over',
    ],
    experience: [
      {
        title: 'Spouse (Former)',
        company: 'The Observerson Household',
        duration: '4 yrs',
        description: 'Supported partners dreams until dreams involved a $3000 coffee maker and 45-minute morning brewing rituals.',
      },
      {
        title: 'Life Transition Specialist',
        company: 'Self-Employed',
        duration: 'Present',
        description: 'Focusing on personal growth and definitely not thinking about quantum coffee.',
      },
    ],
  },
  {
    id: 'tim',
    name: 'Timothy "Trust Fall Tim" Sullivan',
    headline: 'Freelance Trust Consultant | 2,847 Falls | Professional Trust Builder',
    company: 'Trust Fall Enterprises',
    avatar: '🙆‍♂️',
    connections: 847,
    location: 'The Underground (Mostly)',
    skills: [
      'Trust Building',
      'Falling Techniques',
      'Crowd Assessment',
      'Optimism Maintenance',
      'Persistence',
      'Physical Resilience',
    ],
    experience: [
      {
        title: 'Chief Trust Officer',
        company: 'Trust Fall Enterprises',
        duration: '5 yrs',
        description: 'Completed 2,847 professional trust falls with a 78.5% catch rate. Every fall is a learning opportunity.',
      },
    ],
  },
  {
    id: 'ceo_omnicorp',
    name: 'Harrison Blackwell III',
    headline: 'CEO @ Omnicorp Holdings | Floor 13 Resident | Building Tomorrow Today',
    company: 'Omnicorp Holdings',
    avatar: '🏢',
    connections: 50000,
    isHiring: true,
    location: 'Hartwell Building, Floor 13',
    skills: [
      'Strategic Synergy',
      'Vertical Integration',
      'Corn Futures',
      'Dimensional Procurement',
      'Stakeholder Alignment',
    ],
    experience: [
      {
        title: 'Chief Executive Officer',
        company: 'Omnicorp Holdings',
        duration: '?? yrs',
        description: 'Leading Omnicorps mission to optimize agricultural verticals across all observable dimensions.',
      },
    ],
  },
  {
    id: 'vp_cob',
    name: 'Sandra Kernelworth',
    headline: 'VP of Cob Relations | Omnicorp Holdings | Connecting Kernels to Consumers',
    company: 'Omnicorp Holdings',
    avatar: '🌽',
    connections: 8470,
    location: 'Hartwell Building',
    skills: [
      'Cob-to-Consumer Pipeline',
      'Kernel Synergy',
      'Stakeholder Pollination',
      'Agricultural Thought Leadership',
      'Cross-Functional Husking',
    ],
  },
  {
    id: 'senior_kernel',
    name: 'Dr. Cornelius Maizely',
    headline: 'Senior Kernel Engineer | Quantum Brew Inc. | Optimizing Grain at Scale',
    company: 'Quantum Brew Inc.',
    avatar: '🔬',
    connections: 3142,
    location: 'Research Campus',
    skills: [
      'Kernel Optimization',
      'Starch Architecture',
      'Genetic Corn Mapping',
      'Silage Systems',
      'Quantum Grain Theory',
    ],
  },
  {
    id: 'chief_corn',
    name: 'Margaret Fields-Harvest',
    headline: 'Chief Corn Officer | Hartwell Industries | Cultivating Excellence',
    company: 'Hartwell Industries',
    avatar: '👩‍💼',
    connections: 12847,
    isHiring: true,
    location: 'Hartwell Building, Floor 7',
    skills: [
      'Corn Strategy',
      'Executive Pollination',
      'Harvest Optimization',
      'Silo Leadership',
      'Crop Circle Analysis',
    ],
  },
  {
    id: 'intern_hartwell',
    name: 'Tyler Freshstart',
    headline: 'Recently Left Hartwell Industries | #OpenToWork | Looking for ANYTHING ELSE',
    company: 'Seeking Opportunities',
    avatar: '😰',
    connections: 47,
    isOpenToWork: true,
    location: 'Not Floor 7',
    skills: [
      'Excel',
      'Keeping Secrets',
      'Running',
      'Non-Disclosure Agreements',
    ],
    experience: [
      {
        title: 'Research Intern',
        company: 'Hartwell Industries',
        duration: '3 wks',
        description: 'Cannot discuss. NDA. Please dont ask about Floor 7. Or the elevator. Or what I saw.',
      },
    ],
  },
]

// ============================================================================
// Sample Data - Posts (Corporate Buzzword Corn Soup)
// ============================================================================

const POSTS: Post[] = [
  {
    id: 'post_1',
    author: PROFILES.find(p => p.id === 'vp_cob')!,
    content: `Thrilled to announce that Omnicorp Holdings has achieved a 847% increase in cob-to-consumer pipeline velocity this quarter.

This wouldnt have been possible without our incredible team who truly embody the spirit of KERNEL SYNERGY.

Remember: Every kernel matters. Every consumer deserves quality. Every stakeholder is a partner in our pollination journey.

Agree?`,
    timestamp: '2h',
    likes: 847,
    comments: 42,
    reposts: 23,
    hashtags: ['CornLeadership', 'ThoughtLeader', 'AgTech', 'Synergy'],
  },
  {
    id: 'post_2',
    author: PROFILES.find(p => p.id === 'derek')!,
    content: `CONTROVERSIAL OPINION: The corn industry is sleeping on quantum observation.

I have spent the last 3 years applying Martinez Study principles to agricultural contexts. My findings? The observer effect applies to EVERYTHING.

When you TRULY observe a kernel, you change it. This has massive implications for harvest optimization.

Omnicorp - I am available for consulting.

DMs open.`,
    timestamp: '4h',
    likes: 12,
    comments: 3,
    reposts: 0,
    hashtags: ['QuantumCorn', 'ThoughtLeadership', 'Innovation'],
  },
  {
    id: 'post_3',
    author: PROFILES.find(p => p.id === 'jennifer')!,
    content: `Sometimes the biggest career move is the one you make for YOURSELF.

After 4 years of supporting someone elses quantum beverage dreams, I am finally ready to pursue MY path.

To everyone going through a transition: You are not your partners failed coffee experiments. You are MORE.

Open to opportunities in literally anything that doesnt involve the words "wave function" or "Martinez Study."`,
    timestamp: '6h',
    likes: 1247,
    comments: 89,
    reposts: 34,
    hashtags: ['OpenToWork', 'CareerTransition', 'SelfCare', 'DivorceWins'],
  },
  {
    id: 'post_4',
    author: PROFILES.find(p => p.id === 'tim')!,
    content: `847 falls this month. Personal record!

People ask me: "Tim, why do you keep falling when no one catches you?"

Because TRUST is not about being caught. Trust is about the FALL ITSELF.

Every uncaught fall is an opportunity for growth. The ground teaches us humility. The bruises remind us we are ALIVE.

Looking for corporate trust-building workshops? DM me.`,
    timestamp: '8h',
    likes: 234,
    comments: 56,
    reposts: 12,
    hashtags: ['TrustBuilding', 'Leadership', 'NeverGiveUp', 'TheFallIsTheLesson'],
  },
  {
    id: 'post_5',
    author: PROFILES.find(p => p.id === 'intern_hartwell')!,
    content: `Last day at Hartwell Industries.

I cannot say much.

If you work on Floor 7: Get out. I mean. Enjoy your career there. Its fine. Everything is fine.

The mirrors are normal. The corn is normal. The humming is probably just the HVAC.

#OpenToWork #CareerChange #DefNotAWhistleblower`,
    timestamp: '1d',
    likes: 2847,
    comments: 342,
    reposts: 847,
    hashtags: ['OpenToWork', 'CareerChange', 'NothingToSeeHere'],
  },
  {
    id: 'post_6',
    author: PROFILES.find(p => p.id === 'ceo_omnicorp')!,
    content: `At Omnicorp, we dont just grow corn. We CULTIVATE FUTURES.

Today I had a moment of clarity on Floor 13 (yes, that floor exists, and yes, I am there). I realized that true leadership is about seeing what others cannot see.

Some call it vision. Some call it strategy. I call it Dimensional Alignment.

When you align your kernels across all observable and unobservable planes, success is inevitable.

The harvest is coming. Are you ready?`,
    timestamp: '1d',
    likes: 5000,
    comments: 847,
    reposts: 234,
    hashtags: ['Leadership', 'Vision', 'Omnicorp', 'Floor13'],
  },
  {
    id: 'post_7',
    author: PROFILES.find(p => p.id === 'senior_kernel')!,
    content: `Excited to share that our team at Quantum Brew has successfully optimized kernel density by 23.7% using proprietary starch architecture methodologies.

This breakthrough in grain-level engineering will revolutionize how we think about corn-to-beverage pipelines.

Special thanks to the Martinez Study Foundation for their ongoing collaboration. The intersection of quantum physics and agriculture is real, folks.

Paper forthcoming. Peer review pending.`,
    timestamp: '2d',
    likes: 423,
    comments: 67,
    reposts: 45,
    hashtags: ['AgTech', 'Innovation', 'QuantumBrew', 'Science'],
  },
  {
    id: 'post_8',
    author: PROFILES.find(p => p.id === 'smallkevin')!,
    content: `Update: Physical therapy going well. Can almost lift my arms above my head again.

Still looking for opportunities outside the live events industry. Strong preference for roles that dont involve:
- Trust exercises
- Falling
- Being caught (or not caught)
- Timothy Sullivan

Skills: Microsoft Office, risk assessment, workers comp paperwork.

Please help.`,
    timestamp: '2d',
    likes: 89,
    comments: 23,
    reposts: 5,
    hashtags: ['OpenToWork', 'CareerChange', 'Desperate'],
  },
  {
    id: 'post_9',
    author: PROFILES.find(p => p.id === 'mars')!,
    content: `Proud to announce The Underground is now the official venue partner for the Corn Industry Professionals Summit 2024.

After relocating from our original location (dont ask), weve become the premier space for agricultural networking events, live music, and yes, occasional trust fall demonstrations.

To the naysayers who said a music venue couldnt pivot to corporate events: Look at us now.

Booking inquiries: info@theunderground.corn`,
    timestamp: '3d',
    likes: 567,
    comments: 78,
    reposts: 23,
    hashtags: ['TheUnderground', 'Events', 'Pivot', 'CornSummit'],
  },
  {
    id: 'post_10',
    author: PROFILES.find(p => p.id === 'chief_corn')!,
    content: `We are HIRING at Hartwell Industries!

Looking for passionate individuals ready to join our team on Floor 7. Must be comfortable with:
- Flexible hours (very flexible)
- Open floor plans (very open)
- Self-directed work (you will figure it out)
- Corn

Competitive salary. Excellent benefits. Unique work environment.

Apply at hartwellindustries.corn/careers/floor7

Note: All applicants must sign NDA before interview.`,
    timestamp: '3d',
    likes: 234,
    comments: 847,
    reposts: 12,
    hashtags: ['Hiring', 'HartwellIndustries', 'JoinUs', 'Floor7'],
  },
]

// ============================================================================
// Sample Data - Jobs
// ============================================================================

const JOBS: Job[] = [
  {
    id: 'job_1',
    title: 'Chief Corn Officer',
    company: 'Omnicorp Holdings',
    location: 'Hartwell Building, Floor 13',
    salary: '$847,000 - $1,200,000',
    posted: '1 day ago',
    applicants: 847,
    description: 'Lead our corn division with strategic vision and dimensional awareness. Must be comfortable with unconventional work environments.',
    requirements: [
      '15+ years in corn leadership',
      'MBA or equivalent corn experience',
      'Ability to perceive multiple dimensions (preferred)',
      'Comfortable with Floor 13',
      'No questions about the mirrors',
    ],
    companyLogo: '🏢',
  },
  {
    id: 'job_2',
    title: 'Senior Kernel Engineer',
    company: 'Quantum Brew Inc.',
    location: 'Research Campus (Remote Hybrid)',
    salary: '$180,000 - $250,000',
    posted: '2 days ago',
    applicants: 234,
    description: 'Apply quantum principles to kernel optimization. Work alongside the Martinez Study research team.',
    requirements: [
      'PhD in Corn Physics or related field',
      'Experience with wave function applications',
      'Published research in grain quantum mechanics',
      'Willingness to work with Derek (temporary consultant)',
    ],
    companyLogo: '☕',
  },
  {
    id: 'job_3',
    title: 'VP of Cob Relations',
    company: 'Hartwell Industries',
    location: 'Hartwell Building, Floor 7',
    salary: '$200,000 - $300,000',
    posted: '3 days ago',
    applicants: 47,
    description: 'Bridge the gap between kernels and consumers. Build relationships across the corn value chain.',
    requirements: [
      '10+ years in cob management',
      'Excellent stakeholder pollination skills',
      'Experience with cross-functional husking',
      'Able to work independently (very independently)',
      'Comfort with unusual atmospheric conditions',
    ],
    companyLogo: '🏚️',
  },
  {
    id: 'job_4',
    title: 'Trust Building Specialist',
    company: 'The Underground',
    location: 'Downtown District',
    salary: '$45,000 - $55,000',
    posted: '1 week ago',
    applicants: 3,
    description: 'Support our resident Trust Consultant with live demonstrations. Strong back required.',
    requirements: [
      'Able to catch falling adults',
      'Quick reflexes',
      'Health insurance (you will need it)',
      'Positive attitude about repeated failures',
      'NOT Kevin',
    ],
    companyLogo: '🎸',
  },
  {
    id: 'job_5',
    title: 'Corn Synergy Analyst',
    company: 'Omnicorp Holdings',
    location: 'Hartwell Building (Floor TBD)',
    salary: '$120,000 - $160,000',
    posted: '4 days ago',
    applicants: 189,
    description: 'Analyze synergies across corn verticals. Optimize alignment between kernels, cobs, and stakeholders.',
    requirements: [
      'Strong Excel skills (corn pivot tables)',
      'Experience with agricultural KPIs',
      'Ability to think holistically about grain',
      'Comfortable with ambiguity (very comfortable)',
    ],
    companyLogo: '🏢',
  },
  {
    id: 'job_6',
    title: 'Quantum Observation Intern',
    company: 'Derek Observerson Consulting',
    location: 'Various Coffee Shops',
    salary: 'Unpaid (Experience)',
    posted: '2 weeks ago',
    applicants: 0,
    description: 'Assist with independent quantum beverage research. Learn the Martinez Study principles firsthand.',
    requirements: [
      'Interest in quantum physics',
      'Tolerance for lengthy coffee explanations',
      'Own transportation',
      'Not Jennifer',
    ],
    companyLogo: '☕',
  },
]

// ============================================================================
// Sample Data - Notifications
// ============================================================================

const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'view', content: '847 people viewed your profile this week', timestamp: '2h', read: false },
  { id: 'n2', type: 'connection', content: 'Derek Observerson wants to connect', timestamp: '4h', read: false },
  { id: 'n3', type: 'like', content: 'Harrison Blackwell III liked your post about corn synergy', timestamp: '6h', read: true },
  { id: 'n4', type: 'job', content: 'Jobs you may be interested in: Chief Corn Officer at Omnicorp', timestamp: '1d', read: true },
  { id: 'n5', type: 'comment', content: 'Trust Fall Tim commented: "Have you considered falling into new opportunities?"', timestamp: '1d', read: true },
]

// ============================================================================
// DB Adapters
// ============================================================================

/**
 * Maps a SiteContentItem (contentType 'profile') to the local Profile interface.
 * Uses metadata for profile-specific fields like skills, experience, education, etc.
 */
function dbToProfile(item: SiteContentItem): Profile {
  const m = item.metadata || {}
  return {
    id: item.slug,
    name: item.title,
    headline: item.subtitle ?? m.headline ?? '',
    company: m.company ?? '',
    avatar: item.thumbnailEmoji ?? m.avatar ?? '🌽',
    connections: m.connections ?? item.likeCount ?? 0,
    isOpenToWork: m.isOpenToWork ?? m.is_open_to_work ?? false,
    isHiring: m.isHiring ?? m.is_hiring ?? false,
    pronouns: m.pronouns,
    location: m.location,
    skills: Array.isArray(m.skills) ? m.skills : [],
    experience: Array.isArray(m.experience) ? m.experience : undefined,
    education: Array.isArray(m.education) ? m.education : undefined,
  }
}

/**
 * Maps a SiteContentItem (contentType 'post') to the local Post interface.
 * Requires a profiles array to resolve author references.
 */
function dbToPost(item: SiteContentItem, profiles: Profile[]): Post {
  const m = item.metadata || {}
  const authorId = m.authorId ?? m.author_id ?? ''
  const author = profiles.find(p => p.id === authorId) || {
    id: authorId,
    name: m.authorName ?? m.author_name ?? 'Unknown',
    headline: m.authorHeadline ?? m.author_headline ?? '',
    company: '',
    avatar: m.authorAvatar ?? m.author_avatar ?? '🌽',
    connections: 0,
    skills: [],
  }
  return {
    id: item.slug,
    author,
    content: item.body ?? item.summary ?? '',
    timestamp: m.timestamp ?? 'recently',
    likes: item.likeCount ?? m.likes ?? 0,
    comments: item.commentCount ?? m.comments ?? 0,
    reposts: m.reposts ?? 0,
    hashtags: item.tags.length > 0 ? item.tags : (m.hashtags ?? undefined),
    isRepost: m.isRepost ?? m.is_repost ?? false,
    repostAuthor: m.repostAuthor ?? m.repost_author,
  }
}

/**
 * Maps a SiteContentItem (contentType 'job') to the local Job interface.
 * Uses metadata for job-specific fields like salary, requirements, etc.
 */
function dbToJob(item: SiteContentItem): Job {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    company: m.company ?? '',
    location: m.location ?? '',
    salary: m.salary,
    posted: m.posted ?? 'recently',
    applicants: m.applicants ?? item.viewCount ?? 0,
    description: item.body ?? item.summary ?? '',
    requirements: Array.isArray(m.requirements) ? m.requirements : [],
    companyLogo: item.thumbnailEmoji ?? m.companyLogo ?? m.company_logo ?? '🏢',
  }
}

// ============================================================================
// Component
// ============================================================================

export function LinkedCornSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const { content: dbProfiles } = useSiteContent('linkedcorn', { contentType: 'profile' })
  const { content: dbPosts } = useSiteContent('linkedcorn', { contentType: 'post' })
  const { content: dbJobs } = useSiteContent('linkedcorn', { contentType: 'job' })

  const profiles = useMemo(() => {
    if (dbProfiles.length > 0) return dbProfiles.map(dbToProfile)
    return PROFILES
  }, [dbProfiles])

  const posts = useMemo(() => {
    if (dbPosts.length > 0) return dbPosts.map(item => dbToPost(item, profiles))
    return POSTS
  }, [dbPosts, profiles])

  const jobs = useMemo(() => {
    if (dbJobs.length > 0) return dbJobs.map(dbToJob)
    return JOBS
  }, [dbJobs])

  const [activeTab, setActiveTab] = useState<'feed' | 'jobs' | 'network' | 'notifications'>('feed')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [showNotifications, setShowNotifications] = useState(false)

  // Parse path on mount/change
  const isUpdatingFromPath = useRef(false)

  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setActiveTab('feed')
      setSelectedProfile(null)
    } else if (path.startsWith('/profile/')) {
      const profileId = path.slice(9)
      const profile = profiles.find(p => p.id === profileId)
      if (profile) {
        setSelectedProfile(profile)
      }
    } else if (path === '/jobs') {
      setActiveTab('jobs')
      setSelectedProfile(null)
    } else if (path === '/network') {
      setActiveTab('network')
      setSelectedProfile(null)
    }

    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, profiles])

  // Navigation handlers
  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile)
    onPathChange('/profile/' + profile.id)
  }

  const handleBackToFeed = () => {
    setSelectedProfile(null)
    onPathChange(null)
  }

  const handleTabChange = (tab: 'feed' | 'jobs' | 'network' | 'notifications') => {
    setActiveTab(tab)
    setSelectedProfile(null)
    if (tab === 'feed') {
      onPathChange(null)
    } else {
      onPathChange('/' + tab)
    }
  }

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  const theme = site.theme

  return (
    <div className="min-h-full" style={{ background: theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button
              onClick={handleBackToFeed}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <span className="text-2xl">🌽</span>
              <span
                className="text-xl font-bold"
                style={{ color: theme.primary }}
              >
                LinkedCorn
              </span>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search corn professionals..."
                className="w-full px-4 py-1.5 rounded text-sm"
                style={{
                  background: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              />
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {[
                { key: 'feed', icon: '🏠', label: 'Home' },
                { key: 'network', icon: '👥', label: 'Network' },
                { key: 'jobs', icon: '💼', label: 'Jobs' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key as 'feed' | 'jobs' | 'network')}
                  className="flex flex-col items-center px-4 py-1 rounded hover:bg-gray-100"
                  style={{
                    color: activeTab === item.key ? theme.primary : theme.textMuted,
                    borderBottom: activeTab === item.key ? `2px solid ${theme.primary}` : '2px solid transparent',
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex flex-col items-center px-4 py-1 rounded hover:bg-gray-100"
                  style={{ color: theme.textMuted }}
                >
                  <span className="text-lg relative">
                    🔔
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full text-white"
                      style={{ background: '#e74c3c' }}
                    >
                      2
                    </span>
                  </span>
                  <span className="text-xs">Alerts</span>
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg overflow-hidden z-30"
                    style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
                  >
                    <div className="p-3 font-medium" style={{ borderBottom: `1px solid ${theme.border}` }}>
                      Notifications
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {NOTIFICATIONS.map(notif => (
                        <div
                          key={notif.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          style={{
                            borderBottom: `1px solid ${theme.border}`,
                            background: notif.read ? 'transparent' : 'rgba(10, 102, 194, 0.05)',
                          }}
                        >
                          <p className="text-sm" style={{ color: theme.text }}>{notif.content}</p>
                          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{notif.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Profile */}
            <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100">
              <Avatar seed="user" size={32} emoji="👤" />
              <span className="text-xs" style={{ color: theme.textMuted }}>Me ▾</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {selectedProfile ? (
          <ProfileView
            profile={selectedProfile}
            onBack={handleBackToFeed}
            theme={theme}
          />
        ) : activeTab === 'jobs' ? (
          <JobsView theme={theme} onViewProfile={handleViewProfile} jobs={jobs} />
        ) : activeTab === 'network' ? (
          <NetworkView theme={theme} onViewProfile={handleViewProfile} profiles={profiles} />
        ) : (
          <FeedView
            theme={theme}
            likedPosts={likedPosts}
            onLike={handleLike}
            onViewProfile={handleViewProfile}
            onNavigate={onNavigate}
            posts={posts}
            profiles={profiles}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Feed View Component
// ============================================================================

interface FeedViewProps {
  theme: typeof site.theme
  likedPosts: Set<string>
  onLike: (id: string) => void
  onViewProfile: (profile: Profile) => void
  onNavigate: (appId: string) => void
  posts: Post[]
  profiles: Profile[]
}

function FeedView({ theme, likedPosts, onLike, onViewProfile, onNavigate, posts, profiles }: FeedViewProps) {
  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Profile Card */}
      <aside className="w-56 shrink-0">
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="0"
          borderRadius="lg"
          shadow="sm"
          className="overflow-hidden"
        >
          <div className="h-14" style={{ background: 'linear-gradient(135deg, #0a66c2, #57a773)' }} />
          <div className="px-4 pb-4 -mt-6">
            <Avatar seed="user" size={56} emoji="👤" className="border-2 border-white rounded-full" />
            <h3 className="font-medium mt-2" style={{ color: theme.text }}>Guest User</h3>
            <p className="text-xs" style={{ color: theme.textMuted }}>Add a headline</p>
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: theme.textMuted }}>Profile viewers</span>
                <span style={{ color: theme.primary }}>847</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: theme.textMuted }}>Post impressions</span>
                <span style={{ color: theme.primary }}>2,847</span>
              </div>
            </div>
          </div>
        </StyledCard>

        {/* Premium Upsell */}
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="md"
          borderRadius="lg"
          shadow="sm"
          className="mt-4"
        >
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Unlock corn industry insights with <span style={{ color: '#D4AF37' }}>Premium Kernel</span>
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2 w-full"
            backgroundColor="transparent"
            textColor={theme.primary}
          >
            Try free for 1 month
          </Button>
        </StyledCard>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 min-w-0 space-y-4">
        {/* Create Post */}
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="md"
          borderRadius="lg"
          shadow="sm"
        >
          <div className="flex gap-3">
            <Avatar seed="user" size={48} emoji="👤" />
            <button
              className="flex-1 px-4 py-3 text-left rounded-full text-sm"
              style={{
                border: `1px solid ${theme.border}`,
                color: theme.textMuted,
              }}
            >
              Start a post about corn...
            </button>
          </div>
          <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <button className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
              <span>📷</span> Photo
            </button>
            <button className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
              <span>🎬</span> Video
            </button>
            <button className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
              <span>📝</span> Article
            </button>
          </div>
        </StyledCard>

        {/* Posts */}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            theme={theme}
            isLiked={likedPosts.has(post.id)}
            onLike={() => onLike(post.id)}
            onViewProfile={onViewProfile}
          />
        ))}
      </main>

      {/* Right Sidebar */}
      <aside className="w-72 shrink-0 space-y-4">
        {/* People You May Know */}
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="0"
          borderRadius="lg"
          shadow="sm"
          className="overflow-hidden"
        >
          <div className="p-3 font-medium text-sm" style={{ color: theme.text }}>
            People you may know
          </div>
          <div>
            {profiles.slice(0, 4).map(profile => (
              <button
                key={profile.id}
                onClick={() => onViewProfile(profile)}
                className="flex gap-3 p-3 w-full text-left hover:bg-gray-50"
                style={{ borderTop: `1px solid ${theme.border}` }}
              >
                <div className="relative">
                  <Avatar seed={profile.id} size={48} emoji={profile.avatar} />
                  {profile.isOpenToWork && (
                    <div
                      className="absolute -bottom-1 -right-1 px-1 text-[8px] rounded text-white"
                      style={{ background: '#57a773' }}
                    >
                      OPEN
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: theme.text }}>{profile.name}</p>
                  <p className="text-xs truncate" style={{ color: theme.textMuted }}>{profile.headline}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    backgroundColor="transparent"
                    textColor={theme.primary}
                  >
                    + Connect
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </StyledCard>

        {/* Ads */}
        <SidebarAdWidget
          siteId="linkedcorn"
          onNavigate={onNavigate}
          title="Promoted"
          count={1}
        />

        {/* Trending Hashtags */}
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="md"
          borderRadius="lg"
          shadow="sm"
        >
          <h3 className="font-medium text-sm mb-3" style={{ color: theme.text }}>Trending in Corn</h3>
          <div className="space-y-2">
            {['#KernelOptimization', '#CornSynergy', '#HartwellMystery', '#Floor7', '#QuantumBrew'].map(tag => (
              <button
                key={tag}
                className="block text-sm hover:underline"
                style={{ color: theme.primary }}
              >
                {tag}
              </button>
            ))}
          </div>
        </StyledCard>
      </aside>
    </div>
  )
}

// ============================================================================
// Post Card Component
// ============================================================================

interface PostCardProps {
  post: Post
  theme: typeof site.theme
  isLiked: boolean
  onLike: () => void
  onViewProfile: (profile: Profile) => void
}

function PostCard({ post, theme, isLiked, onLike, onViewProfile }: PostCardProps) {
  return (
    <StyledCard
      bgColor={theme.surface}
      borderColor={theme.border}
      padding="md"
      borderRadius="lg"
      shadow="sm"
    >
      {/* Author Header */}
      <div className="flex gap-3">
        <button onClick={() => onViewProfile(post.author)}>
          <div className="relative">
            <Avatar seed={post.author.id} size={48} emoji={post.author.avatar} />
            {post.author.isOpenToWork && (
              <div
                className="absolute -bottom-0.5 left-0 right-0 text-[8px] text-center rounded-b text-white"
                style={{ background: '#57a773' }}
              >
                #OPEN
              </div>
            )}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onViewProfile(post.author)}
            className="font-medium text-sm hover:underline"
            style={{ color: theme.text }}
          >
            {post.author.name}
          </button>
          <p className="text-xs truncate" style={{ color: theme.textMuted }}>{post.author.headline}</p>
          <p className="text-xs" style={{ color: theme.textMuted }}>{post.timestamp}</p>
        </div>
        <button className="text-xl self-start" style={{ color: theme.textMuted }}>...</button>
      </div>

      {/* Content */}
      <div className="mt-3 text-sm whitespace-pre-wrap" style={{ color: theme.text }}>
        {post.content}
      </div>

      {/* Hashtags */}
      {post.hashtags && (
        <div className="flex flex-wrap gap-1 mt-2">
          {post.hashtags.map(tag => (
            <span key={tag} className="text-xs" style={{ color: theme.primary }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div
        className="flex justify-between mt-3 pt-3 text-xs"
        style={{ borderTop: `1px solid ${theme.border}`, color: theme.textMuted }}
      >
        <span>{isLiked ? post.likes + 1 : post.likes} likes</span>
        <span>{post.comments} comments - {post.reposts} reposts</span>
      </div>

      {/* Action Buttons */}
      <div
        className="flex justify-around mt-3 pt-3"
        style={{ borderTop: `1px solid ${theme.border}` }}
      >
        <button
          onClick={onLike}
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-sm"
          style={{ color: isLiked ? theme.primary : theme.textMuted }}
        >
          <span>{isLiked ? '👍' : '👍'}</span>
          <span>Like</span>
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-sm"
          style={{ color: theme.textMuted }}
        >
          <span>💬</span>
          <span>Comment</span>
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-sm"
          style={{ color: theme.textMuted }}
        >
          <span>🔄</span>
          <span>Repost</span>
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-sm"
          style={{ color: theme.textMuted }}
        >
          <span>📤</span>
          <span>Send</span>
        </button>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Profile View Component
// ============================================================================

interface ProfileViewProps {
  profile: Profile
  onBack: () => void
  theme: typeof site.theme
}

function ProfileView({ profile, onBack, theme }: ProfileViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={theme.primary}
      >
        Back to feed
      </Button>

      {/* Profile Header */}
      <StyledCard
        bgColor={theme.surface}
        borderColor={theme.border}
        padding="0"
        borderRadius="lg"
        shadow="sm"
        className="overflow-hidden"
      >
        {/* Cover */}
        <div className="h-32" style={{ background: 'linear-gradient(135deg, #0a66c2, #57a773)' }} />

        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-16">
            <div className="relative">
              <Avatar seed={profile.id} size={128} emoji={profile.avatar} className="border-4 border-white rounded-full" />
              {profile.isOpenToWork && (
                <div
                  className="absolute bottom-2 left-0 right-0 py-1 text-xs text-center text-white font-medium"
                  style={{ background: '#57a773' }}
                >
                  #OPENTOWORK
                </div>
              )}
              {profile.isHiring && (
                <div
                  className="absolute bottom-2 left-0 right-0 py-1 text-xs text-center text-white font-medium"
                  style={{ background: theme.primary }}
                >
                  HIRING
                </div>
              )}
            </div>
          </div>

          <div className="pt-20">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
                  {profile.name}
                  {profile.pronouns && (
                    <span className="text-sm font-normal ml-2" style={{ color: theme.textMuted }}>
                      ({profile.pronouns})
                    </span>
                  )}
                </h1>
                <p className="text-sm mt-1" style={{ color: theme.text }}>{profile.headline}</p>
                <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
                  {profile.location} - {profile.connections.toLocaleString()} connections
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  backgroundColor={theme.primary}
                  textColor="white"
                >
                  Connect
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  backgroundColor="transparent"
                  textColor={theme.primary}
                >
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </StyledCard>

      {/* Skills */}
      <StyledCard
        bgColor={theme.surface}
        borderColor={theme.border}
        padding="md"
        borderRadius="lg"
        shadow="sm"
      >
        <h2 className="font-medium mb-3" style={{ color: theme.text }}>Skills & Endorsements</h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, idx) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full text-sm"
              style={{
                background: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              {skill}
              <span className="ml-2" style={{ color: theme.primary }}>+{Math.floor(Math.random() * 847) + 1}</span>
            </span>
          ))}
        </div>
      </StyledCard>

      {/* Experience */}
      {profile.experience && (
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="md"
          borderRadius="lg"
          shadow="sm"
        >
          <h2 className="font-medium mb-4" style={{ color: theme.text }}>Experience</h2>
          <div className="space-y-4">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-12 h-12 rounded flex items-center justify-center" style={{ background: theme.background }}>
                  <span className="text-xl">🏢</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: theme.text }}>{exp.title}</h3>
                  <p className="text-sm" style={{ color: theme.textMuted }}>{exp.company}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{exp.duration}</p>
                  {exp.description && (
                    <p className="text-sm mt-2" style={{ color: theme.text }}>{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </StyledCard>
      )}

      {/* Education */}
      {profile.education && (
        <StyledCard
          bgColor={theme.surface}
          borderColor={theme.border}
          padding="md"
          borderRadius="lg"
          shadow="sm"
        >
          <h2 className="font-medium mb-4" style={{ color: theme.text }}>Education</h2>
          <div className="space-y-4">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-12 h-12 rounded flex items-center justify-center" style={{ background: theme.background }}>
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: theme.text }}>{edu.school}</h3>
                  <p className="text-sm" style={{ color: theme.textMuted }}>{edu.degree}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </StyledCard>
      )}
    </div>
  )
}

// ============================================================================
// Jobs View Component
// ============================================================================

interface JobsViewProps {
  theme: typeof site.theme
  onViewProfile: (profile: Profile) => void
  jobs: Job[]
}

function JobsView({ theme, onViewProfile, jobs }: JobsViewProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  return (
    <div className="flex gap-6">
      {/* Job List */}
      <div className="w-96 shrink-0 space-y-2">
        <h2 className="font-medium mb-4" style={{ color: theme.text }}>Jobs for You</h2>
        {jobs.map(job => (
          <button
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className="w-full text-left p-4 rounded-lg transition-colors"
            style={{
              background: selectedJob?.id === job.id ? theme.background : theme.surface,
              border: `1px solid ${selectedJob?.id === job.id ? theme.primary : theme.border}`,
            }}
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ background: theme.background }}>
                {job.companyLogo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" style={{ color: theme.primary }}>{job.title}</h3>
                <p className="text-sm" style={{ color: theme.text }}>{job.company}</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{job.location}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  {job.posted} - {job.applicants} applicants
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Job Detail */}
      <div className="flex-1">
        {selectedJob ? (
          <StyledCard
            bgColor={theme.surface}
            borderColor={theme.border}
            padding="lg"
            borderRadius="lg"
            shadow="sm"
          >
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded flex items-center justify-center text-3xl" style={{ background: theme.background }}>
                {selectedJob.companyLogo}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold" style={{ color: theme.text }}>{selectedJob.title}</h1>
                <p className="text-sm mt-1" style={{ color: theme.text }}>{selectedJob.company}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>{selectedJob.location}</p>
                {selectedJob.salary && (
                  <p className="text-sm font-medium mt-2" style={{ color: '#57a773' }}>{selectedJob.salary}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="primary"
                size="md"
                backgroundColor={theme.primary}
                textColor="white"
              >
                Easy Apply
              </Button>
              <Button
                variant="secondary"
                size="md"
                backgroundColor="transparent"
                textColor={theme.primary}
              >
                Save
              </Button>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${theme.border}` }}>
              <h2 className="font-medium mb-2" style={{ color: theme.text }}>About the job</h2>
              <p className="text-sm" style={{ color: theme.text }}>{selectedJob.description}</p>

              <h2 className="font-medium mt-6 mb-2" style={{ color: theme.text }}>Requirements</h2>
              <ul className="list-disc list-inside space-y-1">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx} className="text-sm" style={{ color: theme.text }}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${theme.border}` }}>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                {selectedJob.applicants} applicants - Posted {selectedJob.posted}
              </p>
            </div>
          </StyledCard>
        ) : (
          <div className="flex flex-col items-center justify-center h-96" style={{ color: theme.textMuted }}>
            <span className="text-6xl mb-4">💼</span>
            <p>Select a job to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Network View Component
// ============================================================================

interface NetworkViewProps {
  theme: typeof site.theme
  onViewProfile: (profile: Profile) => void
  profiles: Profile[]
}

function NetworkView({ theme, onViewProfile, profiles }: NetworkViewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-medium mb-4" style={{ color: theme.text }}>Grow your network</h2>

      {/* Connection Requests */}
      <StyledCard
        bgColor={theme.surface}
        borderColor={theme.border}
        padding="md"
        borderRadius="lg"
        shadow="sm"
        className="mb-6"
      >
        <h3 className="font-medium mb-4" style={{ color: theme.text }}>Pending Invitations (2)</h3>
        <div className="space-y-4">
          {[profiles[0], profiles[4]].filter(Boolean).map(profile => (
            <div key={profile.id} className="flex items-center gap-4">
              <button onClick={() => onViewProfile(profile)}>
                <Avatar seed={profile.id} size={56} emoji={profile.avatar} />
              </button>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewProfile(profile)}
                  className="font-medium hover:underline"
                  style={{ color: theme.text }}
                >
                  {profile.name}
                </button>
                <p className="text-sm truncate" style={{ color: theme.textMuted }}>{profile.headline}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  backgroundColor="transparent"
                  textColor={theme.textMuted}
                >
                  Ignore
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  backgroundColor={theme.primary}
                  textColor="white"
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </StyledCard>

      {/* People You May Know Grid */}
      <h3 className="font-medium mb-4" style={{ color: theme.text }}>People you may know</h3>
      <div className="grid grid-cols-3 gap-4">
        {profiles.map(profile => (
          <StyledCard
            key={profile.id}
            bgColor={theme.surface}
            borderColor={theme.border}
            padding="0"
            borderRadius="lg"
            shadow="sm"
            className="overflow-hidden"
          >
            <div className="h-16" style={{ background: 'linear-gradient(135deg, #0a66c2, #57a773)' }} />
            <div className="px-4 pb-4 text-center -mt-8">
              <button onClick={() => onViewProfile(profile)} className="relative inline-block">
                <Avatar seed={profile.id} size={64} emoji={profile.avatar} className="border-2 border-white rounded-full mx-auto" />
                {profile.isOpenToWork && (
                  <div
                    className="absolute -bottom-1 left-0 right-0 py-0.5 text-[8px] text-center text-white"
                    style={{ background: '#57a773' }}
                  >
                    OPEN
                  </div>
                )}
              </button>
              <button
                onClick={() => onViewProfile(profile)}
                className="block font-medium mt-2 hover:underline"
                style={{ color: theme.text }}
              >
                {profile.name}
              </button>
              <p className="text-xs line-clamp-2 mt-1" style={{ color: theme.textMuted }}>
                {profile.headline}
              </p>
              <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                {profile.connections.toLocaleString()} connections
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                backgroundColor="transparent"
                textColor={theme.primary}
              >
                + Connect
              </Button>
            </div>
          </StyledCard>
        ))}
      </div>
    </div>
  )
}

export default LinkedCornSite
