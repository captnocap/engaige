/**
 * VitalityRx Site
 *
 * Pharmaceutical advertising site for the engAIge browser.
 * Features fake medications, ridiculous side effects, and over-the-top medical marketing.
 *
 * Refactored to use shared components: StyledCard, Button, Avatar, MetaRow
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'

const site = FILLER_SITES.pharmacy

// ============================================================================
// Types
// ============================================================================

interface Medication {
  id: string
  name: string
  genericName: string
  tagline: string
  condition: string
  description: string
  icon: string
  color: string
  dosage: string
  howItWorks: string
  clinicalResults: {
    stat: string
    description: string
  }[]
  sideEffects: {
    common: string[]
    uncommon: string[]
    rare: string[]
  }
  testimonials: {
    name: string
    age: number
    location: string
    quote: string
    avatar: string
  }[]
  disclaimer: string
}

// ============================================================================
// Sample Data
// ============================================================================

const MEDICATIONS: Medication[] = [
  {
    id: 'quantumil',
    name: 'QUANTUMIL®',
    genericName: 'caffeinous observatum',
    tagline: 'Because your morning deserves to be observed.',
    condition: 'Quantum Coffee Intolerance Syndrome (QCIS)',
    description: 'QUANTUMIL is a once-daily prescription medication for adults who experience adverse reactions to quantum-brewed coffee, including paradoxical drowsiness, Schrödinger\'s jitters, and wave function anxiety.',
    icon: '☕💊',
    color: '#6B4C9A',
    dosage: 'One 250mg capsule daily, preferably before attempting to observe your morning coffee.',
    howItWorks: 'QUANTUMIL works by stabilizing the quantum superposition of caffeine molecules in your bloodstream, allowing your body to process both the caffeinated and decaffeinated states simultaneously without cognitive dissonance.',
    clinicalResults: [
      { stat: '78%', description: 'of patients reported reduced wave function anxiety after 8 weeks' },
      { stat: '64%', description: 'experienced fewer Schrödinger\'s jitters' },
      { stat: '91%', description: 'were able to enjoy quantum coffee without existential dread' },
    ],
    sideEffects: {
      common: [
        'Temporal displacement (feeling like it\'s still yesterday)',
        'Mild superposition (being in two moods at once)',
        'Increased desire to discuss physics at parties',
        'Spontaneous quantum entanglement with household pets',
      ],
      uncommon: [
        'Perceiving coffee as both hot and cold',
        'Temporary invisibility to baristas',
        'Dreams in scientific notation',
        'Uncontrollable urge to watch documentaries',
      ],
      rare: [
        'Actually understanding quantum mechanics',
        'Becoming the coffee',
        'Existence collapse (please seek immediate medical attention)',
      ],
    },
    testimonials: [
      {
        name: 'Sarah M.',
        age: 34,
        location: 'Portland, OR',
        quote: 'Before QUANTUMIL, I couldn\'t even look at a quantum coffee maker without feeling like I was in two places at once. Now I can observe my morning brew with confidence!',
        avatar: '👩‍💼',
      },
      {
        name: 'David K.',
        age: 42,
        location: 'Austin, TX',
        quote: 'My quantum coffee intolerance was ruining my marriage. My wife kept saying I was "collapsing the wave function wrong." Thanks to QUANTUMIL, we observe together now.',
        avatar: '👨‍🔬',
      },
    ],
    disclaimer: 'QUANTUMIL is not for everyone. Do not take QUANTUMIL if you are allergic to QUANTUMIL or any of its ingredients, including paradoxonium, caffeinous extractum, or theoretical particles. Tell your doctor if you have ever experienced time loops, parallel universe syndrome, or worked at a physics lab.',
  },
  {
    id: 'scrollstop',
    name: 'SCROLLSTOP™',
    genericName: 'doomscrollium inhibitase',
    tagline: 'Put down the phone. Pick up your life.',
    condition: 'Chronic Doomscrolling Disorder (CDD)',
    description: 'SCROLLSTOP is a breakthrough treatment for adults suffering from the inability to stop scrolling through negative news, social media feeds, and comment sections despite knowing it makes them feel worse.',
    icon: '📱🛑',
    color: '#2D5A8A',
    dosage: 'Two tablets taken whenever you find yourself reading the comments section at 3 AM.',
    howItWorks: 'SCROLLSTOP contains a proprietary blend of ingredients that temporarily increases your awareness of time passing while reducing the dopamine hit from seeing notification badges, effectively breaking the scroll-reward cycle.',
    clinicalResults: [
      { stat: '83%', description: 'of patients reduced nightly scroll sessions by 2+ hours' },
      { stat: '67%', description: 'reported improved sleep quality' },
      { stat: '45%', description: 'actually finished a book they started' },
    ],
    sideEffects: {
      common: [
        'Sudden awareness of how much time you\'ve wasted',
        'Mild FOMO (Fear Of Missing Out)',
        'Urge to tell friends about articles they\'ve already read',
        'Increased eye contact during conversations',
      ],
      uncommon: [
        'Noticing sunlight exists',
        'Remembering hobbies you used to have',
        'Inability to follow drama threads',
        'Developing opinions without Twitter\'s help',
      ],
      rare: [
        'Complete phone separation anxiety',
        'Accidentally having deep thoughts',
        'Making plans and following through with them',
      ],
    },
    testimonials: [
      {
        name: 'Mike T.',
        age: 28,
        location: 'Brooklyn, NY',
        quote: 'I used to spend 6 hours a day scrolling through posts that made me angry. Now I only spend 4 hours, and I\'m less angry! Progress!',
        avatar: '👨‍💻',
      },
      {
        name: 'Jennifer R.',
        age: 31,
        location: 'Seattle, WA',
        quote: 'My screen time went from 9 hours to 7 hours daily. I\'ve started reading books again. Well, I\'ve started buying books again. Baby steps.',
        avatar: '👩‍🎨',
      },
    ],
    disclaimer: 'SCROLLSTOP should not be taken by social media managers, influencers, or anyone whose job requires them to know what\'s trending. Side effects may include temporary boredom and the realization that most online arguments don\'t matter.',
  },
  {
    id: 'procrasta-no',
    name: 'PROCRASTA-NO®',
    genericName: 'getitdonium chloride',
    tagline: 'Tomorrow called. It wants you to do it today.',
    condition: 'Chronic Task Avoidance Syndrome (CTAS)',
    description: 'PROCRASTA-NO is indicated for the treatment of moderate to severe procrastination in adults who have tried everything (making lists, setting alarms, promising themselves "just five more minutes" for the 47th time).',
    icon: '📋✅',
    color: '#3D8B37',
    dosage: 'Take one tablet when you notice you\'ve reorganized your desk three times instead of starting the actual work.',
    howItWorks: 'PROCRASTA-NO works by increasing executive function hormones while temporarily blocking the "but first let me just..." neural pathway. Results may vary based on how interesting your current distraction is.',
    clinicalResults: [
      { stat: '71%', description: 'of patients started tasks within 2 hours of planning to' },
      { stat: '58%', description: 'completed at least one thing on their to-do list per day' },
      { stat: '23%', description: 'stopped using this study to procrastinate and actually took action' },
    ],
    sideEffects: {
      common: [
        'Actually doing the thing',
        'Temporary loss of excuses',
        'Phantom deadline awareness',
        'Reduced Wikipedia rabbit hole diving',
      ],
      uncommon: [
        'Finishing projects early',
        'Unexpected productivity guilt',
        'Organizing without procrastinating organizing',
        'Reading emails when they arrive',
      ],
      rare: [
        'Becoming "that person" who has their life together',
        'Running out of things to do (extremely rare)',
        'Annoying friends with your newfound efficiency',
      ],
    },
    testimonials: [
      {
        name: 'Alex P.',
        age: 26,
        location: 'Chicago, IL',
        quote: 'I\'ve had "learn Spanish" on my to-do list for 7 years. Thanks to PROCRASTA-NO, I finally... bought a Spanish textbook. Hey, it\'s something!',
        avatar: '🧑‍🎓',
      },
      {
        name: 'Rachel W.',
        age: 38,
        location: 'Denver, CO',
        quote: 'My therapist recommended PROCRASTA-NO after I scheduled our session three times. I\'ve now only rescheduled once per month!',
        avatar: '👩‍⚕️',
      },
    ],
    disclaimer: 'Do not take PROCRASTA-NO if you are a creative professional who relies on panic-induced last-minute genius. Some procrastination may be necessary for mental health. Consult your doctor if you experience the urge to organize other people\'s lives.',
  },
  {
    id: 'nocturnil',
    name: 'NOCTURNIL™',
    genericName: 'sleepus actuallyum',
    tagline: 'Because 3 AM thoughts shouldn\'t win.',
    condition: 'Revenge Bedtime Procrastination Disorder (RBPD)',
    description: 'NOCTURNIL is for adults who stay up late reclaiming personal time they feel they didn\'t have during the day, even though they know they\'ll regret it in the morning. Every single time.',
    icon: '🌙😴',
    color: '#1E3A5F',
    dosage: 'One tablet at 10 PM, before you tell yourself "just one more episode."',
    howItWorks: 'NOCTURNIL suppresses the "I deserve this" justification center while boosting the "I have work tomorrow" awareness receptors. Does not interfere with actual relaxation, only revenge relaxation.',
    clinicalResults: [
      { stat: '76%', description: 'of patients went to bed before midnight more than twice per week' },
      { stat: '62%', description: 'stopped watching shows they weren\'t even enjoying' },
      { stat: '89%', description: 'woke up with fewer regrets about the night before' },
    ],
    sideEffects: {
      common: [
        'Going to bed at a reasonable hour',
        'Remembering what being well-rested feels like',
        'Morning person tendencies (temporary)',
        'Reduced need for afternoon coffee',
      ],
      uncommon: [
        'Waking up before your alarm',
        'Having energy for evening activities',
        'Actually wanting to eat breakfast',
        'Dreams instead of just passing out',
      ],
      rare: [
        'Becoming a morning person (reversible)',
        'Judgmental thoughts about night owls',
        'Excessive productivity before noon',
      ],
    },
    testimonials: [
      {
        name: 'Chris L.',
        age: 29,
        location: 'Miami, FL',
        quote: 'I used to stay up until 2 AM watching videos I didn\'t care about because "it\'s MY time." Now I go to bed at 11 and actually enjoy my mornings. Who knew?',
        avatar: '🧔',
      },
      {
        name: 'Priya S.',
        age: 33,
        location: 'San Francisco, CA',
        quote: 'My revenge bedtime procrastination was destroying my work performance. NOCTURNIL helped me realize I could have personal time AND sleep. Revolutionary.',
        avatar: '👩‍💼',
      },
    ],
    disclaimer: 'NOCTURNIL is not recommended for new parents, on-call workers, or anyone legitimately too busy during normal hours. If you experience sudden motivation to wake up at 5 AM to exercise, discontinue use and consult your doctor.',
  },
  {
    id: 'textbackia',
    name: 'TEXTBACKIA®',
    genericName: 'respondimus eventuallyum',
    tagline: 'Read it. Reply to it. Before it\'s weird.',
    condition: 'Selective Response Deficit Disorder (SRDD)',
    description: 'TEXTBACKIA is prescribed for adults who read messages immediately, compose perfect responses in their heads, and then forget to actually send them for days, weeks, or in severe cases, months.',
    icon: '💬✉️',
    color: '#5C6BC0',
    dosage: 'As needed, preferably before the "sorry for the late reply" becomes embarrassing.',
    howItWorks: 'TEXTBACKIA bridges the gap between "I should respond to this" and "actually responding to this" by reducing the perceived effort of typing and sending messages. Does not affect quality of responses.',
    clinicalResults: [
      { stat: '81%', description: 'of patients responded to messages within 24 hours' },
      { stat: '54%', description: 'stopped losing friendships over communication gaps' },
      { stat: '37%', description: 'actually called their mother back' },
    ],
    sideEffects: {
      common: [
        'Responding to messages in real-time',
        'Reduced "seen" guilt',
        'Improved relationships',
        'Fewer "you alive?" follow-up messages from friends',
      ],
      uncommon: [
        'Actually enjoying conversations',
        'Making plans and remembering them',
        'Being known as "reliable"',
        'Reduced anxiety about notification badges',
      ],
      rare: [
        'Over-responsiveness (replying too quickly)',
        'Running out of excuses for late replies',
        'Being asked to organize group chats',
      ],
    },
    testimonials: [
      {
        name: 'Tyler B.',
        age: 25,
        location: 'Nashville, TN',
        quote: 'I had 47 unread messages from friends I genuinely cared about. After TEXTBACKIA, I only have 12. I might even get to single digits someday.',
        avatar: '👨‍🎤',
      },
      {
        name: 'Maya J.',
        age: 30,
        location: 'Phoenix, AZ',
        quote: 'My best friend thought I was ghosting her. I was just... bad at phones. Thanks to TEXTBACKIA, she knows I\'m alive and still her friend.',
        avatar: '👩‍🦱',
      },
    ],
    disclaimer: 'TEXTBACKIA may not be suitable for those in toxic communication situations where delayed responses are a healthy boundary. Ask your doctor if responding immediately is right for your specific relationships.',
  },
]

// ============================================================================
// Components
// ============================================================================

export function VitalityRxSite({ siteId }: SiteProps) {
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [showSideEffects, setShowSideEffects] = useState(false)

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-3"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedMed(null)
              setShowSideEffects(false)
            }}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <span
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </span>
          </button>

          <nav className="flex items-center gap-6 text-sm">
            <Button variant="ghost" size="sm" textColor={site.theme.text}>
              Our Medications
            </Button>
            <Button variant="ghost" size="sm" textColor={site.theme.text}>
              For Healthcare Providers
            </Button>
            <Button variant="ghost" size="sm" textColor={site.theme.text}>
              Patient Resources
            </Button>
            <Button
              backgroundColor={site.theme.primary}
              textColor="white"
              variant="primary"
              size="sm"
            >
              Find a Doctor
            </Button>
          </nav>
        </div>
      </header>

      {selectedMed ? (
        <MedicationDetail
          medication={selectedMed}
          onBack={() => {
            setSelectedMed(null)
            setShowSideEffects(false)
          }}
          showSideEffects={showSideEffects}
          setShowSideEffects={setShowSideEffects}
        />
      ) : (
        <>
          {/* Hero */}
          <section
            className="py-16 px-6"
            style={{
              background: `linear-gradient(135deg, ${site.theme.primary}15 0%, ${site.theme.secondary}15 100%)`,
            }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1
                className="text-4xl font-light mb-4"
                style={{ color: site.theme.text }}
              >
                Medications for the Modern Age
              </h1>
              <p
                className="text-lg mb-8"
                style={{ color: site.theme.textMuted }}
              >
                Because you deserve treatments as unique as the problems you didn't know you had.
              </p>
              <div
                className="inline-block px-6 py-3 rounded-lg text-sm"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                💊 Ask your doctor if our medications are right for you
              </div>
            </div>
          </section>

          {/* Medications Grid */}
          <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <h2
                className="text-2xl font-light text-center mb-8"
                style={{ color: site.theme.text }}
              >
                Our Breakthrough Treatments
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MEDICATIONS.map((med) => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onClick={() => setSelectedMed(med)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Trust Banner */}
          <section
            className="py-12 px-6"
            style={{ background: site.theme.surface }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center gap-12 mb-6">
                <div>
                  <p className="text-3xl font-bold" style={{ color: site.theme.primary }}>
                    5M+
                  </p>
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Patients Treated
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: site.theme.primary }}>
                    23
                  </p>
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Years of Innovation
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: site.theme.primary }}>
                    147
                  </p>
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Countries Served
                  </p>
                </div>
              </div>
              <p style={{ color: site.theme.textMuted }}>
                Trusted by doctors, tolerated by insurance companies, questioned by your friends.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 px-6">
            <div
              className="max-w-2xl mx-auto text-center p-8 rounded-2xl"
              style={{ background: site.theme.primary }}
            >
              <h2 className="text-2xl font-light text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-white/80 mb-6">
                Talk to your healthcare provider about whether VitalityRx medications might be right for you.
                Or just keep scrolling. We're not your mom.
              </p>
              <Button
                backgroundColor="white"
                textColor={site.theme.primary}
                variant="primary"
                size="lg"
              >
                Find a Provider Near You
              </Button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center text-xs"
        style={{
          background: site.theme.surface,
          borderTop: `1px solid ${site.theme.border}`,
          color: site.theme.textMuted,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">
            All medications, conditions, and clinical results on this website are fictional and for entertainment purposes only.
            This is not real medical advice. Please consult an actual healthcare provider for real medical concerns.
          </p>
          <p className="mb-4">
            © 2024 VitalityRx Pharmaceuticals, Inc. All rights reserved.
            VitalityRx, QUANTUMIL, SCROLLSTOP, PROCRASTA-NO, NOCTURNIL, and TEXTBACKIA are registered trademarks
            of VitalityRx Pharmaceuticals, Inc.
          </p>
          <div className="flex justify-center gap-6">
            <button className="hover:underline">Privacy Policy</button>
            <button className="hover:underline">Terms of Use</button>
            <button className="hover:underline">Contact Us</button>
            <button className="hover:underline">Careers</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Medication Card Component
// ============================================================================

interface MedicationCardProps {
  medication: Medication
  onClick: () => void
}

function MedicationCard({ medication, onClick }: MedicationCardProps) {
  return (
    <StyledCard
      onClick={onClick}
      bgColor={site.theme.surface}
      borderColor={site.theme.border}
      textColor={site.theme.text}
      padding="lg"
      borderRadius="lg"
      shadow="md"
      interactive
      className="text-left cursor-pointer hover:shadow-lg"
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${medication.color}20` }}
        >
          {medication.icon}
        </div>
        <div>
          <h3
            className="text-lg font-bold"
            style={{ color: medication.color }}
          >
            {medication.name}
          </h3>
          <p
            className="text-xs italic"
            style={{ color: site.theme.textMuted }}
          >
            ({medication.genericName})
          </p>
        </div>
      </div>

      <p className="text-sm font-medium mb-2">
        {medication.tagline}
      </p>

      <p
        className="text-sm mb-4"
        style={{ color: site.theme.textMuted }}
      >
        For {medication.condition}
      </p>

      <span
        className="text-sm font-medium"
        style={{ color: site.theme.primary }}
      >
        Learn more →
      </span>
    </StyledCard>
  )
}

// ============================================================================
// Medication Detail Component
// ============================================================================

interface MedicationDetailProps {
  medication: Medication
  onBack: () => void
  showSideEffects: boolean
  setShowSideEffects: (v: boolean) => void
}

function MedicationDetail({ medication, onBack, showSideEffects, setShowSideEffects }: MedicationDetailProps) {
  return (
    <div>
      {/* Hero */}
      <section
        className="py-16 px-6"
        style={{
          background: `linear-gradient(135deg, ${medication.color}15 0%, ${medication.color}05 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={onBack}
            variant="link"
            size="sm"
            textColor={site.theme.primary}
            className="mb-6"
          >
            ← Back to all medications
          </Button>

          <div className="flex items-start gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0"
              style={{ background: site.theme.surface }}
            >
              {medication.icon}
            </div>
            <div>
              <h1
                className="text-4xl font-bold mb-1"
                style={{ color: medication.color }}
              >
                {medication.name}
              </h1>
              <p
                className="text-lg italic mb-4"
                style={{ color: site.theme.textMuted }}
              >
                ({medication.genericName})
              </p>
              <p
                className="text-xl font-light"
                style={{ color: site.theme.text }}
              >
                {medication.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* What it treats */}
          <div className="mb-12">
            <h2
              className="text-2xl font-light mb-4"
              style={{ color: site.theme.text }}
            >
              What is {medication.name}?
            </h2>
            <p className="text-lg mb-4" style={{ color: site.theme.text }}>
              {medication.description}
            </p>
            <div
              className="p-4 rounded-lg"
              style={{ background: `${medication.color}10`, border: `1px solid ${medication.color}30` }}
            >
              <p className="font-medium" style={{ color: medication.color }}>
                Indicated for: {medication.condition}
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-12">
            <h2
              className="text-2xl font-light mb-4"
              style={{ color: site.theme.text }}
            >
              How Does It Work?
            </h2>
            <p style={{ color: site.theme.text }}>
              {medication.howItWorks}
            </p>
          </div>

          {/* Dosage */}
          <div className="mb-12">
            <h2
              className="text-2xl font-light mb-4"
              style={{ color: site.theme.text }}
            >
              Dosage Information
            </h2>
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              textColor={site.theme.text}
              padding="lg"
              borderRadius="lg"
              shadow="sm"
            >
              <p className="text-lg">💊 {medication.dosage}</p>
            </StyledCard>
          </div>

          {/* Clinical Results */}
          <div className="mb-12">
            <h2
              className="text-2xl font-light mb-4"
              style={{ color: site.theme.text }}
            >
              Clinical Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {medication.clinicalResults.map((result, i) => (
                <StyledCard
                  key={i}
                  bgColor={site.theme.surface}
                  borderColor={site.theme.border}
                  textColor={site.theme.text}
                  padding="lg"
                  borderRadius="lg"
                  shadow="sm"
                  className="text-center"
                >
                  <p
                    className="text-4xl font-bold mb-2"
                    style={{ color: medication.color }}
                  >
                    {result.stat}
                  </p>
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    {result.description}
                  </p>
                </StyledCard>
              ))}
            </div>
            <p
              className="mt-4 text-xs text-center"
              style={{ color: site.theme.textMuted }}
            >
              Results from a 12-week, double-blind, placebo-controlled, completely made-up clinical trial.
            </p>
          </div>

          {/* Testimonials */}
          <div className="mb-12">
            <h2
              className="text-2xl font-light mb-4"
              style={{ color: site.theme.text }}
            >
              Patient Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medication.testimonials.map((testimonial, i) => (
                <StyledCard
                  key={i}
                  bgColor={site.theme.surface}
                  borderColor={site.theme.border}
                  textColor={site.theme.text}
                  padding="lg"
                  borderRadius="lg"
                  shadow="sm"
                >
                  <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      initials={testimonial.name[0]}
                      bgColor={medication.color}
                    />
                    <div>
                      <p className="font-medium">
                        {testimonial.name}, {testimonial.age}
                      </p>
                      <p className="text-sm" style={{ color: site.theme.textMuted }}>
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </StyledCard>
              ))}
            </div>
            <p
              className="mt-4 text-xs text-center"
              style={{ color: site.theme.textMuted }}
            >
              Individual results may vary. These testimonials are fictional.
            </p>
          </div>

          {/* Side Effects */}
          <div className="mb-12">
            <h2
              className="text-2xl font-light mb-4"
              style={{ color: site.theme.text }}
            >
              Important Safety Information
            </h2>

            <StyledCard
              onClick={() => setShowSideEffects(!showSideEffects)}
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              textColor={site.theme.text}
              padding="md"
              borderRadius="lg"
              shadow="sm"
              interactive
              className="w-full text-left flex items-center justify-between mb-4"
            >
              <span className="font-medium">View Side Effects</span>
              <span style={{ color: site.theme.textMuted }}>
                {showSideEffects ? '▲' : '▼'}
              </span>
            </StyledCard>

            {showSideEffects && (
              <StyledCard
                bgColor={site.theme.surface}
                borderColor={site.theme.border}
                textColor={site.theme.text}
                padding="lg"
                borderRadius="lg"
                shadow="sm"
                className="space-y-6"
              >
                <div>
                  <h4 className="font-medium mb-2" style={{ color: site.theme.text }}>
                    Common Side Effects
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: site.theme.textMuted }}>
                    {medication.sideEffects.common.map((effect, i) => (
                      <li key={i}>{effect}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2" style={{ color: site.theme.text }}>
                    Uncommon Side Effects
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: site.theme.textMuted }}>
                    {medication.sideEffects.uncommon.map((effect, i) => (
                      <li key={i}>{effect}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2" style={{ color: '#c41e3a' }}>
                    Rare But Serious Side Effects
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: '#c41e3a' }}>
                    {medication.sideEffects.rare.map((effect, i) => (
                      <li key={i}>{effect}</li>
                    ))}
                  </ul>
                </div>
              </StyledCard>
            )}

            {/* Disclaimer */}
            <StyledCard
              bgColor="#FEF3C7"
              borderColor="#F59E0B"
              textColor="#92400E"
              padding="md"
              borderRadius="lg"
              shadow="sm"
              className="mt-6 text-sm"
            >
              <p className="font-medium mb-2">⚠️ Important</p>
              <p>{medication.disclaimer}</p>
            </StyledCard>
          </div>

          {/* CTA */}
          <div
            className="p-8 rounded-2xl text-center"
            style={{ background: medication.color }}
          >
            <h3 className="text-2xl font-light text-white mb-4">
              Think {medication.name} might be right for you?
            </h3>
            <p className="text-white/80 mb-6">
              Talk to your healthcare provider about your symptoms and treatment options.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                backgroundColor="white"
                textColor={medication.color}
                variant="primary"
                size="lg"
              >
                Find a Doctor
              </Button>
              <Button
                variant="outline"
                borderColor="white"
                textColor="white"
                size="lg"
              >
                Download Patient Guide
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VitalityRxSite
