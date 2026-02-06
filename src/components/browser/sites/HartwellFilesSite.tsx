/**
 * HartwellFiles Site
 *
 * A conspiracy theory archive about the mysterious Hartwell Building.
 * Features "evidence," blurry photos, timeline connections, and
 * the kind of unhinged theorizing that gives /x/ a run for its money.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.hartwellfiles

// ============================================================================
// Types & Data
// ============================================================================

interface Evidence {
  id: string
  title: string
  date: string
  type: 'photo' | 'document' | 'testimony' | 'audio' | 'theory'
  classification: 'verified' | 'unverified' | 'suppressed' | 'leaked'
  content: string[]
  relatedFiles?: string[]
}

interface TimelineEvent {
  year: string
  event: string
  significance: 'minor' | 'major' | 'critical'
}

const TIMELINE: TimelineEvent[] = [
  { year: '1923', event: 'Hartwell Building constructed by Magnus Hartwell', significance: 'major' },
  { year: '1924', event: 'First "incident" reported - workers refuse to enter basement', significance: 'minor' },
  { year: '1931', event: 'Magnus Hartwell disappears. Body never found.', significance: 'critical' },
  { year: '1947', event: 'Building purchased by Omnicorp Holdings (shell company?)', significance: 'major' },
  { year: '1952', event: 'All photos from this year show building with 13 floors. Current building has 12.', significance: 'critical' },
  { year: '1967', event: 'Local newspaper reports "lights in the sky" above building. Story retracted next day.', significance: 'major' },
  { year: '1984', event: 'Entire 7th floor "renovated." No workers remember doing it.', significance: 'critical' },
  { year: '1999', event: 'Y2K preparation team reports "temporal anomalies" in server room', significance: 'major' },
  { year: '2003', event: 'Three tenants move out same day. All cite "bad dreams."', significance: 'minor' },
  { year: '2015', event: 'Building temporarily closed for "asbestos removal." No asbestos found.', significance: 'major' },
  { year: '2019', event: 'Security footage leak shows figure in hallway that doesn\'t appear on other cameras', significance: 'critical' },
  { year: '2024', event: 'Anonymous tip: "The mirrors are doors."', significance: 'critical' },
  { year: '2025', event: 'NestFinder listing appears and disappears within 6 hours. We have screenshots.', significance: 'major' },
]

const EVIDENCE_FILES: Evidence[] = [
  {
    id: 'HW-001',
    title: 'The Missing Floor',
    date: '2023-11-15',
    type: 'photo',
    classification: 'verified',
    content: [
      'We have obtained photographs from 1952 showing the Hartwell Building with 13 floors. Current blueprints show 12.',
      'The city planning office claims this is a "documentation error." We reached out for comment. They stopped returning our calls.',
      'Where did Floor 13 go? More importantly: what was on it?',
      '[IMAGE: Grainy black and white photo showing building exterior. Red circle around what appears to be 13th floor windows.]',
      'Note: Three separate photography experts have verified this image has not been altered. Two of them have since asked us to stop contacting them.',
    ],
    relatedFiles: ['HW-007', 'HW-012'],
  },
  {
    id: 'HW-002',
    title: 'Interview: Former Janitor (Identity Protected)',
    date: '2023-08-22',
    type: 'testimony',
    classification: 'unverified',
    content: [
      'Subject worked at Hartwell Building 2001-2003. Left abruptly. Now lives three states away.',
      '"I cleaned that building for two years. Every night, same routine. Except... some nights there were doors that weren\'t there before."',
      '"The mirrors in the bathroom on floor 7. Don\'t look at them too long. I made that mistake once."',
      '"What did you see?"',
      '"[Subject becomes agitated] I didn\'t see anything. You understand? Nothing. Tell them I said nothing."',
      'Subject ended interview. Has not responded to follow-up contact.',
    ],
    relatedFiles: ['HW-008', 'HW-015'],
  },
  {
    id: 'HW-003',
    title: 'The Hartwell Symbol',
    date: '2024-02-03',
    type: 'document',
    classification: 'leaked',
    content: [
      'Documents obtained from [REDACTED] show a recurring symbol in Magnus Hartwell\'s personal correspondence.',
      'The symbol appears to be: A circle, containing a triangle, containing an eye, containing... another smaller building?',
      'This same symbol appears:',
      '• On the building\'s original cornerstone (since covered by renovation)',
      '• In the background of 3 separate employee photos',
      '• Etched into a mirror on the 7th floor (reported by Source HW-002)',
      '• In the coffee foam at the cafe across the street (this one might be coincidence)',
      'We are consulting with occult historians. Results pending.',
    ],
    relatedFiles: ['HW-001', 'HW-011'],
  },
  {
    id: 'HW-004',
    title: 'Audio Recording: Night Security Shift',
    date: '2024-06-17',
    type: 'audio',
    classification: 'suppressed',
    content: [
      'Duration: 4 hours, 23 minutes. Recorded by security guard [NAME WITHHELD] on unauthorized personal device.',
      'Notable timestamps:',
      '01:23:45 - Footsteps in empty hallway. Guard investigates. Nothing found.',
      '02:15:00 - Elevator moves from floor 6 to floor 8. Skips 7. Guard did not call it.',
      '02:47:33 - Whispering audible. Too faint to transcribe. Audio analysis suggests "multiple voices."',
      '03:01:12 - Guard: "What the f***?" Sound of running. Heavy breathing.',
      '03:15:00 - Recording ends abruptly.',
      'Guard resigned the following morning. Would not provide statement.',
      '[Audio file mysteriously corrupted 3 days after we obtained it. We have backups.]',
    ],
    relatedFiles: ['HW-002', 'HW-009'],
  },
  {
    id: 'HW-005',
    title: 'THEORY: Hartwell is a Beacon',
    date: '2024-09-30',
    type: 'theory',
    classification: 'unverified',
    content: [
      'Connecting the dots:',
      '1. The building was constructed in 1923, on a site that was previously a church (burned down 1921)',
      '2. Magnus Hartwell was a known associate of Aleister Crowley (unconfirmed but likely)',
      '3. The building\'s architecture incorporates sacred geometry that matches no known style',
      '4. Every major "incident" occurs at night, during specific lunar phases',
      'CONCLUSION: The Hartwell Building is not just a building. It\'s a beacon. A lighthouse. Something is being called.',
      'The question is: has it arrived yet?',
      'UPDATE 2025-01-10: Cross-referencing with the Quantum Coffee research community. They report "temporal anomalies" near the building. THE PIECES ARE CONNECTING.',
    ],
    relatedFiles: ['HW-001', 'HW-003', 'HW-011'],
  },
  {
    id: 'HW-006',
    title: 'The Velvet Algorithms Connection',
    date: '2024-12-01',
    type: 'document',
    classification: 'unverified',
    content: [
      'Why did local band Velvet Algorithms refuse to play at The Underground when the venue was located near the Hartwell Building?',
      'Band member quote from deleted Threadit post: "We don\'t play there anymore. The acoustics are wrong. The whole BUILDING is wrong."',
      'The Underground moved locations in 2020. Velvet Algorithms resumed playing there in 2021.',
      'Coincidence? The building affects sound. Music. Frequencies.',
      'Are they hiding something? Or protecting us?',
      'Note: Band has not responded to our 47 email inquiries.',
    ],
    relatedFiles: ['HW-005'],
  },
  {
    id: 'HW-007',
    title: 'NestFinder Listing Analysis',
    date: '2025-01-05',
    type: 'document',
    classification: 'verified',
    content: [
      'On January 3, 2025, a listing appeared on NestFinder for "Luxury Condo - Hartwell Building."',
      'The listing was removed within 6 hours. We captured screenshots.',
      'Notable details from listing:',
      '• Listed on floor 7 (matches our "problem floor" hypothesis)',
      '• Price: $0/month (error or... invitation?)',
      '• Description included phrase: "Perfect for those who don\'t mind watching"',
      '• Photos showed interior that matches NO KNOWN FLOOR PLAN',
      '• One photo shows a mirror. In the reflection: a figure that isn\'t in the foreground.',
      'NestFinder support claims listing was "spam." We know better.',
    ],
    relatedFiles: ['HW-001', 'HW-002'],
  },
]

const QUICK_FACTS = [
  'The building has no floor 13, but photographs from 1952 show 13 floors',
  'Magnus Hartwell\'s body was never found after his 1931 disappearance',
  'The mirrors on floor 7 were replaced 3 times in 2023',
  'Security guards average 3.2 months before quitting',
  'No pets are allowed in the building. Official reason: "allergies"',
  'The basement has been "under renovation" since 1984',
  'Building records before 1947 are "missing" from city archives',
]

// ============================================================================
// DB → Local Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Evidence interface.
 * Content paragraphs stored in metadata.content array, classification/type in metadata.
 */
function dbToEvidence(item: SiteContentItem): Evidence {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    date: m.date || (item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : ''),
    type: (m.evidenceType || item.contentType || 'document') as Evidence['type'],
    classification: (m.classification || 'unverified') as Evidence['classification'],
    content: m.content || (item.body ? item.body.split('\n\n') : []),
    relatedFiles: m.relatedFiles,
  }
}

// ============================================================================
// Components
// ============================================================================

function GlitchText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span className="absolute top-0 left-0 text-red-500 opacity-50 animate-pulse" style={{ transform: 'translate(1px, 1px)' }}>
        {children}
      </span>
    </span>
  )
}

function EvidenceCard({ evidence, onSelect }: { evidence: Evidence; onSelect: () => void }) {
  const classColors = {
    verified: { bg: '#065f46', text: '#86efac' },
    unverified: { bg: '#78350f', text: '#fcd34d' },
    suppressed: { bg: '#7f1d1d', text: '#fca5a5' },
    leaked: { bg: '#581c87', text: '#e879f9' },
  }

  const typeIcons = {
    photo: '📷',
    document: '📄',
    testimony: '🗣️',
    audio: '🎙️',
    theory: '🧠',
  }

  const classColor = classColors[evidence.classification]

  return (
    <StyledCard
      variant="dark"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="cursor-pointer"
      bgColor="#111827"
      borderColor="#374151"
      textColor="#f3f4f6"
      hoverColor="#1f2937"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 font-mono text-xs">{evidence.id}</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: classColor.bg, color: classColor.text }}>
          {evidence.classification.toUpperCase()}
        </span>
      </div>
      <h3 className="text-white font-bold flex items-center gap-2">
        <span>{typeIcons[evidence.type]}</span>
        {evidence.title}
      </h3>
      <p className="text-gray-400 text-sm mt-1">{evidence.date}</p>
      <p className="text-gray-500 text-xs mt-2 line-clamp-2">
        {evidence.content[0]}
      </p>
    </StyledCard>
  )
}

function EvidenceDetail({ evidence, onBack }: { evidence: Evidence; onBack: () => void }) {
  const classColors = {
    verified: { border: '#22c55e', text: '#4ade80' },
    unverified: { border: '#eab308', text: '#facc15' },
    suppressed: { border: '#ef4444', text: '#f87171' },
    leaked: { border: '#a855f7', text: '#d8b4fe' },
  }

  const classColor = classColors[evidence.classification]

  return (
    <StyledCard
      variant="dark"
      padding="lg"
      borderRadius="md"
      shadow="md"
      bgColor="#111827"
      borderColor="#374151"
      textColor="#f3f4f6"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#f87171"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to files
      </Button>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-gray-500 font-mono text-sm">FILE: {evidence.id}</span>
          <h1 className="text-2xl font-bold text-white mt-1">{evidence.title}</h1>
        </div>
        <span className="border px-3 py-1 rounded" style={{ borderColor: classColor.border, color: classColor.text }}>
          {evidence.classification.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4">Date: {evidence.date}</p>
      <div className="border-t border-gray-700 pt-4">
        {evidence.content.map((para, i) => (
          <p key={i} className="text-gray-300 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      {evidence.relatedFiles && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-sm">Related Files: {evidence.relatedFiles.join(', ')}</p>
        </div>
      )}
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function HartwellFilesSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('hartwellfiles')

  const evidenceFiles = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToEvidence)
    return EVIDENCE_FILES
  }, [dbContent])

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [activeTab, setActiveTab] = useState<'files' | 'timeline' | 'about'>('files')

  return (
    <div className="min-h-full" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="border-b border-red-900 py-4 px-4" style={{ background: 'linear-gradient(180deg, #1a0000 0%, #0a0a0a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏚️</span>
            <div>
              <h1 className="text-2xl font-bold text-red-500 font-mono">
                <GlitchText>THE HARTWELL FILES</GlitchText>
              </h1>
              <p className="text-red-700 text-sm italic">
                "The truth is in there. Literally. Floor 7."
              </p>
            </div>
          </div>
          <nav className="flex gap-6 mt-4">
            {(['files', 'timeline', 'about'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedEvidence(null); }}
                className={`text-sm uppercase tracking-wider ${
                  activeTab === tab ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-red-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-red-900/30 border-y border-red-800 py-2 px-4">
        <p className="text-red-400 text-xs text-center font-mono animate-pulse">
          ⚠️ THIS SITE IS BEING MONITORED ⚠️ WE KNOW THEY'RE WATCHING ⚠️ READ QUICKLY ⚠️
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'files' && (
          <>
            {selectedEvidence ? (
              <EvidenceDetail
                evidence={selectedEvidence}
                onBack={() => setSelectedEvidence(null)}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {evidenceFiles.map(evidence => (
                  <EvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    onSelect={() => setSelectedEvidence(evidence)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'timeline' && (
          <StyledCard
            variant="dark"
            padding="lg"
            borderRadius="md"
            shadow="md"
            bgColor="#111827"
            borderColor="#374151"
            textColor="#f3f4f6"
          >
            <h2 className="text-xl font-bold text-white mb-4">📅 Incident Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-red-900" />
              {TIMELINE.map((event, i) => (
                <div key={i} className="relative pl-10 pb-6">
                  <div className={`absolute left-2.5 w-4 h-4 rounded-full border-2 ${
                    event.significance === 'critical' ? 'bg-red-600 border-red-400' :
                    event.significance === 'major' ? 'bg-yellow-600 border-yellow-400' :
                    'bg-gray-600 border-gray-400'
                  }`} />
                  <div className="flex items-baseline gap-3">
                    <span className="text-red-400 font-mono font-bold">{event.year}</span>
                    <span className={`text-sm ${
                      event.significance === 'critical' ? 'text-red-300' :
                      event.significance === 'major' ? 'text-yellow-300' :
                      'text-gray-400'
                    }`}>
                      {event.event}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
              <p>🔴 Critical | 🟡 Major | ⚪ Minor</p>
              <p className="mt-2 italic">This timeline is incomplete. If you have information, contact us securely.</p>
            </div>
          </StyledCard>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <StyledCard
              variant="dark"
              padding="lg"
              borderRadius="md"
              shadow="md"
              bgColor="#111827"
              borderColor="#374151"
              textColor="#f3f4f6"
            >
              <h2 className="text-xl font-bold text-white mb-4">About This Archive</h2>
              <div className="text-gray-300 text-sm space-y-4">
                <p>
                  This archive exists because someone has to document the truth. The Hartwell Building
                  isn't just a building. It's an anomaly. A wound in the fabric of our city.
                </p>
                <p>
                  We are a collective of researchers, former tenants, and concerned citizens. We have
                  no funding, no institutional support, and several cease-and-desist letters from
                  Omnicorp Holdings.
                </p>
                <p>
                  If you have information, evidence, or experiences related to the Hartwell Building,
                  contact us. But be careful. Use a VPN. They're watching.
                </p>
              </div>
            </StyledCard>

            <StyledCard
              variant="dark"
              padding="lg"
              borderRadius="md"
              shadow="md"
              bgColor="#111827"
              borderColor="#374151"
              textColor="#f3f4f6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Quick Facts</h2>
              <ul className="space-y-2">
                {QUICK_FACTS.map((fact, i) => (
                  <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-red-500">▸</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </StyledCard>

            <StyledCard
              variant="dark"
              padding="lg"
              borderRadius="md"
              shadow="md"
              bgColor="#7f1d1d"
              borderColor="#991b1b"
              textColor="#fca5a5"
            >
              <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Warning</h2>
              <p className="text-red-300 text-sm">
                If you are reading this and you live in or near the Hartwell Building:
              </p>
              <ul className="mt-2 space-y-1 text-red-400 text-sm">
                <li>• Do not look at the mirrors on floor 7 for more than 3 seconds</li>
                <li>• Do not acknowledge sounds from empty rooms</li>
                <li>• If you see a door that wasn't there before, do not open it</li>
                <li>• If someone knocks from inside a wall, do not respond</li>
                <li>• The basement is off-limits for a reason</li>
              </ul>
            </StyledCard>
          </div>
        )}

        {/* Sidebar Info */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <StyledCard
            variant="dark"
            padding="md"
            borderRadius="md"
            shadow="md"
            bgColor="#111827"
            borderColor="#374151"
            textColor="#f3f4f6"
          >
            <h3 className="text-gray-400 text-xs uppercase mb-2">Files Documented</h3>
            <p className="text-2xl font-bold text-white">{evidenceFiles.length}</p>
          </StyledCard>
          <StyledCard
            variant="dark"
            padding="md"
            borderRadius="md"
            shadow="md"
            bgColor="#111827"
            borderColor="#374151"
            textColor="#f3f4f6"
          >
            <h3 className="text-gray-400 text-xs uppercase mb-2">Incidents Logged</h3>
            <p className="text-2xl font-bold text-white">{TIMELINE.length}</p>
          </StyledCard>
          <StyledCard
            variant="dark"
            padding="md"
            borderRadius="md"
            shadow="md"
            bgColor="#111827"
            borderColor="#374151"
            textColor="#f3f4f6"
          >
            <h3 className="text-gray-400 text-xs uppercase mb-2">Days Since Last "Incident"</h3>
            <p className="text-2xl font-bold text-red-500">3</p>
          </StyledCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center text-xs text-gray-600">
          <p>Archive maintained by concerned citizens. We are not crazy.</p>
          <p className="mt-1">
            The truth is in there. The truth is in there. The truth is in there.
          </p>
          <p className="mt-2 text-gray-700 font-mono">
            [If this page disappears, you know why]
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HartwellFilesSite
