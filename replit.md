# Team Abbey Queue Segmentation Generator

## Overview
A queue segmentation generator application for Team Abbey that automatically assigns agents to different queues based on attendance, break times, headcount requirements, and productivity metrics. The system provides fair, randomized hourly segmentation while considering queue difficulty rankings and productivity quotas.

## Recent Changes
- **December 2024**: Added Team Productivity section with queue quotas table
  - Added target quota and hourly quota display for all 6 queue types
  - Integrated quota-based weighting into segmentation algorithm
  - Queue difficulty ranking: LV PGC (Hardest) → SV PGC → PM PGC → LV NPGC → PM NPGC → SV NPGC (Easiest)
  - Abbeyngers logo set as permanent team logo

## Queue Quotas
| Queue Type | Target Quota | Hourly Quota |
|------------|--------------|--------------|
| SV PGC (SHORT_VideoPGC) | 400 | 53 |
| SV NPGC (SHORT_Video_NON_PGC) | 400 | 53 |
| LV PGC (LONG_Video_PGC) | 300 | 40 |
| LV NPGC (LONG_Video_NON_PGC) | 300 | 40 |
| PM PGC | 600 | 80 |
| PM NPGC | 600 | 80 |

## Segmentation Algorithm
The algorithm assigns agents to queues using the following priority:
1. Assigns queues in difficulty order (hardest first)
2. For hard queues: prioritizes agents with fewer hard queue assignments
3. Uses hourly quota as weighting factor - lower quota = more "credit" per assignment
4. Balances total assignments across agents
5. Random tiebreaker for fairness

## Project Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js
- **Data Storage**: In-memory with localStorage persistence
- **Daily Reset**: 10 PM PHT clears all session data

## Key Files
- `client/src/pages/Home.tsx` - Main application page with segmentation logic
- `client/src/components/ProductivitySection.tsx` - Productivity quota table and difficulty ranking
- `client/src/lib/types.ts` - Type definitions and queue quotas data
- `client/src/components/PageHeader.tsx` - Header with team logo

## User Preferences
- All interactive elements require `data-testid` attributes
- No emojis in UI
- LV PGC is the hardest queue, SV NPGC is the easiest
