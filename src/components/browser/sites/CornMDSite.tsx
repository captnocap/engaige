/**
 * CornMD Site
 *
 * A WebMD parody that diagnoses everything as corn-related.
 * Features a symptom checker, condition articles, drug interactions,
 * and an "Ask a Doctor" section. Every diagnosis connects back to corn.
 *
 * Lore connections:
 * - VitalityRx QUANTUMIL for Quantum Coffee issues
 * - GrainTruth for corn conspiracy content (links to CSPS)
 * - Hartwell Building for workplace-related conditions
 * - Trust Fall Tim for trust fall trauma (TFIV)
 * - CobCoin for crypto depression
 * - Derek and the Martinez Study for quantum coffee
 *
 * The number 847 appears throughout as the game's running gag.
 * "If symptoms persist, consult your local corn farmer." is the tagline.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button, Avatar } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.cornmd

// ============================================================================
// Types
// ============================================================================

interface Symptom {
  id: string
  name: string
  category: string
}

interface Diagnosis {
  condition: string
  likelihood: string
  cornConnection: string
  recommendation: string
}

interface PatientComment {
  name: string
  age: number
  rating: number
  comment: string
  helpful: number
}

interface Condition {
  id: string
  name: string
  icdCode: string
  prevalence: string
  summary: string
  symptoms: string[]
  causes: string[]
  treatments: string[]
  drugInteractions: string[]
  sideEffects: string[]
  patientComments: PatientComment[]
}

// ============================================================================
// Data - Symptoms and Diagnoses
// ============================================================================

const SYMPTOMS: Symptom[] = [
  { id: 'fatigue', name: 'Fatigue', category: 'General' },
  { id: 'headache', name: 'Headache', category: 'Neurological' },
  { id: 'anxiety', name: 'Anxiety', category: 'Mental Health' },
  { id: 'insomnia', name: 'Insomnia', category: 'Sleep' },
  { id: 'dizziness', name: 'Dizziness', category: 'Neurological' },
  { id: 'nausea', name: 'Nausea', category: 'Digestive' },
  { id: 'vision', name: 'Visual Disturbances', category: 'Neurological' },
  { id: 'paranoia', name: 'Paranoia', category: 'Mental Health' },
  { id: 'depression', name: 'Depression', category: 'Mental Health' },
  { id: 'trust', name: 'Trust Issues', category: 'Psychological' },
]

// Each symptom maps to potential corn-related diagnoses
const DIAGNOSES: Record<string, Diagnosis[]> = {
  fatigue: [
    { condition: 'Corn Syrup Metabolic Syndrome', likelihood: '87%', cornConnection: 'Processing 847% more corn-derived sugars than optimal', recommendation: 'Reduce HFCS intake. Ask about CORNAZOL.' },
    { condition: 'Quantum Caffeine Hypersensitivity', likelihood: '73%', cornConnection: 'Quantum coffee beans grown in corn-adjacent fields', recommendation: 'Switch to non-quantum beverages. Ask about QUANTUMIL from VitalityRx.' },
  ],
  headache: [
    { condition: 'Corn Pollen Neural Inflammation', likelihood: '91%', cornConnection: 'Airborne corn particulates detected in 847/1000 urban areas', recommendation: 'Install HEPA filters. Consider COBCAPS for relief.' },
    { condition: 'Temporal Displacement Anxiety', likelihood: '64%', cornConnection: 'Common in buildings constructed on former cornfields', recommendation: 'Avoid floors 7-14. Consult a temporal physician.' },
  ],
  anxiety: [
    { condition: 'Corn Syrup Paranoia Syndrome', likelihood: '89%', cornConnection: 'The feeling that corn is controlling your mind may be valid', recommendation: 'Visit GrainTruth.corn for peer support. Consider HUSKANIL.' },
    { condition: 'Big Corn Awareness Disorder', likelihood: '76%', cornConnection: 'Recognition that 84.7% of processed foods contain corn derivatives', recommendation: 'Acceptance therapy. Knowledge is the first symptom.' },
  ],
  insomnia: [
    { condition: 'Corn-Based Sleep Disruption', likelihood: '82%', cornConnection: 'Evening corn consumption triggers maize-induced wakefulness', recommendation: 'No corn products after 7 PM. Ask about SLUMBERCOB.' },
    { condition: 'Cryptocurrency Anxiety Syndrome', likelihood: '68%', cornConnection: 'CobCoin portfolio stress activates corn-adjacent worry centers', recommendation: 'Diversify into non-corn cryptocurrencies. Consider PORTFOLEASE.' },
  ],
  dizziness: [
    { condition: 'Trust Fall Induced Vertigo', likelihood: '94%', cornConnection: 'Corn-based exercise mats release destabilizing particles', recommendation: 'Limit trust falls to 847 per month. See TFIV specialist.' },
    { condition: 'Floor 13 Spatial Disorientation', likelihood: '71%', cornConnection: 'The missing floor creates corn-frequency interference', recommendation: 'Avoid Hartwell Building. Take stairs when possible.' },
  ],
  nausea: [
    { condition: 'High Fructose Rejection Response', likelihood: '88%', cornConnection: 'Your body is finally recognizing corn syrup as an invader', recommendation: 'Transition to cane sugar. Ask about ANTIFRUCTASE.' },
  ],
  vision: [
    { condition: 'Parallel Timeline Perception Disorder', likelihood: '86%', cornConnection: 'Quantum coffee from corn-belt regions causes temporal vision', recommendation: 'Stop drinking quantum coffee. QUANTUMIL from VitalityRx may help.' },
  ],
  paranoia: [
    { condition: 'Corn Syrup Paranoia Syndrome', likelihood: '96%', cornConnection: 'The corn IS watching. This is medically documented.', recommendation: 'Join support groups at GrainTruth.corn. HUSKANIL for acute episodes.' },
  ],
  depression: [
    { condition: 'Crypto Portfolio Depression', likelihood: '92%', cornConnection: 'CobCoin losses affect 847% more investors than traditional corn futures', recommendation: 'Financial counseling. PORTFOLEASE for acute symptoms.' },
    { condition: 'Corn Truth Awakening Despair', likelihood: '88%', cornConnection: 'Realizing corn controls 84.7% of the food supply causes existential dread', recommendation: 'Peer support at GrainTruth.corn. Remember: knowledge is power.' },
  ],
  trust: [
    { condition: 'Trust Fall Induced Trust Deficit', likelihood: '95%', cornConnection: 'Being dropped during trust falls damages corn-fiber neural connections', recommendation: 'Gradual trust rebuilding exercises. Ask about TRUSTAZOL.' },
  ],
}

// ============================================================================
// Data - Medical Conditions with full article content
// ============================================================================


// ============================================================================
// Data - Ask a Doctor responses
// ============================================================================

const DOCTOR_RESPONSES = [
  { question: 'Is it normal to crave corn?', answer: 'Corn cravings affect 847 million people worldwide. Your body may be signaling corn syrup dependency. Consider a gradual reduction program and ask your doctor about COBAWAY.' },
  { question: 'Can corn allergies develop suddenly?', answer: 'Yes. Corn Sensitivity Awakening (CSA) can occur at any age, often triggered by reading ingredient labels for the first time. 847 out of 1000 adults have latent corn sensitivity.' },
  { question: 'Is quantum coffee safe?', answer: 'Quantum coffee is generally safe when consumed in classical quantities. Exceeding 3 cups daily may cause Quantum Caffeine Hypersensitivity. Ask about QUANTUMIL from VitalityRx.' },
  { question: 'Why do I see corn everywhere?', answer: 'This may be Corn Syrup Paranoia Syndrome (CSPS). Alternatively, you may simply be observant. 84.7% of processed foods contain corn derivatives. Your perception may be accurate.' },
]

// ============================================================================
// Data - Drug interactions (for the Drug Interactions checker)
// ============================================================================

const DRUGS = [
  { name: 'QUANTUMIL', generic: 'caffeinous observatum', interactions: ['HUSKANIL', 'SLUMBERCOB', 'Quantum Coffee'] },
  { name: 'HUSKANIL', generic: 'maizeum blocker', interactions: ['QUANTUMIL', 'CHRONOCOB', 'High fructose corn syrup'] },
  { name: 'PORTFOLEASE', generic: 'lossium acceptum', interactions: ['PROCRASTA-NO', 'CobCoin (any amount)'] },
  { name: 'TRUSTAZOL', generic: 'faithium carbonate', interactions: ['Alcohol', 'COBFLEX', 'Trust exercises'] },
  { name: 'CHRONOCOB', generic: 'temporalis maizeus', interactions: ['FLOOREASE', 'Elevator travel', 'Floor 7 mirrors'] },
]

// ============================================================================
// DB Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Condition interface.
 * Uses metadata for condition-specific fields like icdCode, prevalence, treatments, etc.
 */
function dbToCondition(item: SiteContentItem): Condition {
  const m = item.metadata || {}
  return {
    id: item.slug,
    name: item.title,
    icdCode: m.icdCode ?? m.icd_code ?? 'UNK-000',
    prevalence: m.prevalence ?? item.subtitle ?? '',
    summary: item.body ?? item.summary ?? '',
    symptoms: Array.isArray(m.symptoms) ? m.symptoms : [],
    causes: Array.isArray(m.causes) ? m.causes : [],
    treatments: Array.isArray(m.treatments) ? m.treatments : [],
    drugInteractions: Array.isArray(m.drugInteractions ?? m.drug_interactions) ? (m.drugInteractions ?? m.drug_interactions) : [],
    sideEffects: Array.isArray(m.sideEffects ?? m.side_effects) ? (m.sideEffects ?? m.side_effects) : [],
    patientComments: Array.isArray(m.patientComments ?? m.patient_comments) ? (m.patientComments ?? m.patient_comments) : [],
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function CornMDSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('cornmd')
  const conditions = useMemo(() => dbContent.map(dbToCondition), [dbContent])

  const [view, setView] = useState<'home' | 'checker' | 'condition' | 'drugs' | 'ask'>('home')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null)
  const [askQuestion, setAskQuestion] = useState('')
  const [askResponse, setAskResponse] = useState<string | null>(null)

  // Toggle symptom selection
  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    setShowDiagnosis(false)
  }

  // Get diagnoses based on selected symptoms (deduplicated)
  const getDiagnoses = () => {
    const results: Diagnosis[] = []
    selectedSymptoms.forEach(id => {
      DIAGNOSES[id]?.forEach(d => {
        if (!results.find(x => x.condition === d.condition)) results.push(d)
      })
    })
    return results.slice(0, 5)
  }

  // Handle Ask a Doctor submission
  const handleAsk = () => {
    const match = DOCTOR_RESPONSES.find(r =>
      r.question.toLowerCase().split(' ').some(w => askQuestion.toLowerCase().includes(w))
    )
    setAskResponse(match?.answer ||
      'Based on your question, we recommend checking for corn-related causes. 847 out of 1000 patients find their symptoms are connected to corn consumption or exposure. If symptoms persist, consult your local corn farmer.')
  }

  const th = site?.theme

  return (
    <div className="min-h-full" style={{ background: th?.background || '#f8fafc' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4" style={{ background: th?.surface || '#fff', borderBottom: `2px solid ${th?.primary || '#1E40AF'}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => { setView('home'); setSelectedCondition(null); setShowDiagnosis(false) }} className="flex items-center gap-2 hover:opacity-80">
            <span className="text-3xl">🌽</span>
            <div>
              <span className="text-2xl font-bold" style={{ color: th?.primary }}>CornMD</span>
              <span className="text-xs block" style={{ color: th?.textMuted }}>Trusted Corn Health Information</span>
            </div>
          </button>
          <nav className="flex items-center gap-4 text-sm">
            <Button variant="ghost" size="sm" textColor={th?.text} onClick={() => setView('checker')}>Symptom Checker</Button>
            <Button variant="ghost" size="sm" textColor={th?.text} onClick={() => setView('drugs')}>Drug Interactions</Button>
            <Button variant="ghost" size="sm" textColor={th?.text} onClick={() => setView('ask')}>Ask a Doctor</Button>
            <Button backgroundColor={th?.primary} textColor="white" variant="primary" size="sm">Find Corn Specialist</Button>
          </nav>
        </div>
      </header>

      {/* Main Content - Routes to different views */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === 'home' && !selectedCondition && (
          <HomeView onChecker={() => setView('checker')} onCondition={(c) => { setSelectedCondition(c); setView('condition') }} th={th} />
        )}
        {view === 'checker' && (
          <CheckerView symptoms={SYMPTOMS} selected={selectedSymptoms} toggle={toggleSymptom} showDiag={showDiagnosis} check={() => setShowDiagnosis(true)} diagnoses={getDiagnoses()} onCondition={(n) => { const c = conditions.find(x => x.name === n); if (c) { setSelectedCondition(c); setView('condition') } }} th={th} />
        )}
        {view === 'condition' && selectedCondition && (
          <ConditionView c={selectedCondition} back={() => { setSelectedCondition(null); setView('home') }} th={th} />
        )}
        {view === 'drugs' && <DrugsView th={th} />}
        {view === 'ask' && <AskView q={askQuestion} setQ={setAskQuestion} submit={handleAsk} res={askResponse} th={th} />}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs" style={{ background: th?.surface, borderTop: `1px solid ${th?.border}`, color: th?.textMuted }}>
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">CornMD provides general corn-related health information and is not a substitute for professional medical advice. Always consult a licensed corn specialist for diagnosis and treatment.</p>
          <p className="mb-4 font-bold" style={{ color: th?.accent }}>847 out of 1000 patients trust CornMD for their corn health needs.</p>
          <p className="mb-4">If symptoms persist, consult your local corn farmer.</p>
          <p>Copyright 2026 CornMD, LLC. All rights reserved. CornMD is not affiliated with Big Corn (that we are allowed to disclose).</p>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Home View Component
// ============================================================================

function HomeView({ onChecker, onCondition, th }: { onChecker: () => void; onCondition: (c: Condition) => void; th: any }) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="rounded-xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${th?.primary}15, ${th?.accent}15)` }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: th?.text }}>Your Symptoms. Our Corn Expertise.</h1>
        <p className="text-lg mb-6" style={{ color: th?.textMuted }}>847 out of 1000 health conditions have corn-related causes. Find out if yours does.</p>
        <Button backgroundColor={th?.primary} textColor="white" variant="primary" size="lg" onClick={onChecker}>Start Symptom Checker</Button>
      </section>

      {/* Featured Conditions Grid */}
      <section>
        <h2 className="text-xl font-bold mb-4" style={{ color: th?.text }}>Featured Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conditions.map(c => (
            <StyledCard key={c.id} onClick={() => onCondition(c)} bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="md" borderRadius="lg" shadow="md" interactive className="cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌽</span>
                <div>
                  <h3 className="font-bold text-sm mb-1">{c.name}</h3>
                  <p className="text-xs" style={{ color: th?.textMuted }}>ICD Code: {c.icdCode}</p>
                  <p className="text-xs mt-1" style={{ color: th?.textMuted }}>{c.prevalence}</p>
                </div>
              </div>
            </StyledCard>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="rounded-xl p-6" style={{ background: th?.surface, border: `1px solid ${th?.border}` }}>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold" style={{ color: th?.primary }}>847M+</p>
            <p className="text-sm" style={{ color: th?.textMuted }}>Patients with corn-related conditions</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: th?.primary }}>84.7%</p>
            <p className="text-sm" style={{ color: th?.textMuted }}>Of processed foods contain corn</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: th?.primary }}>100%</p>
            <p className="text-sm" style={{ color: th?.textMuted }}>Of our diagnoses are corn-related</p>
          </div>
        </div>
      </section>

      {/* VitalityRx Advertisement */}
      <section className="rounded-xl p-6" style={{ background: `linear-gradient(135deg, #2563EB15, #10B98115)`, border: `2px solid #2563EB40` }}>
        <div className="flex items-center gap-6">
          <div className="text-5xl">💊</div>
          <div className="flex-1">
            <p className="text-xs font-bold mb-1" style={{ color: '#2563EB' }}>ADVERTISEMENT</p>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1e293b' }}>Ask Your Doctor About QUANTUMIL</h3>
            <p className="text-sm" style={{ color: '#64748b' }}>From VitalityRx - For Quantum Coffee Intolerance Syndrome. Because your morning deserves to be observed.</p>
          </div>
          <Button backgroundColor="#2563EB" textColor="white" variant="primary" size="sm">Learn More</Button>
        </div>
      </section>
    </div>
  )
}

// ============================================================================
// Symptom Checker View Component
// ============================================================================

function CheckerView({ symptoms, selected, toggle, showDiag, check, diagnoses, onCondition, th }: { symptoms: Symptom[]; selected: string[]; toggle: (id: string) => void; showDiag: boolean; check: () => void; diagnoses: Diagnosis[]; onCondition: (n: string) => void; th: any }) {
  const categories = [...new Set(symptoms.map(s => s.category))]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: th?.text }}>Corn Symptom Checker</h1>
        <p style={{ color: th?.textMuted }}>Select your symptoms to receive your corn-related diagnosis</p>
      </div>

      {/* Symptom Selection Card */}
      <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
        <h2 className="text-lg font-bold mb-4">Select Your Symptoms</h2>
        {categories.map(cat => (
          <div key={cat} className="mb-4">
            <h3 className="text-sm font-medium mb-2" style={{ color: th?.textMuted }}>{cat}</h3>
            <div className="flex flex-wrap gap-2">
              {symptoms.filter(s => s.category === cat).map(s => (
                <button key={s.id} onClick={() => toggle(s.id)} className="px-3 py-1.5 rounded-full text-sm transition-colors" style={{ background: selected.includes(s.id) ? th?.primary : th?.background, color: selected.includes(s.id) ? 'white' : th?.text, border: `1px solid ${selected.includes(s.id) ? th?.primary : th?.border}` }}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: th?.border }}>
          <Button backgroundColor={th?.primary} textColor="white" variant="primary" onClick={check} disabled={!selected.length}>
            Check Symptoms ({selected.length} selected)
          </Button>
        </div>
      </StyledCard>

      {/* Diagnosis Results */}
      {showDiag && diagnoses.length > 0 && (
        <StyledCard bgColor={th?.surface} borderColor={th?.accent} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌽</span>
            <h2 className="text-lg font-bold">Your Possible Diagnoses</h2>
          </div>
          <div className="space-y-3">
            {diagnoses.map((d, i) => (
              <div key={i} className="p-4 rounded-lg cursor-pointer hover:opacity-90" style={{ background: th?.background }} onClick={() => onCondition(d.condition)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold" style={{ color: th?.primary }}>{d.condition}</h3>
                  <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ background: `${th?.primary}20`, color: th?.primary }}>{d.likelihood} likely</span>
                </div>
                <p className="text-sm mb-1" style={{ color: th?.textMuted }}><strong>Corn Connection:</strong> {d.cornConnection}</p>
                <p className="text-sm" style={{ color: th?.text }}><strong>Recommendation:</strong> {d.recommendation}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg text-center" style={{ background: `${th?.accent}20` }}>
            <p className="text-sm font-medium" style={{ color: th?.text }}>If symptoms persist, consult your local corn farmer.</p>
          </div>
        </StyledCard>
      )}
    </div>
  )
}

// ============================================================================
// Condition Article View Component
// ============================================================================

function ConditionView({ c, back, th }: { c: Condition; back: () => void; th: any }) {
  // Reusable section component for condition details
  const Section = ({ title, items, icon, iconColor }: { title: string; items: string[]; icon: string; iconColor: string }) => (
    <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md" className="mb-4">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span style={{ color: iconColor }}>{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </StyledCard>
  )

  return (
    <div className="space-y-4">
      <Button variant="link" size="sm" textColor={th?.primary} onClick={back}>Back to conditions</Button>

      {/* Header Card */}
      <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🌽</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{c.name}</h1>
            <p className="text-sm" style={{ color: th?.textMuted }}>ICD Code: {c.icdCode} | Prevalence: {c.prevalence}</p>
          </div>
        </div>
        <p className="mt-4">{c.summary}</p>
      </StyledCard>

      <Section title="Symptoms" items={c.symptoms} icon="-" iconColor={th?.accent} />
      <Section title="Causes" items={c.causes} icon="-" iconColor={th?.primary} />
      <Section title="Treatments" items={c.treatments} icon="+" iconColor="#10B981" />

      {/* Drug Interactions Warning Card */}
      <StyledCard bgColor="#FEF3C720" borderColor={th?.accent} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md" className="mb-4">
        <h2 className="text-lg font-bold mb-4" style={{ color: th?.accent }}>Drug Interactions</h2>
        <ul className="space-y-2">
          {c.drugInteractions.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span style={{ color: '#DC2626' }}>!</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </StyledCard>

      <Section title="Possible Side Effects of Treatment" items={c.sideEffects} icon="-" iconColor={th?.textMuted} />

      {/* Patient Comments */}
      <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
        <h2 className="text-lg font-bold mb-4">Patient Comments ({c.patientComments.length})</h2>
        <div className="space-y-4">
          {c.patientComments.map((p, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ background: th?.background }}>
              <div className="flex items-center gap-3 mb-2">
                <Avatar size="sm" initials={p.name[0]} bgColor={th?.primary} />
                <div>
                  <p className="font-medium text-sm">{p.name}, {p.age}</p>
                  <div className="flex">{[...Array(5)].map((_, j) => <span key={j} style={{ color: j < p.rating ? th?.accent : '#ddd' }}>*</span>)}</div>
                </div>
              </div>
              <p className="text-sm mb-2">"{p.comment}"</p>
              <p className="text-xs" style={{ color: th?.textMuted }}>{p.helpful} people found this helpful</p>
            </div>
          ))}
        </div>
      </StyledCard>

      {/* Footer reminder */}
      <div className="text-center p-4 rounded-lg" style={{ background: `${th?.accent}20` }}>
        <p className="text-sm font-medium">If symptoms persist, consult your local corn farmer.</p>
      </div>
    </div>
  )
}

// ============================================================================
// Drug Interactions View Component
// ============================================================================

function DrugsView({ th }: { th: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: th?.text }}>Drug Interactions Checker</h1>
        <p style={{ color: th?.textMuted }}>Check for corn-related pharmaceutical interactions</p>
      </div>

      {/* VitalityRx Feature */}
      <StyledCard bgColor="#2563EB10" borderColor="#2563EB" textColor="#1e293b" padding="lg" borderRadius="lg" shadow="md">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">💊</span>
          <div>
            <p className="text-xs font-bold" style={{ color: '#2563EB' }}>FEATURED PARTNER</p>
            <h2 className="text-xl font-bold">VitalityRx Pharmaceuticals</h2>
            <p className="text-sm" style={{ color: '#64748b' }}>Medications for the Modern Age - Including corn-related treatments</p>
          </div>
        </div>
        <p className="text-sm mb-4">VitalityRx offers QUANTUMIL for Quantum Coffee Intolerance Syndrome. Ask your doctor if QUANTUMIL is right for you. 847 out of 1000 patients report improved quantum coffee tolerance.</p>
        <Button backgroundColor="#2563EB" textColor="white" variant="primary" size="sm">Visit VitalityRx.corn</Button>
      </StyledCard>

      {/* Drug List */}
      <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
        <h2 className="text-lg font-bold mb-4">Corn-Related Medications</h2>
        <div className="space-y-4">
          {DRUGS.map((d, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ background: th?.background }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: th?.primary }}>{d.name}</h3>
                  <p className="text-xs italic" style={{ color: th?.textMuted }}>({d.generic})</p>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{ background: '#FEF3C7', color: '#92400E' }}>Corn-based</span>
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: '#DC2626' }}>Known Interactions:</p>
              <div className="flex flex-wrap gap-1">
                {d.interactions.map((int, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 rounded" style={{ background: '#FEE2E2', color: '#991B1B' }}>{int}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </StyledCard>

      {/* Warning */}
      <StyledCard bgColor="#FEF3C7" borderColor="#F59E0B" textColor="#92400E" padding="md" borderRadius="lg" shadow="md">
        <div className="flex items-start gap-3">
          <span className="text-xl">!</span>
          <div>
            <p className="font-bold mb-1">Important Safety Information</p>
            <p className="text-sm">All medications listed contain corn-derived ingredients. Check with your corn specialist before combining treatments. 847 out of 1000 drug interactions involve corn derivatives.</p>
          </div>
        </div>
      </StyledCard>
    </div>
  )
}

// ============================================================================
// Ask a Doctor View Component
// ============================================================================

function AskView({ q, setQ, submit, res, th }: { q: string; setQ: (s: string) => void; submit: () => void; res: string | null; th: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: th?.text }}>Ask a Corn Doctor</h1>
        <p style={{ color: th?.textMuted }}>Get expert answers about corn-related health concerns</p>
      </div>

      {/* Doctor Info and Question Input */}
      <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
        <div className="flex items-center gap-3 mb-4">
          <Avatar size="lg" initials="MD" bgColor={th?.primary} />
          <div>
            <p className="font-bold">Dr. Cornelius Husk, MD</p>
            <p className="text-sm" style={{ color: th?.textMuted }}>Board Certified Corn Specialist | 847 years combined experience</p>
          </div>
        </div>
        <div className="space-y-4">
          <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about corn-related symptoms, treatments, or concerns..." className="w-full p-3 rounded-lg text-sm" style={{ background: th?.background, border: `1px solid ${th?.border}`, color: th?.text, minHeight: '100px' }} />
          <Button backgroundColor={th?.primary} textColor="white" variant="primary" onClick={submit} disabled={!q.trim()}>Submit Question</Button>
        </div>
      </StyledCard>

      {/* Response */}
      {res && (
        <StyledCard bgColor={th?.surface} borderColor={th?.accent} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🌽</span>
            <div>
              <p className="font-bold mb-1">Dr. Husk's Response</p>
              <p className="text-sm">{res}</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg text-center" style={{ background: `${th?.accent}20` }}>
            <p className="text-xs" style={{ color: th?.textMuted }}>This response is for informational purposes only. If symptoms persist, consult your local corn farmer.</p>
          </div>
        </StyledCard>
      )}

      {/* FAQ */}
      <StyledCard bgColor={th?.surface} borderColor={th?.border} textColor={th?.text} padding="lg" borderRadius="lg" shadow="md">
        <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {DOCTOR_RESPONSES.map((item, i) => (
            <button key={i} onClick={() => setQ(item.question)} className="w-full text-left p-3 rounded-lg text-sm hover:opacity-80" style={{ background: th?.background }}>
              <span style={{ color: th?.primary }}>Q:</span> {item.question}
            </button>
          ))}
        </div>
      </StyledCard>
    </div>
  )
}

export default CornMDSite
