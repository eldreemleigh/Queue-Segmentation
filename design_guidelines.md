# Queue Segmentation Generator - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design (Data-Dense Variant)

**Justification:** This is a productivity tool for workforce management with heavy data tables, forms, and real-time calculations. Material Design's robust data table patterns, clear hierarchy, and proven form components provide the optimal foundation for this utility-focused application.

**Core Principles:**
- Clarity and scannability for rapid data entry and review
- Efficient workflows with minimal friction
- Clear visual feedback for warnings and system states
- Professional enterprise aesthetic

---

## Typography

**Font Stack:** 
- Primary: 'Inter' or 'Roboto' from Google Fonts
- Fallback: system-ui, -apple-system, sans-serif

**Hierarchy:**
- Page Title (H1): 32px / font-semibold / tracking-tight
- Section Headings (H2): 24px / font-semibold / tracking-tight  
- Table Headers (TH): 14px / font-medium / uppercase / tracking-wide
- Body/Table Data: 15px / font-normal / leading-relaxed
- Helper Text: 13px / font-normal / opacity-70
- Buttons: 15px / font-medium / tracking-wide

---

## Layout System

**Spacing Units:** Use Tailwind units of **2, 4, 6, 8, 12, 16, 20** for consistency
- Component padding: p-6 or p-8
- Section spacing: mb-8 between major sections
- Table cell padding: p-4
- Input fields: p-3
- Button padding: px-6 py-3

**Container:**
- Max width: max-w-7xl
- Horizontal padding: px-6 md:px-8
- Centered: mx-auto

**Grid Layout:**
- Single column stack for all sections (tables need full width)
- Responsive tables scroll horizontally on mobile

---

## Component Library

### 1. Page Header
- Full-width banner with organization name "TEAM ABBEY"
- Subtitle explaining purpose
- Right-aligned action buttons (Export, Settings if needed)
- Border bottom for separation
- Padding: py-8 px-6

### 2. Section Cards
- Each major section in a distinct card container
- Rounded corners: rounded-xl
- Subtle shadow: shadow-sm with border
- Padding: p-8
- Margin between cards: mb-8
- Section number and title in card header

### 3. Data Tables

**Agent Attendance Table:**
- 4 columns: Full Name | Nickname | Rest Days | Status Dropdown
- Sticky header on scroll
- Row hover states for clarity
- Status dropdown: Full-width select with 7 options (PRESENT, OFF, ABSENT, PTO, RDOT, RD SWAP, SME)
- Action column with delete icon button (trash icon, only visible on hover)
- Add Agent button below table (outlined style)

**Required Headcount Table:**
- First column: Time slot (fixed width)
- 6 queue columns with number inputs (PM PGC, SV PGC, LV PGC, PM NPGC, SV NPGC, LV NPGC)
- Final column: Auto-calculated total (bold, read-only)
- Number inputs: w-20, centered text
- 9 time slot rows (10:00-11:00 through 6:00-7:00)

**Segmentation Output Table:**
- Time slot column
- Total required column
- 6 queue assignment columns showing assigned agent nicknames
- Multi-line cell content (stacked agent names)
- Warning rows: Full-width cell with alert styling when insufficient agents

**Assignment History Table:**
- Agent nickname column
- 6 queue columns showing assignment counts
- Total hours column (bold)
- Rows for unavailable agents shown with reduced opacity (opacity-40)

### 4. Forms & Inputs

**Text Inputs:**
- Height: h-11
- Rounded: rounded-lg
- Border: border with focus ring
- Padding: px-4

**Number Inputs (Headcount):**
- Compact sizing: w-20 h-10
- Centered text
- Border on all sides
- Spin buttons visible

**Dropdown Selects:**
- Match text input height: h-11
- Full width in table cells
- Chevron icon indicator

**Add Agent Form (Modal/Inline):**
- 3 fields: Full Name, Nickname, Rest Days (dropdown)
- Horizontal layout on desktop: grid-cols-3 gap-4
- Submit button: Primary style

### 5. Buttons

**Primary Action (Generate Segmentation):**
- Full width in container: w-full
- Height: h-14
- Large text: text-lg
- Rounded: rounded-lg
- Icon: Optional refresh/generate icon on left

**Secondary Actions:**
- Add Agent: Outlined style, h-11
- Delete Agent: Icon-only, ghost style, h-9 w-9, circular

**Button States:**
- Implement standard hover, active, focus states
- Disabled state with opacity-50 and cursor-not-allowed

### 6. Warning States

**Insufficient Agents Row:**
- Full table row span
- Distinct visual treatment (use semantic warning styling)
- Bold text with warning icon
- Shows: Time slot | Required count | Available count
- Padding: py-4

### 7. Empty States

**No Agents Present:**
- Centered message in output table
- Icon + text stack
- Helper text: "Set agent status to PRESENT to begin"

### 8. Responsive Behavior

**Desktop (lg:):**
- Tables display normally
- All columns visible

**Tablet (md:):**
- Tables remain scrollable horizontally
- Sticky first column for context

**Mobile (base):**
- Card padding reduced: p-4
- Table font size: text-sm
- Horizontal scroll with shadows indicating more content
- Sticky time/agent column

---

## Navigation & Actions

**Top Bar:**
- Sticky position during scroll
- Contains app title and global actions
- Height: h-16
- Z-index for proper layering

**Section Navigation:**
- Clear numbered sections (1. Attendance, 2. Required Headcount, etc.)
- Visual hierarchy with spacing creates natural flow
- Generate button prominently placed between input and output sections

---

## Interaction Patterns

**Data Entry Flow:**
1. Update attendance statuses
2. Enter required headcount per queue/timeslot
3. Click Generate button
4. Review segmentation output and history

**Real-time Updates:**
- Total columns auto-calculate on input change
- Assignment history updates after generation
- Warning rows appear dynamically

**Feedback:**
- Loading state on Generate button during calculation
- Success message (toast) after successful generation
- Error handling for edge cases

---

## Accessibility

- All form inputs have associated labels
- Table headers use proper semantic markup
- Color is not the sole indicator of status
- Focus states clearly visible on all interactive elements
- Sufficient contrast ratios for all text
- Keyboard navigation fully supported

---

## Performance Considerations

- Tables virtualized if agent list exceeds 50 rows
- Debounced input for headcount changes
- Client-side calculations for instant feedback
- Minimal re-renders on status changes