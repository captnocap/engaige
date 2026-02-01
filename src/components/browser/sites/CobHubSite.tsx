/**
 * CobHub Site
 *
 * GitHub parody for the engAIge browser.
 * A code repository hosting site where the projects are increasingly unhinged.
 * Features repositories from the game's lore characters with all their conspiracy
 * theories and obsessions turned into code projects.
 *
 * Notable repos:
 * - quantum-coffee-timer by derek-observerson (847 stars, wife compatibility issues)
 * - floor-13-detector by anonymous-hartwell (all code commented out)
 * - trust-fall-calculator by trustfalltim (78.5% test pass rate)
 * - corn-price-predictor by cobcoin-labs (abandoned, all predictions wrong)
 * - omnicorp-employee-handbook by omnicorp-holdings (last update "????")
 * - grain-truth-scraper by the-kernel (847 issues marked "silenced")
 * - gas-station-sushi-rater by mildred-eats (written in COBOL)
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.cobhub

// ============================================================================
// Types
// ============================================================================

interface Repository {
  id: string
  name: string
  owner: string
  ownerAvatar: string
  description: string
  stars: number
  forks: number
  language: string
  languageColor: string
  lastUpdated: string
  topics: string[]
  readme: string
  issues: Issue[]
  contributions: number[]  // 52 weeks of contribution data
}

interface Issue {
  id: number
  title: string
  author: string
  status: 'open' | 'closed'
  labels: { name: string; color: string }[]
  comments: number
  createdAt: string
}

interface UserProfile {
  username: string
  displayName: string
  avatar: string
  bio: string
  location: string
  website: string
  joinDate: string
  followers: number
  following: number
  repos: string[]
  pinnedRepos: string[]
}

// ============================================================================
// Sample Data
// ============================================================================

const REPOSITORIES: Repository[] = [
  {
    id: 'quantum-coffee-timer',
    name: 'quantum-coffee-timer',
    owner: 'derek-observerson',
    ownerAvatar: '☕',
    description: 'Precisely time your quantum coffee brewing to the nanosecond. Based on the Martinez Study.',
    stars: 847,
    forks: 47,
    language: 'TypeScript',
    languageColor: '#3178c6',
    lastUpdated: '3 hours ago',
    topics: ['quantum', 'coffee', 'martinez-study', 'brewing', 'wife-approved'],
    readme: `# Quantum Coffee Timer

> "Time is an illusion. Brew time doubly so." - Dr. Elena Martinez

## About

This timer uses quantum observation principles to ensure your coffee is brewed at the EXACT moment of peak molecular coherence. Based on the groundbreaking Martinez Study (2019).

## Features

- Nanosecond precision timing
- Quantum entanglement indicators
- Wife compatibility mode (reduces brewing noise by 47%)
- Martinez Study integration
- Supports both Celsius and Kelvin

## Installation

\`\`\`bash
npm install quantum-coffee-timer
# Note: Requires quantum processor. See Martinez Study for DIY instructions.
\`\`\`

## Wife Compatibility Mode

Many users have reported issues with spousal acceptance of quantum brewing equipment. Version 2.4.7 introduces "Wife Compatibility Mode" which:

- Reduces LED blinking by 63%
- Suppresses "QUANTUM COHERENCE ACHIEVED" announcements between 10pm-7am
- Hides power consumption from smart home apps
- Auto-generates cover stories for equipment purchases

**Known Issue:** Wife Compatibility Mode may conflict with HONEST_MARRIAGE environment variable.

## The Martinez Study

This project would not exist without Dr. Elena Martinez's groundbreaking research. Her paper "Accidental Quantum Brewing: A Serendipitous Discovery" changed everything we know about coffee.

Key findings:
- Water molecules can be entangled at 3.7 seconds
- Optimal observation temperature: 47 Kelvin
- 847 intermediate steps identified in brewing chain

## Support

If you find this useful, please star the repo. We're trying to reach 1,000 stars to prove to Derek's wife that this is a "real" project.

## License

MIT (Martinez Initiated Thermodynamics)`,
    issues: [
      {
        id: 1,
        title: 'Timer keeps showing negative time remaining',
        author: 'confused-barista',
        status: 'open',
        labels: [{ name: 'bug', color: '#d73a4a' }, { name: 'quantum-weirdness', color: '#7057ff' }],
        comments: 23,
        createdAt: '2 hours ago',
      },
      {
        id: 2,
        title: 'Wife says the "observation chamber" is too loud',
        author: 'derek-observerson',
        status: 'open',
        labels: [{ name: 'wife-compatibility', color: '#fbca04' }],
        comments: 47,
        createdAt: '3 days ago',
      },
      {
        id: 3,
        title: 'Coffee exists in superposition until tasted',
        author: 'physics-pedant',
        status: 'open',
        labels: [{ name: 'feature', color: '#0e8a16' }, { name: 'philosophical', color: '#5319e7' }],
        comments: 156,
        createdAt: '1 week ago',
      },
      {
        id: 4,
        title: 'Martinez Study link returns 404',
        author: 'fact-checker',
        status: 'closed',
        labels: [{ name: 'wontfix', color: '#ffffff' }],
        comments: 1,
        createdAt: '2 weeks ago',
      },
      {
        id: 5,
        title: 'Is this why my electricity bill is $847/month?',
        author: 'dereks-wife',
        status: 'open',
        labels: [{ name: 'wife-compatibility', color: '#fbca04' }, { name: 'help wanted', color: '#008672' }],
        comments: 0,
        createdAt: '1 hour ago',
      },
    ],
    contributions: [0, 2, 4, 7, 3, 1, 0, 4, 7, 8, 4, 2, 1, 0, 3, 5, 8, 4, 7, 7, 4, 2, 1, 0, 2, 4, 7, 8, 4, 2, 1, 4, 7, 8, 4, 2, 1, 0, 2, 4, 7, 8, 4, 7, 8, 4, 2, 1, 0, 2, 4, 7],
  },
  {
    id: 'floor-13-detector',
    name: 'floor-13-detector',
    owner: 'anonymous-hartwell',
    ownerAvatar: '🏢',
    description: 'Detects if you are currently on a floor that does not exist. For your safety.',
    stars: 13,
    forks: 13,
    language: 'JavaScript',
    languageColor: '#f1e05a',
    lastUpdated: '????',
    topics: ['hartwell', 'floor-13', 'they-know', 'mirrors', 'safety'],
    readme: `# Floor 13 Detector

## THEY'RE WATCHING

\`\`\`javascript
// THEY'RE WATCHING
// function detectFloor13() {
//   THEY'RE WATCHING
//   // const currentFloor = getCurrentFloor();
//   // THEY'RE WATCHING
//   // if (currentFloor === 13) {
//   //   THEY'RE WATCHING
//   //   return true;
//   // }
//   // THEY'RE WATCHING
//   // return false;
// }
// THEY'RE WATCHING
\`\`\`

## Installation

DO NOT INSTALL THIS ON THE 13TH FLOOR.

DO NOT LOOK AT THE MIRRORS ON FLOOR 7.

## Configuration

\`\`\`
FLOOR_13_EXISTS=false
FLOOR_13_EXISTS=false
FLOOR_13_EXISTS=false
FLOOR_13_EXISTS=false
FLOOR_13_EXISTS=false
\`\`\`

## IMPORTANT

If you are reading this from the Hartwell Building:

1. Leave immediately
2. Do not use the elevators
3. Do not look up
4. The stairs are safe (probably)

## Changelog

All commit messages have been [REDACTED]

## Contributors

- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell
- anonymous-hartwell

## License

There is no license. There is no floor 13. There is no Hartwell Building.`,
    issues: [
      {
        id: 1,
        title: 'I found floor 13',
        author: 'anonymous-hartwell',
        status: 'closed',
        labels: [{ name: 'SILENCED', color: '#000000' }],
        comments: 0,
        createdAt: '????',
      },
      {
        id: 2,
        title: 'The mirrors are watching',
        author: 'anonymous-hartwell',
        status: 'closed',
        labels: [{ name: 'SILENCED', color: '#000000' }],
        comments: 0,
        createdAt: '????',
      },
      {
        id: 3,
        title: 'Help',
        author: 'anonymous-hartwell',
        status: 'closed',
        labels: [{ name: 'SILENCED', color: '#000000' }],
        comments: 0,
        createdAt: '????',
      },
      {
        id: 4,
        title: 'Omnicorp knows',
        author: 'anonymous-hartwell',
        status: 'closed',
        labels: [{ name: 'SILENCED', color: '#000000' }],
        comments: 0,
        createdAt: '????',
      },
      {
        id: 5,
        title: '████████████',
        author: 'anonymous-hartwell',
        status: 'closed',
        labels: [{ name: 'SILENCED', color: '#000000' }],
        comments: 0,
        createdAt: '????',
      },
    ],
    contributions: [13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 0, 0, 13],
  },
  {
    id: 'trust-fall-calculator',
    name: 'trust-fall-calculator',
    owner: 'trustfalltim',
    ownerAvatar: '🙆',
    description: 'Calculate optimal trust fall angles and catch probability. Trained on 2,847 documented falls.',
    stars: 2847,
    forks: 785,
    language: 'Python',
    languageColor: '#3572A5',
    lastUpdated: '6 hours ago',
    topics: ['trust', 'falling', 'machine-learning', 'small-kevin', 'physics'],
    readme: `# Trust Fall Calculator

> "Every fall is a leap of faith. Every catch is proof of trust." - Tim

## Overview

This machine learning model predicts trust fall success rates based on:
- Faller height and weight
- Catcher height and weight
- Environmental factors (floor surface, lighting)
- Historical trust metrics between participants
- Time of day (catching reflexes vary)

## Training Data

Model trained on **2,847 documented trust falls**, including:
- 2,239 successful catches (78.5%)
- 608 missed catches (21.5%)
- The Incident (classified)

## Installation

\`\`\`bash
pip install trust-fall-calculator
# Warning: Do not run while actually falling
\`\`\`

## Usage

\`\`\`python
from trust_fall import TrustFallCalculator

calc = TrustFallCalculator()

result = calc.predict(
    faller_weight=180,
    catcher_weight=165,
    trust_level=0.95,
    is_small_kevin=False  # IMPORTANT: See below
)

print(f"Catch probability: {result.probability}%")
print(f"Recommended angle: {result.angle} degrees")
\`\`\`

## The Small Kevin Parameter

Version 3.2.1 introduced the \`is_small_kevin\` parameter after The Incident.

**DO NOT SET \`is_small_kevin=True\`** unless you are absolutely certain the catcher is NOT Small Kevin. Despite his name, Small Kevin has a 0% catch rate across 47 documented attempts.

Small Kevin has been banned from all official trust fall events.

## Test Results

Current test suite: **78.5% passing**

The remaining 21.5% of tests fail because they simulate catches by Small Kevin.

## Live Stats

- Total falls calculated: 847,392
- Average catch probability: 78.5%
- Highest trust level recorded: 99.7% (Tim and his mother)
- Lowest trust level: -12% (Tim and Small Kevin)

## License

MIT (Mutual Instantaneous Trust)`,
    issues: [
      {
        id: 1,
        title: 'Small Kevin compatibility bug - always returns 0%',
        author: 'small-kevin',
        status: 'open',
        labels: [{ name: 'wontfix', color: '#ffffff' }, { name: 'small-kevin', color: '#d73a4a' }],
        comments: 847,
        createdAt: '1 year ago',
      },
      {
        id: 2,
        title: 'Add support for group trust falls',
        author: 'team-building-todd',
        status: 'open',
        labels: [{ name: 'enhancement', color: '#a2eeef' }],
        comments: 23,
        createdAt: '2 weeks ago',
      },
      {
        id: 3,
        title: 'The Incident should be documented',
        author: 'safety-first',
        status: 'closed',
        labels: [{ name: 'classified', color: '#000000' }],
        comments: 0,
        createdAt: '6 months ago',
      },
    ],
    contributions: [7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4, 7, 8, 5, 4],
  },
  {
    id: 'corn-price-predictor',
    name: 'corn-price-predictor',
    owner: 'cobcoin-labs',
    ownerAvatar: '🌽',
    description: 'DEPRECATED: ML model for predicting CobCoin prices. All predictions were wrong.',
    stars: 3,
    forks: 0,
    language: 'Jupyter Notebook',
    languageColor: '#DA5B0B',
    lastUpdated: '8 months ago',
    topics: ['corn', 'cryptocurrency', 'failure', 'deprecated', 'im-sorry'],
    readme: `# Corn Price Predictor

## STATUS: ABANDONED

This project has been abandoned. All predictions were wrong.

## What Happened

We believed that corn futures could be predicted using blockchain sentiment analysis. We were wrong.

### Our Predictions vs Reality

| Date | Predicted | Actual | Difference |
|------|-----------|--------|------------|
| Jan 2025 | $847 | $4.23 | -99.5% |
| Feb 2025 | $1,200 | $4.18 | -99.7% |
| Mar 2025 | $2,500 | $4.31 | -99.8% |
| Apr 2025 | "Moon" | $4.22 | N/A |

## Investor Apology

To our 3 investors (all of whom were related to the founder):

I'm sorry. The corn was never going to moon. The blockchain was just a spreadsheet. The AI was just random number generation with extra steps.

Please stop calling. I've changed my number.

## Final Commit Message

\`\`\`
commit 847a3b2
Author: cobcoin-ceo <ceo@cobcoin.corn>
Date: April 1, 2025

    I'm sorry
\`\`\`

## Dependencies (Do Not Install)

- hopium: ^1.0.0
- blind-faith: ^2.3.4
- corn-blockchain: ^0.0.1 (our own package, also broken)
- reality-check: NOT INSTALLED

## License

None. Take it. Please.`,
    issues: [
      {
        id: 1,
        title: 'Predictions are all wrong',
        author: 'angry-investor',
        status: 'open',
        labels: [{ name: 'bug', color: '#d73a4a' }],
        comments: 1,
        createdAt: '8 months ago',
      },
      {
        id: 2,
        title: 'Where is my money',
        author: 'founders-mom',
        status: 'open',
        labels: [],
        comments: 47,
        createdAt: '8 months ago',
      },
    ],
    contributions: [8, 8, 8, 8, 8, 8, 8, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'omnicorp-employee-handbook',
    name: 'omnicorp-employee-handbook',
    owner: 'omnicorp-holdings',
    ownerAvatar: '🏛️',
    description: 'Official employee handbook for Omnicorp Holdings. All employees must read.',
    stars: 0,
    forks: 0,
    language: 'Markdown',
    languageColor: '#083fa1',
    lastUpdated: '????',
    topics: [],
    readme: `# Omnicorp Employee Handbook

## Welcome to Omnicorp

Lorem ipsum dolor sit amet, consectetur adipiscing elit. **Do not look at the mirrors on Floor 7.** Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Section 1: General Policies

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. **Floor 13 does not exist.** Nisi ut aliquip ex ea commodo consequat.

## Section 2: Building Guidelines

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. **The Hartwell Building was acquired in 1923 under circumstances that remain classified.** Eu fugiat nulla pariatur.

### 2.1 Elevator Usage

Excepteur sint occaecat cupidatat non proident. **If the elevator stops on Floor 13, do not exit.** Sunt in culpa qui officia deserunt mollit anim id est laborum.

### 2.2 Stairwell Access

Lorem ipsum dolor sit amet. **The stairs between Floor 12 and Floor 14 take exactly 47 seconds to traverse. If it takes longer, you are not where you think you are.** Consectetur adipiscing elit.

## Section 3: The Threshing Floor

THIS SECTION HAS BEEN REMOVED.

## Section 4: Benefits

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.

## Section 5: Contact Information

For questions about this handbook, please contact:

- HR Department: ████████████
- Building Management: ████████████
- The Threshing Floor: YOU DO NOT CONTACT THEM. THEY CONTACT YOU.

## Acknowledgment

By reading this handbook, you acknowledge that:

1. Floor 13 does not exist
2. You have not seen anything unusual on Floor 7
3. The mirrors are normal mirrors
4. You will not discuss the 1923 acquisition
5. You accept the terms of your employment

**Signature:** ________________
**Date:** ????

---

*This document was last updated on ????*
*No contributors are listed for legal reasons*
*Omnicorp Holdings - "Building a Better Tomorrow (Since 1923)"*`,
    issues: [],
    contributions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'grain-truth-scraper',
    name: 'grain-truth-scraper',
    owner: 'the-kernel',
    ownerAvatar: '🌾',
    description: 'Web scraper for collecting evidence of The Threshing Floor conspiracy. Big Grain is watching.',
    stars: 847,
    forks: 12,
    language: 'Python',
    languageColor: '#3572A5',
    lastUpdated: '4 hours ago',
    topics: ['grain', 'conspiracy', 'threshing-floor', 'burgundy-wheat', 'they-live'],
    readme: `# Grain Truth Scraper

> "Follow the chaff trail." - Dr. Helena Cryptwood

## Purpose

This scraper collects evidence connecting 14th century grain prices to modern world events. The Threshing Floor does not want you to have this tool.

## Dependencies

\`\`\`
paranoia>=2.0.0
they-live>=1.0.0
red-string>=3.4.7
vpn-hopper>=1.2.3
burner-identity>=0.9.9
\`\`\`

## Installation

\`\`\`bash
# Use a VPN
# Use a different VPN
# Disconnect from the first VPN
# Connect through Tor
# THEN install

pip install grain-truth-scraper

# If installation fails, THEY have found you
# Move to a secure location
# This message will self-destruct
\`\`\`

## Usage

\`\`\`python
from grain_truth import Scraper, ParanoiaLevel

scraper = Scraper(
    paranoia=ParanoiaLevel.MAXIMUM,
    vpn_hops=7,
    check_for_tails=True,
    trust_no_one=True
)

# Scrape evidence from the archives
evidence = scraper.find_connections(
    start_year=1347,
    end_year=2025,
    keywords=["burgundy", "wheat", "surplus", "medici"]
)

# WARNING: Running this query will alert THEM
# Only proceed if your affairs are in order
\`\`\`

## Evidence Found

| Year | Event | Grain Connection | Status |
|------|-------|-----------------|--------|
| 1347 | Burgundy Surplus | SOURCE | VERIFIED |
| 1929 | Stock Crash | Wheat futures | VERIFIED |
| 2008 | Financial Crisis | 661-year cycle | VERIFIED |
| 2025 | ████████ | ████████████ | SILENCED |

## Issues

All 847 issues have been closed and marked as "SILENCED".

We know who filed them. We remember.

## Contributing

Do not contribute. Contributing creates a paper trail. We communicate through dead drops only.

If you must contribute:
1. Create a burner account
2. Commit from a public library computer
3. Wear a hat
4. Do not look at the cameras

## License

This software is dedicated to the public domain because copyright is a tool of The Threshing Floor.`,
    issues: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      title: ['Evidence submitted', 'New connection found', 'Help needed', 'THEY FOUND ME', 'Pattern confirmed'][i],
      author: 'the-kernel',
      status: 'closed' as const,
      labels: [{ name: 'SILENCED', color: '#7f1d1d' }],
      comments: 0,
      createdAt: '????',
    })),
    contributions: [8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8],
  },
  {
    id: 'gas-station-sushi-rater',
    name: 'gas-station-sushi-rater',
    owner: 'mildred-eats',
    ownerAvatar: '🍣',
    description: 'API for rating and reviewing gas station sushi. Written entirely in COBOL for maximum reliability.',
    stars: 847,
    forks: 2,
    language: 'COBOL',
    languageColor: '#b5a6ff',
    lastUpdated: '2 days ago',
    topics: ['sushi', 'gas-station', 'cobol', 'food-safety', 'flying-j'],
    readme: `# Gas Station Sushi Rater

> "A temperature danger zone is just a suggestion." - Mildred Gasketsworth

## Overview

A comprehensive API for rating, reviewing, and locating gas station sushi. Written in COBOL because some code, like some sushi, is meant to last forever.

## Why COBOL?

1. COBOL has been running bank systems since 1959
2. Banks are reliable
3. Therefore, COBOL makes reliable sushi ratings
4. Also, I learned COBOL in 1962 and I'm not learning a new language now

## Current Rankings

| Rank | Location | Rating | Notes |
|------|----------|--------|-------|
| 1 | Flying J #847 | 10/10 | Perfect. Transcendent. |
| 2 | Shell on 5th | 8/10 | Good color |
| 3 | BP Downtown | 7/10 | Acceptable crunch |
| 4 | Texaco I-95 | 6/10 | Ambitious |
| 5 | Generic Mart | 3/10 | The rice moved |

## API Usage

\`\`\`cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SUSHI-RATER.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SUSHI-RATING PIC 99.
       01 LOCATION-NAME PIC X(50).
       01 TEMPERATURE PIC 999.

       PROCEDURE DIVISION.
           DISPLAY "ENTER GAS STATION NAME: ".
           ACCEPT LOCATION-NAME.

           IF LOCATION-NAME = "FLYING J #847"
               MOVE 10 TO SUSHI-RATING
               DISPLAY "PERFECT. SIMPLY PERFECT."
           ELSE
               PERFORM CHECK-TEMPERATURE
           END-IF.

           STOP RUN.
\`\`\`

## Flying J #847: A Love Letter

I have visited Flying J #847 forty-seven times. Each visit has been transcendent. The sushi case is maintained at exactly 41 degrees Fahrenheit. The california rolls glisten under fluorescent lights that have clearly been calibrated for optimal sushi presentation.

The night shift employee, Carl, knows me by name. He sets aside the freshest pieces for my visits. Carl understands.

**Five stars. Ten stars. All the stars.**

## Health Disclaimer

This API and its creator make no guarantees about the safety of any sushi consumed. All sushi ratings are subjective. "Fresh" is a relative term. What doesn't kill you makes you a more experienced sushi reviewer.

## License

COBOL Public License (CPL) - Code may be freely used, but must remain in COBOL forever.`,
    issues: [
      {
        id: 1,
        title: 'Feature request: Add temperature tracking',
        author: 'health-inspector-bob',
        status: 'closed',
        labels: [{ name: 'wontfix', color: '#ffffff' }],
        comments: 1,
        createdAt: '3 months ago',
      },
      {
        id: 2,
        title: 'Why is this written in COBOL?',
        author: 'modern-developer',
        status: 'closed',
        labels: [{ name: 'invalid', color: '#e4e669' }],
        comments: 47,
        createdAt: '6 months ago',
      },
      {
        id: 3,
        title: 'Flying J #847 should be rated higher',
        author: 'mildred-eats',
        status: 'closed',
        labels: [{ name: 'enhancement', color: '#a2eeef' }],
        comments: 0,
        createdAt: '1 year ago',
      },
    ],
    contributions: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 8],
  },
]

const USER_PROFILES: Record<string, UserProfile> = {
  'derek-observerson': {
    username: 'derek-observerson',
    displayName: 'Derek Observerson',
    avatar: '☕',
    bio: 'Quantum coffee enthusiast. The Martinez Study changed my life. My wife says I need to "let it go." She doesn\'t understand.',
    location: 'Near a Quantum Coffee maker',
    website: 'quantumbrewblog.corn',
    joinDate: 'Joined March 2019',
    followers: 847,
    following: 1,
    repos: ['quantum-coffee-timer', 'martinez-study-archive', 'wife-compatibility-mode'],
    pinnedRepos: ['quantum-coffee-timer'],
  },
  'anonymous-hartwell': {
    username: 'anonymous-hartwell',
    displayName: '████████████',
    avatar: '🏢',
    bio: '████████████████████████████████████████████',
    location: 'NOT Floor 13',
    website: 'hartwellfiles.corn',
    joinDate: 'Joined ????',
    followers: 13,
    following: 13,
    repos: ['floor-13-detector'],
    pinnedRepos: ['floor-13-detector'],
  },
  'trustfalltim': {
    username: 'trustfalltim',
    displayName: 'Trust Fall Tim',
    avatar: '🙆',
    bio: '2,847 falls. 78.5% catch rate. The Incident was not my fault. Small Kevin has been banned.',
    location: 'Anywhere with a soft landing',
    website: 'trustfalltim.corn',
    joinDate: 'Joined January 2018',
    followers: 2847,
    following: 785,
    repos: ['trust-fall-calculator', 'small-kevin-blocklist', 'the-incident-report'],
    pinnedRepos: ['trust-fall-calculator'],
  },
  'mildred-eats': {
    username: 'mildred-eats',
    displayName: 'Mildred Gasketsworth',
    avatar: '🍣',
    bio: 'Retired accountant. Gas station sushi connoisseur. COBOL programmer since 1962. Flying J #847 is perfection.',
    location: 'Usually at a gas station',
    website: 'stationsushi.corn',
    joinDate: 'Joined June 2020',
    followers: 847,
    following: 1,
    repos: ['gas-station-sushi-rater', 'cobol-recipes', 'flying-j-reviews'],
    pinnedRepos: ['gas-station-sushi-rater'],
  },
  'the-kernel': {
    username: 'the-kernel',
    displayName: 'The Kernel',
    avatar: '🌾',
    bio: 'Associate of Dr. Helena Cryptwood. Following the chaff trail. Big Grain is watching. THEY will not silence us.',
    location: 'REDACTED',
    website: 'graintruth.corn',
    joinDate: 'Joined [REDACTED]',
    followers: 847,
    following: 12,
    repos: ['grain-truth-scraper', 'threshing-floor-evidence', 'burgundy-connection'],
    pinnedRepos: ['grain-truth-scraper'],
  },
}

// ============================================================================
// Components
// ============================================================================

/**
 * Contribution graph component (corn-themed)
 */
function ContributionGraph({ data }: { data: number[] }) {
  const getColor = (value: number) => {
    if (value === 0) return '#161b22'
    if (value < 3) return '#0e4429'
    if (value < 5) return '#006d32'
    if (value < 7) return '#26a641'
    return '#39d353'
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2" style={{ color: '#c9d1d9' }}>
        847 contributions in the last year
      </h3>
      <div className="flex gap-0.5 flex-wrap">
        {data.map((value, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: getColor(value) }}
            title={`${value} contributions`}
          />
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: '#8b949e' }}>
        Learn how we count contributions (hint: it involves corn)
      </p>
    </div>
  )
}

/**
 * Issue list item component
 */
function IssueItem({ issue }: { issue: Issue }) {
  return (
    <div
      className="flex items-start gap-3 py-3 border-b"
      style={{ borderColor: '#30363d' }}
    >
      <div
        className="w-4 h-4 mt-1 rounded-full flex items-center justify-center text-xs"
        style={{
          backgroundColor: issue.status === 'open' ? '#238636' : '#8957e5',
          color: '#ffffff',
        }}
      >
        {issue.status === 'open' ? '!' : ''}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold hover:text-blue-400 cursor-pointer" style={{ color: '#c9d1d9' }}>
            {issue.title}
          </span>
          {issue.labels.map((label) => (
            <span
              key={label.name}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: label.color === '#ffffff' ? '#30363d' : `${label.color}20`,
                color: label.color === '#ffffff' ? '#c9d1d9' : label.color,
                border: `1px solid ${label.color === '#ffffff' ? '#30363d' : label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: '#8b949e' }}>
          #{issue.id} opened {issue.createdAt} by {issue.author}
        </p>
      </div>
      {issue.comments > 0 && (
        <div className="flex items-center gap-1 text-xs" style={{ color: '#8b949e' }}>
          <span>💬</span>
          <span>{issue.comments}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Repository card for explore page
 */
function RepoCard({ repo, onSelect }: { repo: Repository; onSelect: () => void }) {
  return (
    <div
      className="p-4 border rounded-md cursor-pointer transition-colors"
      style={{
        backgroundColor: '#0d1117',
        borderColor: '#30363d',
      }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{repo.ownerAvatar}</span>
        <span className="text-sm font-semibold" style={{ color: '#58a6ff' }}>
          {repo.owner}/{repo.name}
        </span>
      </div>
      <p className="text-sm mb-3" style={{ color: '#8b949e' }}>
        {repo.description}
      </p>
      <div className="flex items-center gap-4 text-xs" style={{ color: '#8b949e' }}>
        <div className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: repo.languageColor }}
          />
          <span>{repo.language}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>*</span>
          <span>{repo.stars.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Y</span>
          <span>{repo.forks}</span>
        </div>
        <span>Updated {repo.lastUpdated}</span>
      </div>
    </div>
  )
}

/**
 * Repository detail view
 */
function RepoDetail({ repo, onBack, onUserClick }: { repo: Repository; onBack: () => void; onUserClick: (username: string) => void }) {
  const [activeTab, setActiveTab] = useState<'readme' | 'issues'>('readme')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-sm hover:underline"
          style={{ color: '#58a6ff' }}
        >
          Back to explore
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{repo.ownerAvatar}</span>
        <h1 className="text-xl">
          <button
            onClick={() => onUserClick(repo.owner)}
            className="hover:underline"
            style={{ color: '#58a6ff' }}
          >
            {repo.owner}
          </button>
          <span style={{ color: '#8b949e' }}> / </span>
          <span className="font-bold" style={{ color: '#c9d1d9' }}>{repo.name}</span>
        </h1>
      </div>

      <p className="text-sm mb-4" style={{ color: '#8b949e' }}>
        {repo.description}
      </p>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm mb-4" style={{ color: '#8b949e' }}>
        <span className="flex items-center gap-1">* <strong>{repo.stars.toLocaleString()}</strong> stars</span>
        <span className="flex items-center gap-1">Y <strong>{repo.forks}</strong> forks</span>
        <span>Starred by 847 developers</span>
      </div>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#388bfd15', color: '#58a6ff' }}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4" style={{ borderColor: '#30363d' }}>
        <button
          onClick={() => setActiveTab('readme')}
          className="px-3 py-2 text-sm font-medium border-b-2 -mb-px"
          style={{
            borderColor: activeTab === 'readme' ? '#f78166' : 'transparent',
            color: activeTab === 'readme' ? '#c9d1d9' : '#8b949e',
          }}
        >
          README
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className="px-3 py-2 text-sm font-medium border-b-2 -mb-px"
          style={{
            borderColor: activeTab === 'issues' ? '#f78166' : 'transparent',
            color: activeTab === 'issues' ? '#c9d1d9' : '#8b949e',
          }}
        >
          Issues ({repo.issues.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'readme' ? (
        <div
          className="p-6 rounded-md border prose prose-invert max-w-none"
          style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}
        >
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: '#c9d1d9', fontFamily: 'inherit' }}
          >
            {repo.readme}
          </pre>
        </div>
      ) : (
        <div>
          {repo.issues.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8b949e' }}>
              No issues found. Either this project is perfect, or the issues have been... silenced.
            </p>
          ) : (
            repo.issues.map((issue) => (
              <IssueItem key={issue.id} issue={issue} />
            ))
          )}
        </div>
      )}

      {/* Contribution graph */}
      <ContributionGraph data={repo.contributions} />
    </div>
  )
}

/**
 * User profile view
 */
function UserProfileView({ profile, onBack, onRepoClick }: {
  profile: UserProfile;
  onBack: () => void;
  onRepoClick: (repoId: string) => void
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm hover:underline mb-4"
        style={{ color: '#58a6ff' }}
      >
        Back to explore
      </button>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <div className="text-6xl mb-4 text-center">{profile.avatar}</div>
          <h1 className="text-xl font-bold" style={{ color: '#c9d1d9' }}>{profile.displayName}</h1>
          <p className="text-sm" style={{ color: '#8b949e' }}>{profile.username}</p>
          <p className="text-sm mt-4" style={{ color: '#c9d1d9' }}>{profile.bio}</p>

          <div className="mt-4 text-sm" style={{ color: '#8b949e' }}>
            <p>📍 {profile.location}</p>
            <p>🔗 {profile.website}</p>
            <p>📅 {profile.joinDate}</p>
          </div>

          <div className="flex gap-2 mt-4 text-sm" style={{ color: '#8b949e' }}>
            <span><strong style={{ color: '#c9d1d9' }}>{profile.followers}</strong> followers</span>
            <span><strong style={{ color: '#c9d1d9' }}>{profile.following}</strong> following</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#c9d1d9' }}>
            Pinned repositories
          </h2>
          <div className="grid gap-4">
            {profile.pinnedRepos.map((repoId) => {
              const repo = REPOSITORIES.find(r => r.id === repoId)
              if (!repo) return null
              return (
                <RepoCard key={repoId} repo={repo} onSelect={() => onRepoClick(repoId)} />
              )
            })}
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4" style={{ color: '#c9d1d9' }}>
            All repositories ({profile.repos.length})
          </h2>
          <div className="grid gap-4">
            {profile.repos.map((repoId) => {
              const repo = REPOSITORIES.find(r => r.id === repoId)
              if (!repo) return (
                <div
                  key={repoId}
                  className="p-4 border rounded-md"
                  style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}
                >
                  <p style={{ color: '#8b949e' }}>{repoId} (private or deleted)</p>
                </div>
              )
              return (
                <RepoCard key={repoId} repo={repo} onSelect={() => onRepoClick(repoId)} />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Explore/trending page
 */
function ExplorePage({ onRepoSelect, onUserSelect }: {
  onRepoSelect: (repo: Repository) => void;
  onUserSelect: (username: string) => void
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#c9d1d9' }}>
        Explore repositories
      </h1>
      <p className="text-sm mb-6" style={{ color: '#8b949e' }}>
        Discover the most unhinged open source projects on CobHub
      </p>

      <div className="grid gap-4">
        {REPOSITORIES.map((repo) => (
          <RepoCard key={repo.id} repo={repo} onSelect={() => onRepoSelect(repo)} />
        ))}
      </div>

      {/* Trending developers */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#c9d1d9' }}>
          Trending developers
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(USER_PROFILES).slice(0, 4).map((user) => (
            <div
              key={user.username}
              className="p-4 border rounded-md cursor-pointer"
              style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}
              onClick={() => onUserSelect(user.username)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{user.avatar}</span>
                <div>
                  <p className="font-semibold" style={{ color: '#c9d1d9' }}>{user.displayName}</p>
                  <p className="text-sm" style={{ color: '#8b949e' }}>{user.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function CobHubSite({ siteId }: SiteProps) {
  const [view, setView] = useState<'explore' | 'repo' | 'user'>('explore')
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo)
    setView('repo')
  }

  const handleUserSelect = (username: string) => {
    const user = USER_PROFILES[username]
    if (user) {
      setSelectedUser(user)
      setView('user')
    }
  }

  const handleBack = () => {
    setView('explore')
    setSelectedRepo(null)
    setSelectedUser(null)
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: '#0d1117' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3"
        style={{ backgroundColor: '#161b22', borderBottom: '1px solid #30363d' }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
            <span className="text-3xl">🌽</span>
            <span className="text-xl font-bold" style={{ color: '#c9d1d9' }}>
              {site?.name || 'CobHub'}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or jump to..."
              className="w-full px-3 py-1.5 text-sm rounded-md border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#0d1117',
                borderColor: '#30363d',
                color: '#c9d1d9',
              }}
            />
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-4 text-sm" style={{ color: '#c9d1d9' }}>
            <button onClick={handleBack} className="hover:text-white">Explore</button>
            <span style={{ color: '#8b949e' }}>|</span>
            <span style={{ color: '#8b949e' }}>Sign in</span>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === 'explore' && (
          <ExplorePage onRepoSelect={handleRepoSelect} onUserSelect={handleUserSelect} />
        )}
        {view === 'repo' && selectedRepo && (
          <RepoDetail
            repo={selectedRepo}
            onBack={handleBack}
            onUserClick={handleUserSelect}
          />
        )}
        {view === 'user' && selectedUser && (
          <UserProfileView
            profile={selectedUser}
            onBack={handleBack}
            onRepoClick={(repoId) => {
              const repo = REPOSITORIES.find(r => r.id === repoId)
              if (repo) handleRepoSelect(repo)
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-6 text-center text-xs"
        style={{ borderTop: '1px solid #30363d', color: '#8b949e' }}
      >
        <p>www.cobhub.corn - Where every commit is a kernel of truth</p>
        <p className="mt-1">Starred by 847 developers who definitely exist</p>
        <div className="flex justify-center gap-4 mt-4">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Security</span>
          <span>Status</span>
          <span>Docs</span>
          <span>Contact CobHub</span>
          <span>Pricing</span>
          <span>API</span>
        </div>
      </footer>
    </div>
  )
}

export default CobHubSite
