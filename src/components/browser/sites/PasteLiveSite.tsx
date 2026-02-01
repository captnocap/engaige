/**
 * PasteLive Site
 *
 * A Pastebin-style text sharing site hosting "pastes" that provide windows into
 * the weird lives of NPCs in the engAIge universe. Features manifestos, angry
 * letters, code snippets with disturbing comments, and more.
 *
 * Dark theme mimicking real pastebin sites with syntax highlighting options,
 * view counts, expiration timestamps, and non-functional Report/Raw buttons.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'

// ============================================================================
// Types & Data
// ============================================================================

type PasteCategory = 'text' | 'code' | 'document' | 'legal' | 'markdown'

interface Paste {
  id: string
  title: string
  author: string
  category: PasteCategory
  created: string
  expires: string | null
  views: number
  syntax: string
  content: string
  isPrivate?: boolean
  isHighlighted?: boolean
}

/**
 * Sample pastes revealing the weird inner lives of NPCs
 * Each paste connects to existing world lore where possible
 */
const PASTES: Paste[] = [
  {
    id: 'qc847',
    title: 'why_i_quit_quantum_coffee.txt',
    author: 'CoffeeSuperposition',
    category: 'text',
    created: 'January 18, 2026',
    expires: null,
    views: 847,
    syntax: 'none',
    content: `Attempt #847 to quit Quantum Coffee.

I, Derek Waverly, hereby declare that I am DONE with Quantum Coffee.

No more $47 cups. No more "observing my espresso into existence." No more lectures from the barista about how my skepticism is "collapsing the wave function of my enjoyment."

The Martinez Study was funded by Big Coffee. I've done my research. The so-called "quantum extraction method" is just... making coffee. Slowly. While someone hums at you.

Day 1: Feeling strong. Had regular coffee from a gas station. Tasted like victory.

Day 2: Walked past Quantum Coffee Co. Could smell the "probability beans." Kept walking.

Day 3: Someone at work mentioned wave functions. Started sweating.

Day 4: Bought a French press. It's not the same. It's NEVER the same.

Day 5: The barista texted me. HOW DID HE GET MY NUMBER? He said my "usual" was "waiting in superposition" for me.

Day 6: I miss the humming. I miss the $47 cup. I miss watching them "entangle" the milk with my expectations.

Day 7: I'm going back tomorrow.

Attempt #848 starts next week.

- Derek

P.S. If anyone from GrainTruth is reading this, I also know the truth about the barley-bitcoin connection. Dr. Cryptwood was right. THEY'RE ALL CONNECTED.`,
  },
  {
    id: 'hw-orient',
    title: 'hartwell_building_employee_orientation.docx',
    author: 'HRDeptFloor12',
    category: 'document',
    created: 'January 15, 2026',
    expires: null,
    views: 1923,
    syntax: 'none',
    content: `HARTWELL BUILDING EMPLOYEE ORIENTATION
Omnicorp Holdings - Human Resources Division
Document Version 4.7.1 (Revised after Incident)

WELCOME TO THE HARTWELL BUILDING

Congratulations on your new position! The Hartwell Building has been a pillar of our community since 1923. We are proud to continue its legacy of [REDACTED] excellence.

BUILDING NAVIGATION

Floors 1-6: Standard office operations
Floor 7: [SEE APPENDIX F - RESTRICTED]
Floors 8-12: Executive offices, HR, Legal
Floor 13: Does not exist. Do not ask about Floor 13.
Floors 14+: Senior management

IMPORTANT GUIDELINES

1. The mirrors on Floor 7 reflect accurately. Any reports to the contrary are unfounded.

2. If you hear humming from the ventilation system between 3:00 AM and 4:00 AM, this is normal HVAC maintenance. Do not investigate.

3. The supply closet on Floor 7 contains standard office supplies. There is no door behind the shelving unit.

4. Employee wellness checks are mandatory every 847 hours of logged work time. This is for your benefit.

5. The elevator sometimes skips Floor 7. This is a known issue with the vintage machinery. Simply press the button again.

6. Former employee photographs in the lobby are rotated quarterly. If you see a photograph of someone you recognize who has not worked here, please report to HR immediately.

7. The building settles at night. Any sounds of footsteps on floors that should be empty are normal settling sounds.

8. Do not accept coffee from the vendor cart that appears on Floor 7 on Wednesdays. We do not have a vendor cart.

CONTACT INFORMATION

For concerns, contact: hr@omnicorpholdings.corn
Building Manager: [POSITION CURRENTLY VACANT]
Security: 24/7 monitoring via [REDACTED]

Remember: At Omnicorp Holdings, we're all part of the Hartwell family!

(Page 2 of 47 - Additional pages available to employees with Level 3 clearance or above)`,
  },
  {
    id: 'tft-waiver',
    title: 'trust_fall_liability_waiver.legal',
    author: 'TrustFallTimOfficial',
    category: 'legal',
    created: 'January 12, 2026',
    expires: null,
    views: 2847,
    syntax: 'none',
    content: `TRUST FALL LIABILITY WAIVER AND RELEASE OF CLAIMS
Version 3.2 (Post-Incident Revision)

I, the undersigned ("Catcher"), hereby acknowledge and agree to the following:

SECTION 1: ACKNOWLEDGMENT OF RISK

1.1 I understand that Trust Fall Tim ("Tim") will fall backwards without warning at any time.
1.2 I accept that Tim's falling is not a "bit" or "performance art" but a "lifestyle choice" and "philosophical statement."
1.3 I acknowledge that Tim has fallen 2,847 times and shows no signs of stopping.
1.4 I understand the current catch rate is 78.5% and I WILL NOT be responsible for lowering this statistic.

SECTION 2: CATCHER RESPONSIBILITIES

2.1 I will position myself appropriately when Tim announces "TRUST FALL."
2.2 I will not be distracted by phones, conversations, or existential dread.
2.3 I will not be "Small Kevin." (See Appendix C: The Incident)
2.4 I agree to catch Tim with both hands, not "one hand while holding a drink" unless I am Mars from The Underground, who has proven capability.

SECTION 3: RELEASE OF LIABILITY

3.1 I release Tim from any claims arising from:
    - Surprise falling
    - Emotional vulnerability caused by being trusted
    - The philosophical weight of human connection
    - Tim landing on me if I fail to catch him

3.2 Tim releases me from claims arising from:
    - Failure to catch (though he will be disappointed)
    - Catching "weird" (grabbing inappropriate areas)
    - Dropping him after initial catch
    - Crying during or after the fall

SECTION 4: SMALL KEVIN CLAUSE

4.1 If your name is Kevin, please disclose this before the fall.
4.2 All Kevins will be subject to additional assessment.
4.3 This is not discrimination. This is statistics.

SECTION 5: MEDIA RELEASE

5.1 Falls may be recorded for TrustFallTim.corn, VidTube, and ForChan.
5.2 Your catching (or failing) will become part of Tim's legacy.
5.3 You may be immortalized. Or memorialized. Depending on catch success.

Signature: _________________________
Date: _________________________
Are you Kevin? [ ] Yes [ ] No [ ] Declined to state

"Trust is not given. Trust is fallen into." - Tim, probably`,
  },
  {
    id: 'corn-truth',
    title: 'the_truth_about_corn.md',
    author: 'AwakeCornPoster',
    category: 'markdown',
    created: 'January 10, 2026',
    expires: 'March 10, 2026',
    views: 4847,
    syntax: 'markdown',
    content: `# THE TRUTH ABOUT CORN

## They Don't Want You To Know

Ever notice how corn is in EVERYTHING? Corn syrup. Corn starch. Corn oil. Cornbread. Corn on the cob. This is not a coincidence.

### The Numbers Don't Lie

- Corn production: 847 MILLION metric tons annually
- Countries growing corn: 164
- Times I've found corn in products where it shouldn't be: COUNTLESS
- Number of people who've called me "crazy": 23 (they're all wrong)

### Connection to GrainTruth

Dr. Helena Cryptwood almost figured it out. She was looking at wheat and barley, but she missed the OBVIOUS connection: **CORN**.

The Burgundy wheat surplus of 1347? It was actually a corn shortage cover-up. The historical records were changed. I have evidence. I can't share it here. THEY'RE WATCHING.

### The .corn Domain

Think about it. Why does this entire fake internet use .corn domains?

- wikiknow.corn
- threadit.corn
- vidtube.corn
- pastelive.corn

IT'S ALL CORN. We're LIVING in the corn. We're SURROUNDED by the corn.

### What You Can Do

1. Read GrainTruth: www.graintruth.corn
2. Avoid corn products (impossible but try)
3. Spread the word
4. Trust no one (except Dr. Cryptwood)
5. The answer is 847. It's always 847.

### Related Reading

- "The Threshing Floor Controls Corn Too" - unpublished manuscript
- "Why Corn Subsidies Are Mind Control" - my ForChan posts
- "847: The Number They Fear" - available on request

## Remember

When you look at corn, corn looks back at you.

*This paste will expire in 60 days. If it disappears earlier, you know why.*`,
  },
  {
    id: 'rmmate-rant',
    title: 'my_roommate_wont_stop.rant',
    author: 'SufferingInSilence42',
    category: 'text',
    created: 'January 8, 2026',
    expires: 'February 8, 2026',
    views: 1203,
    syntax: 'none',
    content: `My roommate will not stop talking about prediction markets.

I'm posting this here because if I post it on Threadit, he'll find it and he'll make a MARKET about whether I'm mad at him.

It started innocently. "Hey, OddsOracle has some fun betting pools." Fine. Cool. Whatever.

Then it escalated.

BREAKFAST:
Me: "Want eggs?"
Him: "Current market says 67% chance you make scrambled. I'm betting on sunny side up."
Me: *makes scrambled*
Him: "Interesting. The market was wrong. I lost 847 prediction points."

WORK:
He texts me: "Created a market: 'Will [my name] text me back within 10 minutes?' Currently at 45% YES."
I don't respond.
He texts: "Market adjusted to 12% YES."

RELATIONSHIPS:
He asked a girl out. She said maybe. He CREATED A MARKET ON ODDSORACLE about whether she'd say yes. She found out. She said no. The market resolved.

He then created a DERIVATIVE MARKET about whether she'd unfollow him. She did.

DAILY LIFE:
- He has a market on what time I'll wake up (he tracks my bedroom light)
- He has a market on whether the landlord will fix the dishwasher (currently 23% YES for 6 months)
- He has a market on whether I'll move out (I'm not telling him I checked apartments on NestFinder)
- He has a market on whether the weird guy at Quantum Coffee will cry today (73% YES, usually correct)

THE BREAKING POINT:
Last night, he asked me to be the "resolution source" for a market about whether our friendship will "survive 2026."

Current odds: 34% YES.

I don't know if I should be offended or impressed that he predicted my frustration this accurately.

If anyone needs a roommate, I'm looking. References available. I work from home. I don't make markets about your life. I promise.

Do NOT share this with anyone on r/OddsOracle.`,
  },
  {
    id: 'code-rev',
    title: 'code_review_notes.py',
    author: 'AnonymousDev847',
    category: 'code',
    created: 'January 6, 2026',
    expires: null,
    views: 3156,
    syntax: 'python',
    content: `# Code Review Notes - Sprint 47
# Project: [REDACTED] Internal Dashboard
# Reviewer: Me, 2:34 AM, questioning my life choices

def calculate_user_engagement(user_data):
    """
    Calculate engagement score for users.
    TODO: Figure out why this works. It shouldn't work. Math says no.
    """
    # This formula came to me in a dream. Do not modify.
    score = (user_data.clicks * 847) / (user_data.time_spent + 1)

    # Added +1 to avoid division by zero
    # Previous developer wrote "divide by zero and see what happens"
    # I am not doing that, Kevin.

    return score

def process_daily_metrics():
    """
    Run daily metric processing.
    NOTE: Must complete before 3 AM or the VP sends all-caps emails.
    """
    # Why does this need to run at 3 AM specifically?
    # "Legacy reasons" - Jake, 2019, now at different company
    # Jake if you're reading this: I have questions

    metrics = fetch_metrics()  # Takes 45 minutes. Do not optimize.
                               # Last person who optimized this got promoted.
                               # Then fired. Unrelated? Unclear.

    # BEGIN: Code that should be deleted but breaks everything if removed
    for i in range(847):
        pass  # This loop does nothing but removing it crashes prod
    # END: Cursed code

    return metrics

class UserBehaviorAnalyzer:
    """
    Analyzes user behavior patterns.
    Original author: Steve
    Steve does not work here anymore.
    Steve did not leave documentation.
    I hope Steve is doing well but also I have feelings.
    """

    def __init__(self):
        self.mysterious_constant = 847  # What does this mean, Steve?
        self.another_magic_number = 42  # Classic. At least I understand this one.
        self.why = True  # Renamed from 'steve_was_here'

    def analyze(self, user):
        # if user.name == "Kevin":
        #     return None  # Kevin knows what he did
        # NOTE: HR made me remove this. Kevin does not know what he did.

        if user.last_login > datetime.now():
            # User is from the future???
            # This has happened twice. Both times named Kevin.
            log_anomaly(user)

        return self._calculate_score(user)

    def _calculate_score(self, user):
        """
        The algorithm is:
        1. Math
        2. More math
        3. Profit??

        I did not write this. I am afraid to touch it.
        It passed all tests on the first try.
        Nothing passes all tests on the first try.
        """
        return 847  # Returns 847 for everyone. Tests still pass. I give up.

# TODO: Rewrite entire codebase
# TODO: Find Steve
# TODO: Ask Steve why
# TODO: Therapy appointment at 4 PM don't forget
# TODO: Check if OddsOracle market on "Will this code go to prod" resolved yet
# CURRENT ODDS: 89% YES - The market believes in me more than I believe in myself`,
  },
  {
    id: 'grocery-secret',
    title: 'grocery_list_DO_NOT_READ.txt',
    author: 'Anonymous',
    category: 'text',
    created: 'January 4, 2026',
    expires: 'January 11, 2026',
    views: 892,
    syntax: 'none',
    isPrivate: true,
    content: `GROCERY LIST - JANUARY 2026
(This is just a normal grocery list. Nothing to see here.)

PRODUCE:
- Bananas (the ones that are slightly green, I'm not a monster)
- Apples (NOT Honeycrisp, Carol knows why)
- 847 heads of garlic (for normal cooking purposes)
- Kale (for the guilt of not eating it later)

DAIRY:
- Milk (whole, life is too short for skim)
- Cheese (the fancy one that costs too much but makes me feel emotions)
- Butter (salted, I'm not a sociopath)
- 12 cartons of heavy cream (for a recipe)
- 6 more cartons of heavy cream (for the same recipe)
- Actually make it 20 (the recipe is ambitious)

MEAT:
- Chicken thighs (bone-in skin-on because I have taste)
- Ground beef (for the thing)
- THE THING (ask butcher, he knows, do NOT explain)

MYSTERIOUS AISLE:
- Item 7 from shelf 3 (Marcus will leave it there)
- The blue package (they'll know)
- One of those things (if they still have them)
- Bread??? (not actually bread, wink at the cashier)

ACTUALLY NORMAL THINGS:
- Toilet paper (the good kind)
- Paper towels
- Dish soap
- Normal human food items

DO NOT FORGET:
- The envelope (under the basil at the farmer's market)
- Return Marcus's "container" (empty, cleaned, no questions)
- Avoid eye contact with the olive oil guy (he knows what I did)
- Pick up the "prescription" (it's not a prescription)

IF ANYONE FINDS THIS LIST:
This is just a normal grocery list. The heavy cream is for several normal recipes. The garlic amount is reasonable. The thing with Marcus is about returning a Tupperware container and nothing else. Do not contact him. Do not ask questions.

CURRENT TOTAL: $847.23 (coincidence)

- B.

P.S. If you're from Omnicorp Holdings HR, I don't know anything about Floor 7.`,
  },
  {
    id: 'resign-draft',
    title: 'resignation_letter_draft_47.txt',
    author: 'SoonToBeFormer',
    category: 'document',
    created: 'January 2, 2026',
    expires: null,
    views: 2341,
    isHighlighted: true,
    syntax: 'none',
    content: `RESIGNATION LETTER - DRAFT 47
(Previous drafts: Too angry, too sad, too honest, included profanity,
mentioned the incident, mentioned Kevin, mentioned the OTHER incident,
accidentally CC'd all-staff, contained a haiku about suffering)

---

Dear [HR Representative whose name I keep forgetting],

After [DURATION OF SUFFERING] years at Omnicorp Holdings, I have decided to pursue other opportunities. This decision was not made lightly, though it was made at 2 AM while eating cold pizza over the sink, which I feel represents my time here accurately.

I want to thank everyone for the "experience." Specifically:
- The "team" (you know who you are)
- The coffee machine on Floor 8 (the only thing that never let me down)
- The one person in accounting who actually answers emails
- The mysterious janitor who always seemed to know when I was crying

I will NOT miss:
[REDACTED FOR LEGAL REASONS - SEE DRAFT 23 FOR FULL LIST]

My last day will be [DATE], unless the elevator skips Floor 7 again and I decide to just... keep riding. Forever. That's a joke. Mostly.

Please find attached:
- My access badge (finally)
- My parking pass
- My remaining will to live (negligible, keep as souvenir)
- The truth about what happened in Conference Room B (wait, no, delete this)

Forwarding address: Not the Hartwell Building. Never the Hartwell Building.

I wish the company continued success, and I mean that in the most neutral way possible.

Regards,
[NAME WITHHELD - I STILL NEED A REFERENCE]

P.S. I know about Floor 7. I've always known. The mirrors don't lie. They show what's really there. I'm not crazy. I'm just... ready to go.

P.P.S. Kevin, I forgive you. I shouldn't, but I do. Please stop making prediction markets about my departure date. Current odds are 94% YES for this Friday. The market is correct.

P.P.P.S. If anyone from WealthWisdom reads this, your financial advice didn't work. I'm still poor. But I'm poor and FREE.

---

NOTES TO SELF:
- Remove Floor 7 reference (or keep it? they can't sue me if I'm gone)
- Check NestFinder for apartments that accept people who might be followed
- Ask Trust Fall Tim if his philosophy applies to career decisions
- Consider posting this to PasteLive anonymously (doing it)
- Cry (done)
- Delete draft 48 in advance (who am I kidding there will be a draft 48)`,
  },
]

/**
 * Additional recent pastes for the sidebar (titles only)
 */
const RECENT_TITLES = [
  { id: 'misc-1', title: 'untitled_rant.txt', views: 234, time: '2 hours ago' },
  { id: 'misc-2', title: 'backup_before_i_forget.sql', views: 567, time: '4 hours ago' },
  { id: 'misc-3', title: 'IMPORTANT_READ_NOW.txt', views: 89, time: '5 hours ago' },
  { id: 'misc-4', title: 'poetry_attempt_12.txt', views: 45, time: '8 hours ago' },
  { id: 'misc-5', title: 'urls_i_need_to_check.md', views: 123, time: '12 hours ago' },
  { id: 'misc-6', title: 'why_does_excel_hate_me.csv', views: 847, time: '1 day ago' },
  { id: 'misc-7', title: 'mom_recipe_dont_lose.txt', views: 67, time: '2 days ago' },
  { id: 'misc-8', title: 'wifi_passwords_home.txt', views: 1, time: '3 days ago' },
]

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get syntax highlighting color class based on content type
 */
function getSyntaxHighlightClass(syntax: string): string {
  const classes: Record<string, string> = {
    python: 'text-green-400',
    markdown: 'text-blue-400',
    none: 'text-gray-300',
  }
  return classes[syntax] || 'text-gray-300'
}

/**
 * Get category badge styles
 */
function getCategoryStyle(category: PasteCategory): { bg: string; text: string } {
  const styles: Record<PasteCategory, { bg: string; text: string }> = {
    text: { bg: '#374151', text: '#9CA3AF' },
    code: { bg: '#064E3B', text: '#6EE7B7' },
    document: { bg: '#1E3A8A', text: '#93C5FD' },
    legal: { bg: '#7C2D12', text: '#FDBA74' },
    markdown: { bg: '#4C1D95', text: '#C4B5FD' },
  }
  return styles[category]
}

// ============================================================================
// Components
// ============================================================================

/**
 * Category badge component
 */
function CategoryBadge({ category }: { category: PasteCategory }) {
  const style = getCategoryStyle(category)
  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-mono uppercase"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {category}
    </span>
  )
}

/**
 * Paste list item for homepage view
 */
function PasteListItem({
  paste,
  onSelect,
}: {
  paste: Paste
  onSelect: () => void
}) {
  return (
    <div
      className="flex items-center gap-4 py-3 px-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 transition-colors"
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-400 font-mono text-sm truncate hover:text-green-300">
            {paste.title}
          </span>
          {paste.isPrivate && (
            <span className="text-xs px-1.5 py-0.5 bg-yellow-900/50 text-yellow-500 rounded">
              unlisted
            </span>
          )}
          {paste.isHighlighted && (
            <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded">
              featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>by {paste.author}</span>
          <span>|</span>
          <CategoryBadge category={paste.category} />
          <span>|</span>
          <span>{paste.created}</span>
        </div>
      </div>
      <div className="text-right text-xs text-gray-500">
        <div className="text-gray-400">{paste.views.toLocaleString()} views</div>
        {paste.expires && (
          <div className="text-orange-500">Expires: {paste.expires}</div>
        )}
      </div>
    </div>
  )
}

/**
 * Full paste detail view with content display
 */
function PasteDetail({
  paste,
  onBack,
}: {
  paste: Paste
  onBack: () => void
}) {
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [copied, setCopied] = useState(false)

  const lines = paste.content.split('\n')
  const syntaxClass = getSyntaxHighlightClass(paste.syntax)

  const handleCopy = () => {
    navigator.clipboard.writeText(paste.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-full bg-gray-900">
      {/* Paste Header */}
      <div className="bg-gray-850 border-b border-gray-700 p-4" style={{ backgroundColor: '#1a1d23' }}>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="text-green-500 hover:text-green-400 text-sm mb-3 font-mono"
          >
            &larr; Back to pastes
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-mono text-green-400 mb-2">{paste.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Posted by <span className="text-gray-300">{paste.author}</span></span>
                <span>|</span>
                <CategoryBadge category={paste.category} />
                <span>|</span>
                <span>{paste.created}</span>
                <span>|</span>
                <span>{paste.views.toLocaleString()} views</span>
              </div>
              {paste.expires && (
                <div className="text-orange-500 text-sm mt-1">
                  Expires: {paste.expires}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors opacity-50 cursor-not-allowed"
                title="Raw view not available"
              >
                Raw
              </button>
              <button
                className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900/70 text-red-400 text-sm rounded transition-colors opacity-50 cursor-not-allowed"
                title="Report functionality coming soon"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600"
            />
            Line numbers
          </label>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">Syntax: {paste.syntax}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">{lines.length} lines</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className={syntaxClass}>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  {showLineNumbers && (
                    <span className="text-gray-600 select-none pr-4 text-right w-12 flex-shrink-0">
                      {i + 1}
                    </span>
                  )}
                  <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-gray-800/50 rounded p-4 text-center text-sm text-gray-500">
          <p>Paste ID: {paste.id} | Created: {paste.created}</p>
          <p className="mt-1">
            Share link: pastelive.corn/{paste.id}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Recent pastes sidebar component
 */
function RecentPastesSidebar({ onSelectPaste }: { onSelectPaste: (id: string) => void }) {
  return (
    <div className="bg-gray-800 rounded p-4">
      <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
        Recent Public Pastes
      </h3>
      <div className="space-y-2">
        {RECENT_TITLES.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-xs py-1.5 border-b border-gray-700 last:border-0"
          >
            <span
              className="text-green-400 hover:text-green-300 cursor-pointer truncate max-w-32"
              onClick={() => {
                // These are placeholder titles that don't have full content
                // In a real app, they would navigate to their paste
              }}
            >
              {item.title}
            </span>
            <span className="text-gray-500 flex-shrink-0 ml-2">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Stats sidebar component
 */
function StatsSidebar() {
  return (
    <div className="bg-gray-800 rounded p-4">
      <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
        Statistics
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Pastes</span>
          <span className="text-gray-300">847,231</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Active Today</span>
          <span className="text-gray-300">12,847</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Expired Today</span>
          <span className="text-gray-300">4,721</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Anonymous Posts</span>
          <span className="text-gray-300">78.5%</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function PasteLiveSite({ siteId, path, onPathChange }: SiteProps) {
  const [selectedPaste, setSelectedPaste] = useState<Paste | null>(null)

  // Handle path-based navigation
  const handleSelectPaste = (paste: Paste) => {
    setSelectedPaste(paste)
    onPathChange?.(`/${paste.id}`)
  }

  const handleBack = () => {
    setSelectedPaste(null)
    onPathChange?.(null)
  }

  // If viewing a specific paste
  if (selectedPaste) {
    return <PasteDetail paste={selectedPaste} onBack={handleBack} />
  }

  // Main list view
  return (
    <div className="min-h-full bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h1 className="text-xl font-bold text-green-400 font-mono">PasteLive</h1>
              <p className="text-xs text-gray-500">Share text. No questions asked.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors">
              + New Paste
            </button>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors">
              API
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-850 border-b border-gray-700" style={{ backgroundColor: '#1a1d23' }}>
        <div className="max-w-5xl mx-auto flex">
          <button className="px-4 py-3 text-sm text-green-400 border-b-2 border-green-400 font-medium">
            Public Pastes
          </button>
          <button className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300">
            Trending
          </button>
          <button className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300">
            Archive
          </button>
          <button className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300">
            Syntax List
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Paste List */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded overflow-hidden border border-gray-700">
              <div className="px-4 py-3 bg-gray-750 border-b border-gray-700 flex justify-between items-center" style={{ backgroundColor: '#1f2937' }}>
                <h2 className="text-sm font-medium text-gray-300">Latest Pastes</h2>
                <span className="text-xs text-gray-500">
                  {PASTES.length} featured | 847,231 total
                </span>
              </div>
              <div>
                {PASTES.map((paste) => (
                  <PasteListItem
                    key={paste.id}
                    paste={paste}
                    onSelect={() => handleSelectPaste(paste)}
                  />
                ))}
              </div>
            </div>

            {/* Pagination placeholder */}
            <div className="mt-4 flex justify-center gap-2">
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                Previous
              </button>
              <span className="px-3 py-1.5 bg-green-600 text-white text-sm rounded">1</span>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                2
              </button>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                3
              </button>
              <span className="px-3 py-1.5 text-gray-500 text-sm">...</span>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                847
              </button>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 space-y-4 hidden lg:block">
            <StatsSidebar />
            <RecentPastesSidebar onSelectPaste={(id) => {
              const paste = PASTES.find(p => p.id === id)
              if (paste) handleSelectPaste(paste)
            }} />

            {/* Info Box */}
            <div className="bg-gray-800 rounded p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-2">About PasteLive</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                PasteLive is a simple text hosting service. Paste code, notes,
                manifestos, or anything else. Set expiration dates or keep forever.
                We don&apos;t ask questions.
              </p>
              <p className="text-xs text-gray-600 mt-2 italic">
                &quot;Your secrets are safe here. Mostly.&quot;
              </p>
            </div>

            {/* Ad-like Box */}
            <div className="bg-gray-800 border border-yellow-900/50 rounded p-4">
              <p className="text-xs text-yellow-500/70 uppercase tracking-wide mb-2">
                Sponsored
              </p>
              <p className="text-sm text-gray-400">
                Tired of your code being judged? Try
                <span className="text-green-400"> AnonymousCodeReview.corn</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                &quot;They can&apos;t fire you if they don&apos;t know it&apos;s you.&quot;
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6 px-4 mt-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-gray-400 font-mono">
            PasteLive.corn - Share text anonymously since 2019
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-400 cursor-pointer">Terms</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacy</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">API Docs</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Contact</span>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Total pastes hosted: 847,231 | Deleted by request: 23
          </p>
        </div>
      </footer>
    </div>
  )
}

export default PasteLiveSite
