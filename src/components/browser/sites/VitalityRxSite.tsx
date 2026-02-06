/**
 * VitalityRx Site
 *
 * Pharmaceutical advertising site for the engAIge browser.
 * Features fake medications, ridiculous side effects, and over-the-top medical marketing.
 *
 * Refactored to use shared components: StyledCard, Button, Avatar, MetaRow
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

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


// ============================================================================
// DB Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Medication interface.
 * Uses metadata for medication-specific fields like genericName, sideEffects, testimonials, etc.
 */
function dbToMedication(item: SiteContentItem): Medication {
  const m = item.metadata || {}
  return {
    id: item.slug,
    name: item.title,
    genericName: m.genericName ?? m.generic_name ?? '',
    tagline: item.subtitle ?? m.tagline ?? '',
    condition: m.condition ?? '',
    description: item.body ?? item.summary ?? '',
    icon: item.thumbnailEmoji ?? m.icon ?? '💊',
    color: m.color ?? '#6B4C9A',
    dosage: m.dosage ?? '',
    howItWorks: m.howItWorks ?? m.how_it_works ?? '',
    clinicalResults: Array.isArray(m.clinicalResults ?? m.clinical_results) ? (m.clinicalResults ?? m.clinical_results) : [],
    sideEffects: m.sideEffects ?? m.side_effects ?? { common: [], uncommon: [], rare: [] },
    testimonials: Array.isArray(m.testimonials) ? m.testimonials : [],
    disclaimer: m.disclaimer ?? '',
  }
}

// ============================================================================
// Components
// ============================================================================

export function VitalityRxSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('vitalityrx')
  const medications = useMemo(() => dbContent.map(dbToMedication), [dbContent])

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
                {medications.map((med) => (
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
