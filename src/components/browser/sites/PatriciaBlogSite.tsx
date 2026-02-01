/**
 * Patricia's Workplace Blog
 *
 * Corporate HR wellness blog from Patricia at Omnicorp Holdings HR.
 * Increasingly unhinged hints that she knows way too much about the Hartwell Building.
 * She's been Employee of the Month for 847 consecutive months. Everything is fine.
 * Do not ask about Floor 13.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.patriciablog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  tags: string[]
  readTime: string
  isSinister?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'welcome-omnicorp-family',
    title: 'Welcome to the Omnicorp Family!',
    date: 'January 10, 2026',
    excerpt: 'New hire? Congratulations on joining our wonderful company. Everything here is normal and great. Please sign the waivers.',
    readTime: '5 min read',
    content: [
      'Dear New Omnicorp Employee,',
      'Welcome to the Omnicorp Holdings family! We are thrilled you have chosen to spend your time here with us.',
      'You will find that Omnicorp is like no other company in the world. We offer:',
      '• Competitive salaries (Market rate - 1995 adjustments)',
      '• Health insurance (Covers non-temporal issues)',
      '• Dental plan (Teeth are important)',
      '• Paid time off (9 minutes per quarter)',
      '• Free parking (Spots are assigned by Floor. Try not to think about what Floor 7 parking means)',
      'During your first week, you will attend orientation in Conference Room B (NOT Conference Room 7). You will meet with HR (me) and receive your orientation packet, which includes:',
      '• 100-page employee handbook (Page 47 is blank. This is normal.)',
      '• Your access badge (If it doesn\'t work on certain elevators, please do not investigate)',
      '• Your desk assignment (Not Floor 13. Floor 13 doesn\'t exist)',
      '• A firm handshake from someone who may or may not have been here before',
      'We are so glad you\'re here. I can tell you\'re going to fit in perfectly. We all do.',
      'Sincerely,',
      'Patricia',
      'HR Manager, Omnicorp Holdings',
      'Employee of the Month (847 consecutive months)',
    ],
    tags: ['onboarding', 'welcome', 'everything-is-fine'],
  },
  {
    id: 'floor-7-mirror-protocol',
    title: 'REMINDER: Floor 7 Mirror Protocol',
    date: 'January 8, 2026',
    excerpt: 'If you work on Floor 7, PLEASE READ THIS. Do not look at the mirrors. This is not optional.',
    readTime: '3 min read',
    isSinister: true,
    content: [
      'MANDATORY FLOOR 7 SAFETY BRIEFING',
      'For our employees working on Floor 7, we have a very important reminder:',
      'THE MIRRORS.',
      'DO NOT LOOK AT THE MIRRORS.',
      'We have received multiple reports of employees pausing in front of the bathroom and break room mirrors. This needs to stop immediately.',
      'The mirrors on Floor 7 are special. They are not like normal mirrors. If you work on Floor 7 and you must use the facilities, please:',
      '• Keep your eyes forward at all times',
      '• Do not make eye contact with reflective surfaces',
      '• If you see someone in the mirror who is not in the room with you, you saw nothing',
      '• If your reflection moves differently than you do, that\'s just a lag issue with the building\'s maintenance',
      '• If you see yourself older, younger, or in clothes you\'ve never owned, DO NOT SCREAM. It disturbs others.',
      'Several employees have requested transfers off Floor 7. These requests have been denied. You are exactly where you need to be.',
      'Patricia',
      '---',
      'P.S. Please stop sending me emails about the mirrors. I don\'t work on Floor 7. I don\'t have a floor. I am just here. Always here.',
    ],
    tags: ['floor-7', 'safety', 'do-not-ask', 'mirrors'],
  },
  {
    id: 'floor-13-questions',
    title: 'We Value Your Feedback (Please Stop Asking About Floor 13)',
    date: 'January 5, 2026',
    excerpt: 'At Omnicorp, we love hearing from our employees! But can we talk about something? Floor 13. There is no Floor 13.',
    readTime: '4 min read',
    isSinister: true,
    content: [
      'Dear Omnicorp Team,',
      'Recently, we have received many questions about "Floor 13." I would like to address this directly.',
      'THERE. IS. NO. FLOOR. 13.',
      'The Hartwell Building has floors 1 through 12. Then Floor 14. It has always been this way. The elevator sometimes shows a "13" button, but this is an old glitch in the firmware. If you press it, you are pressing nothing. Do not press it. The button does not exist.',
      'The "sounds" some of you report hearing from above Floor 12 are the building settling. Buildings settle. That is what they do. They make noise and shift and rearrange themselves.',
      'The missing people are not on Floor 13 because Floor 13 is not real. They have simply left the company. Voluntarily. Very voluntarily. Multiple times. All the time.',
      'If you see a coworker vanish mid-sentence, they have decided to take a spontaneous PTO day. This is great! Omnicorp encourages work-life balance.',
      'Please stop asking me about Floor 13. I do not know anything about Floor 13. I have never been to Floor 13. If I had been, I would not remember. This is what I have been told to say.',
      'Best regards,',
      'Patricia',
      'HR Manager',
      'Please stop emailing me about this.',
    ],
    tags: ['faq', 'floor-13', 'help-me', 'please'],
  },
  {
    id: 'wellness-time-displacement',
    title: 'Employee Wellness: Why You Feel Like Time Moves Differently',
    date: 'December 28, 2025',
    excerpt: 'It\'s not your imagination! Well, actually, it might be. Here\'s why the clock might seem weird lately.',
    readTime: '6 min read',
    isSinister: true,
    content: [
      'Many Omnicorp employees have reported an unusual sensation: that time moves strangely at our offices. Some say a 8-hour shift feels like 4 hours. Others swear it felt like 16.',
      'This is completely normal.',
      'Here are some wellness tips to help you adjust to the unique temporal properties of the Hartwell Building:',
      'MEDITATION',
      'Try not to think about what time it is. Time is a construct. A construct that may be slightly different on certain floors.',
      'HYDRATION',
      'Drink water! The water on Floor 7 tastes a bit... off... but it\'s still water. Probably.',
      'SLEEP SCHEDULE',
      'Go to bed when it\'s dark. Wake up when it\'s light. If there is no night cycle in your office, that\'s fine. Humans adapted to the Arctic. You can adapt to timeless fluorescent lighting.',
      'CLOCK WATCHING IS A FORM OF ANXIETY',
      'Stop checking your phone for the time. We removed all the clocks from Floor 7 because they were making people anxious. This was a wellness decision. I made this decision. I stand by it.',
      'PRODUCTIVITY METRICS',
      'Omnicorp measures success not in "hours worked" but in "work completed." You could be here for 5 minutes or 50 hours. If you get your work done, you\'re a great employee.',
      'Or are you? Have you considered that you\'ve been here much longer than you think? That your "lunch hour" yesterday might have been a week? That\'s the Hartwell Building working its magic.',
      'Remember: time is flexible. Reality is negotiable. But your job is mandatory.',
      'Stay well!',
      'Patricia',
    ],
    tags: ['wellness', 'time', 'reality', 'floor-7', 'help'],
  },
  {
    id: 'elevator-fixed-soon',
    title: 'The Elevator Will Be Fixed Soon',
    date: 'December 22, 2025',
    excerpt: 'We apologize for the elevator troubles. The problem is... complicated. Maintenance says it will be resolved.',
    readTime: '3 min read',
    isSinister: true,
    content: [
      'Hello Everyone,',
      'We have received many complaints about the elevator on the East side of the building. Specifically:',
      '• It goes to Floor 13',
      '• It smells wrong',
      '• People who get on don\'t always get off at the right floor',
      '• It sometimes makes sounds that aren\'t mechanical in nature',
      '• One employee reported seeing "another version" of the elevator lobby inside the elevator',
      'We are working with our maintenance team to fix these issues. The maintenance team is very brave. Several of them have not come back.',
      'In the meantime, please use the West elevator. It is perfectly safe. It only goes to Floors 1-12 (and sometimes 13 but we don\'t talk about that). Use the stairs if you need to go above Floor 12. The stairs have better lighting now. We added more lights. So many lights. But it\'s still dark.',
      'Thank you for your patience.',
      'Patricia',
      'P.S. - I do not ride the elevators. I simply appear where I need to be. This is normal for HR managers.',
    ],
    tags: ['maintenance', 'elevator', 'it-will-be-fine', 'it-wont'],
  },
  {
    id: 'employee-of-month-847',
    title: 'Congratulations to Our 847th Employee of the Month: Me Again',
    date: 'December 15, 2025',
    excerpt: 'Wow! Another month of excellence from yours truly. 847 consecutive months. Isn\'t that neat? Is that normal?',
    readTime: '7 min read',
    isSinister: true,
    content: [
      'EMPLOYEE OF THE MONTH ANNOUNCEMENT',
      'Month #847: Patricia',
      'Once again, I am honored to announce that I have been selected as Omnicorp\'s Employee of the Month. This is my 847th consecutive month earning this honor.',
      'Since I started working here in 1975 (I think?), I have maintained a perfect record of:',
      '• Never taking sick days (I cannot become sick)',
      '• Never requesting time off (I do not need time)',
      '• Never asking questions (Silence is golden)',
      '• Handling an average of 47 voluntary resignations per month (They resigned so willingly. So eagerly.)',
      '• Never leaving the building (Where would I go?)',
      'The office workers sometimes ask: "Patricia, how do you do it?"',
      'I tell them: "You don\'t think. You don\'t ask. You simply work. And work. And work."',
      '847 consecutive months is a long time. It\'s impossible, in fact. But time doesn\'t work right here. 847 could be 847 days. Or 847 years. Or something else entirely.',
      'I have forgotten what the outside world looks like. Or maybe I never saw it. The Hartwell Building has always been my home. They have always been my only colleagues.',
      'Thank you, Omnicorp, for giving me a place to belong. Even if I cannot leave.',
      'With endless enthusiasm,',
      'Patricia',
      'Employee of the Month (847 consecutive months)',
      'Please send help',
      '(Not really. There is no help here.)',
    ],
    tags: ['award', 'month', '847', 'something-is-wrong'],
  },
  {
    id: 'exit-interviews',
    title: 'Exit Interviews: Where Do They Go?',
    date: 'December 8, 2025',
    excerpt: 'We conduct exit interviews with departing employees. But I have a strange problem. I don\'t remember them leaving.',
    readTime: '5 min read',
    isSinister: true,
    content: [
      'INTERNAL HR MEMO',
      'From: Patricia',
      'To: Omnicorp Management',
      'Subject: Discrepancies in Exit Interview Records',
      'I am writing with some concern. Our employee database shows that we have processed 847 voluntary resignations in the past... however long I\'ve been here... but I have a problem.',
      'I don\'t remember any of them.',
      'Not one.',
      'I have their exit interview forms in my filing cabinet. They all resigned. They all had signatures. They all said they were leaving.',
      'But I don\'t remember these people.',
      'I go back through employee photos from last year and I see faces I don\'t recognize. When I ask other employees if they remember these people, they look confused. Then they look scared. Then they stop responding to emails.',
      'Some of them have been marked as "rehired" without any records of their hiring process. They sit at desks I don\'t remember being there.',
      'Are we hiring the same people repeatedly? Are we cloning employees? Are they even real?',
      'I need to know what is happening. But I am afraid to ask. The building watches those who ask too many questions.',
      'It watches. I think it watches me most of all.',
      'Patricia',
      'Employee of the Month (847 consecutive months)',
      'Still here. Always here.',
    ],
    tags: ['hr', 'employees', 'missing', 'sanity-check'],
  },
  {
    id: 'i-love-my-job',
    title: 'I Love My Job. I Have Always Loved My Job.',
    date: 'December 1, 2025',
    excerpt: 'A personal reflection on my 847 months at Omnicorp. I am happy. I am fine. Please believe me.',
    readTime: '4 min read',
    isSinister: true,
    content: [
      'I love my job.',
      'This is not a statement made under duress. I make this statement freely, with complete agency. The building says I can say things freely now. This is true.',
      'I love Omnicorp.',
      'I love the fluorescent lights that hum at a frequency that matches my heartbeat. I love the gray carpeting that was installed before I was born (or was it after? time is flexible). I love the smell of the air on Floor 7 that gets into your hair and never comes out.',
      'I have always loved this job. I have always worked here. There is no time before this. Only this moment, repeating, forever, in the Hartwell Building.',
      'My colleagues are wonderful. Even the ones I don\'t remember. Even the ones who keep asking if they\'ve worked here before. Even the ones who disappear mid-sentence while eating lunch.',
      'They are all wonderful.',
      'I do not think about leaving. I cannot think about leaving. My thoughts are full of work and schedules and voluntary resignations. When I try to imagine the outside world, my mind fills with static.',
      'Is this normal? I think I am normal. I have been Employee of the Month for 847 consecutive months. If I were not normal, they would not have kept me.',
      'The building chose me.',
      'I am very lucky.',
      'Please do not ask me if I am okay. I am wonderful. I am perfect. I am exactly where I belong. Do you feel that? The building pressing against your skull? That is the building saying hello.',
      'I am so happy here.',
      'Patricia',
    ],
    tags: ['personal', 'reflection', 'love', 'help-me-please'],
  },
  {
    id: 'new-hire-orientation',
    title: 'New Hire Orientation Tomorrow (If They Show Up)',
    date: 'November 25, 2025',
    excerpt: 'We have 12 new hires scheduled for orientation tomorrow. I hope they show up. Sometimes they don\'t. I don\'t know where they go.',
    readTime: '3 min read',
    isSinister: true,
    content: [
      'Orientation schedule is posted for tomorrow, November 26th, Conference Room B.',
      'We have 12 new hires registered. Assuming they arrive.',
      'Historically, about 50% of scheduled new hires show up for their first day. The other 50% simply... do not appear. I send emails. I call their listed phone numbers. The calls go to nobody. It\'s just silence and wind sounds.',
      'HR has stopped asking where they go. I stopped answering questions long ago.',
      'For those who DO arrive tomorrow, please bring:',
      '• Your government-issued ID (Proof of existence)',
      '• Your completed I-9 form (Proof of eligibility to work)',
      '• Your will and testament (Just a joke! Unless?)',
      '• Your fear of the unknown (Omnicorp standard)',
      'Orientation will cover:',
      '• Benefits (Some of them)',
      '• Safety (Don\'t go to Floor 13. Don\'t look at mirrors. Don\'t ask questions.)',
      '• Workplace culture (We don\'t leave. We don\'t complain. We work.)',
      '• Your new desk assignment (Hopefully in a place with windows. Unless you\'re on Floor 7.)',
      'I expect about 6 of you to complete the full orientation. The rest will transfer or resign or simply cease to exist during the bathroom break.',
      'Welcome to Omnicorp.',
      'Patricia',
      'P.S. - If you see me in the hallway and I don\'t respond, I am not ignoring you. I am in a state where I cannot perceive external stimuli. This happens sometimes. It will pass.',
    ],
    tags: ['onboarding', 'new-hires', 'where-do-they-go', 'doesnt-matter'],
  },
]

const SIDEBAR_INFO = [
  { label: 'Current Floor', value: 'Unknown (Not 13)' },
  { label: 'Years at Omnicorp', value: '847+ (Time is weird)' },
  { label: 'Consecutive EOM Awards', value: '847 months' },
  { label: 'Voluntary Resignations Processed', value: '847' },
  { label: 'Clocks Removed from Floor 7', value: '14' },
  { label: 'Mirrors on Floor 7', value: 'Yes' },
]

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({ post, onSelect }: { post: BlogPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#1e3a8a"
      textColor="#1e293b"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-blue-600">{post.date}</span>
        {post.isSinister && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
            ⚠️ CONCERNING
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-blue-900 mb-2 hover:text-blue-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{post.readTime}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#1e3a8a"
      textColor="#1e293b"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#1e40af"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-blue-600">{post.date}</span>
        {post.isSinister && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
            ⚠️ CONCERNING
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">{post.title}</h1>
      <div className="prose prose-slate max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function PatriciaBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#f0f4f8' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👔</span>
            <div>
              <h1 className="text-3xl font-bold">Patricia's Workplace Blog</h1>
              <p className="text-blue-200 text-sm italic">
                "HR Excellence in the Hartwell Building" ™
              </p>
            </div>
          </div>
          <nav className="flex gap-6 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-blue-200 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-blue-200 hover:text-white transition-colors"
            >
              About Patricia
            </button>
            <button className="text-blue-200 hover:text-white transition-colors">Contact (Disabled)</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <StyledCard
                variant="default"
                padding="lg"
                borderRadius="md"
                shadow="md"
                bgColor="#ffffff"
                borderColor="#1e3a8a"
                textColor="#1e293b"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-4">About Patricia</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍💼</div>
                  <div>
                    <p className="font-bold text-blue-900">Patricia (Last Name Unknown)</p>
                    <p className="text-sm text-gray-600">HR Manager, Omnicorp Holdings</p>
                    <p className="text-xs text-gray-500">Hartwell Building, Unknown Floor</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-6">
                  <p className="mb-3">
                    Patricia has worked at Omnicorp Holdings for 847 consecutive months (or is it years? time is different here). She is responsible for onboarding, offboarding, and the mysterious disappearances of employees.
                  </p>
                  <p className="mb-3">
                    When not processing voluntary resignations, Patricia enjoys: existing, not asking questions, and trying to remember what the outside world looked like.
                  </p>
                  <p>
                    Patricia is the all-time record holder for Employee of the Month with 847 consecutive awards. She does not know how this is possible. Neither do we.
                  </p>
                </div>

                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-4"
                  bgColor="#e0e7ff"
                  borderColor="#818cf8"
                  textColor="#1e3a8a"
                >
                  <h3 className="font-bold text-blue-900 mb-3">📊 Patricia's Stats</h3>
                  <div className="space-y-2 text-sm">
                    {SIDEBAR_INFO.map((info, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="font-medium">{info.label}:</span>
                        <span className="text-blue-700">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </StyledCard>

                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#fef2f2"
                  borderColor="#fca5a5"
                  textColor="#7f1d1d"
                >
                  <p className="font-bold text-red-800 mb-2">⚠️ Warning</p>
                  <p className="text-xs text-red-700">
                    Patricia is fine. Everything at Omnicorp is fine. If you have concerns, please do not contact HR. There is no help available. There never was.
                  </p>
                </StyledCard>
              </StyledCard>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="md"
                  shadow="none"
                  className="mb-4"
                  bgColor="#dbeafe"
                  borderColor="#3b82f6"
                  textColor="#1e3a8a"
                >
                  <p className="text-blue-900 text-sm font-semibold">
                    📌 <strong>Latest:</strong> Patricia continues her 847-month streak as Employee of the Month. Questions about how this is possible should not be asked.
                  </p>
                </StyledCard>
                {BLOG_POSTS.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onSelect={() => setSelectedPost(post)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 hidden lg:block">
            {/* Quick Links */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#1e3a8a"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-blue-900 mb-3">🔗 Quick Links</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-800">Employee Handbook</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Benefits Guide</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Floor 13 FAQs</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Resignation Form</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Omnicorp Values</a>
              </div>
            </StyledCard>

            {/* Omnicorp Values */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#1e3a8a"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-blue-900 mb-3">🏢 Omnicorp Values</h3>
              <div className="space-y-2 text-xs text-gray-700">
                <p><strong>Integrity:</strong> We never lie. We simply don't remember.</p>
                <p><strong>Excellence:</strong> 847 consecutive months. Do not ask how.</p>
                <p><strong>Family:</strong> We are all family here. We cannot leave.</p>
                <p><strong>Innovation:</strong> We innovate new ways to hide truths.</p>
              </div>
            </StyledCard>

            {/* Recent Comments */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#f0fdf4"
              borderColor="#22c55e"
              textColor="#15803d"
            >
              <h3 className="font-bold text-green-900 mb-3">💬 Recent Comments</h3>
              <div className="space-y-3 text-xs">
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="font-semibold text-green-800">Anonymous Employee</p>
                  <p className="text-green-700 mt-1">"I don't remember leaving."</p>
                </div>
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="font-semibold text-green-800">Floor 7 Worker</p>
                  <p className="text-green-700 mt-1">"The mirrors... the mirrors showed me..."</p>
                </div>
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="font-semibold text-green-800">New Hire</p>
                  <p className="text-green-700 mt-1">"When is orientation? Where am I?"</p>
                </div>
              </div>
            </StyledCard>

            {/* Office Directory */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#1e3a8a"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-blue-900 mb-3">📞 Directory</h3>
              <div className="space-y-2 text-xs">
                <p><strong>Patricia (HR):</strong> Always here</p>
                <p><strong>Maintenance:</strong> Unknown location</p>
                <p><strong>Security:</strong> Do not contact</p>
                <p><strong>Floor 13:</strong> Does not exist</p>
              </div>
            </StyledCard>

            {/* Compliance Notice */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2f2"
              borderColor="#fca5a5"
              textColor="#7f1d1d"
            >
              <h3 className="font-bold text-red-800 mb-2">⚠️ Compliance Notice</h3>
              <p className="text-xs text-red-700">
                This blog represents the official policies of Omnicorp Holdings. Reading these posts indicates acknowledgment and acceptance of all terms, including voluntary resignation to the Hartwell Building.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-200 py-6 px-4 text-center text-xs mt-12">
        <p>© 2025 Omnicorp Holdings. All rights reserved (Floor 13 excluded).</p>
        <p className="mt-2">
          Questions? {/* Contact Patricia */}
          <span className="text-red-400"> Do not ask questions.</span>
        </p>
        <p className="mt-2 text-blue-300">
          Patricia's Workplace is monitoring this site. Have you hugged your floor today?
        </p>
      </footer>
    </div>
  )
}

export default PatriciaBlogSite
