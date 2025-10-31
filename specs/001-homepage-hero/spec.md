# Homepage Hero Specification

## Overview

The Homepage Hero is the primary landing experience for MQ Studio, implementing the core "living studio" concept where visitors witness Moura's active practice across THINKING/FEELING/DOING simultaneously. This component serves as the architectural centerpiece that embodies the MQ Framework while providing three distinct entry paths into the site's content.

## Evidence & Source Notes

- [Summary 2025-09-08.brief.md, Constraints & Non-Negotiables] - MQ Framework implementation, color system, voice guidelines
- [Summary 2025-09-08.brief.md, Decisive Takeaways] - Homepage hero requirements, triadic entry points
- [The Designed Life.brief.md, Decisive Takeaways] - David partnership integration, policy studio methodology

## Functional Requirements

### Core Display Elements

The hero MUST simultaneously display three live content elements:

1. **Current Artwork** (FEELING pathway)
   - Latest watercolor painting or shufa calligraphy piece
   - High-resolution image with subtle drop shadow
   - Links to Artworks gallery with appropriate filter applied
   - Alt text describes artistic intent, not just visual appearance

2. **Recent Writing Excerpt** (THINKING pathway)
   - Snippet from latest publication, paper, or formal musing
   - 2-3 sentence excerpt with "Read more..." link
   - Links to Publications or Musings section
   - Shows publication date and type

3. **Today's Reflection** (DOING pathway)
   - Current micro-musing, work-in-progress note, or studio observation
   - Informal, present-tense voice showing active thinking
   - Links to About/Current Work or Musings section
   - May include audio snippet with accessible controls

### MQ Framework Integration

Each content element maps to the triadic framework:
- **THINKING (Head)**: Styled with Moura Teal (#00A8A8) and Scholar Blue (#2C5985)
- **FEELING (Heart)**: Styled with Living Pink (#E91E63) and Watercolor Violet
- **DOING (Hand)**: Styled with Spring Yellow (#F4B942) and Sage Wisdom (#7A9A82)

### Featured Resonance Component

Include dedicated space for demonstrating connections:
- "Currently exploring how..." introductory text
- Example: "This 1992 paper on public space suddenly speaks to yesterday's painting about boundaries..."
- Subtle connecting lines or visual cues between related elements
- May be placeholder in initial implementation

## Visual Design Requirements

### Color System Compliance

- **Primary Background**: Rice Paper (#FDFCF8) with subtle watercolor paper texture
- **Primary CTAs**: Moura Teal (#00A8A8) for main navigation and entry points
- **Accent Distribution**: 60% Rice Paper, 20% Moura Teal, 10% Living Pink & Spring Yellow, 5% Shufa Red, 5% supporting colors
- **Shufa Red Usage**: Only for MQ seal/signature moments - NOT for general UI elements

### Typography Standards

- **Headlines/Titles**: Montserrat, font-weight: 500
- **Body Text**: Lora, font-weight: 400
- **Navigation Elements**: Montserrat
- **Marginalia**: Lora italic for David's quotes

### Accessibility Requirements

- **Contrast Minimum**: 4.5:1 ratio for all text elements
- **Focus Indicators**: High-contrast ring using `--ring: #00A8A8`
- **Screen Reader Support**: Semantic HTML structure with proper ARIA labels
- **Keyboard Navigation**: Tab order follows logical content flow
- **Audio Controls**: If present, must include captions/transcripts and accessible player controls

## David's Presence Integration

### Marginalia Implementation

- At least one quote from David appears as margin annotation
- Desktop: Right rail positioning with connecting line to relevant content
- Mobile: Callout block within content flow
- Styling: Scholar Blue (#2C5985) with subtle background
- Format: Italicized quote with attribution "— David Fushtey"

### Integration Approach

- David's systematic thinking complements Moura's fluid expression
- Quotes relate contextually to displayed content
- NO separate "David's section" - woven throughout naturally
- Governance principles annotate current work where relevant

## Responsive Behavior

### Desktop Layout (≥1024px)
- Three-column grid for triadic elements
- Marginalia in right rail
- Featured resonance spans multiple columns
- Hover states with 10% color lightening

### Tablet Layout (768px-1023px)
- Two-column grid with third element below
- Marginalia integrated as callout blocks
- Maintain visual hierarchy and color coding

### Mobile Layout (<768px)
- Single column stack
- Elements maintain distinct identity through color/typography
- Marginalia becomes inline callouts
- Touch targets minimum 44px

## Seasonal Adaptation

Support for subtle seasonal shifts:
- **Spring**: Watercolor washes more prominent
- **Summer**: Brighter accent colors from paintings
- **Fall**: Calligraphy/shufa more prominent
- **Winter**: Deeper reflections, more text-heavy content

Implementation may be manual curation initially, with automated system later.

## Voice & Content Guidelines

### Tone Requirements

All hero content must feel:
- **Invitational**: "I've been wondering about..."
- **Exploratory**: "What if we consider..."
- **Grateful**: "Thanks to a conversation with..."
- **Uncertain**: "I'm not sure yet, but..."
- **Connective**: "This reminds me of what David used to say..."

### Content Strategy

- Show work in progress, not just finished pieces
- Include questions without answers
- Date everything to show evolution
- Feature "failed experiments" alongside successes
- Maintain "wondering together" collaborative feel

## Technical Implementation Notes

### Component Structure
```jsx
<HeroSection>
  <HeroContent>
    <ThinkingElement /> // Recent writing
    <FeelingElement />  // Current artwork
    <DoingElement />    // Today's reflection
  </HeroContent>
  <ResonanceFeature />
  <Marginalia quotes={davidQuotes} />
</HeroSection>
```

### State Management
- Track which content is currently featured
- Handle seasonal theming variables
- Manage audio player state if present
- Analytics tracking for entry point selection

### Performance Considerations
- Optimize artwork images for web display
- Lazy load non-critical elements
- Ensure fast initial paint for hero content
- Progressive enhancement for advanced features

## Testing Assertions

For integration with `npx speckit check` and Stagehand tests:

### Core Concept Alignment Tests
- [ ] Hero introduces "MQ Studio" terminology prominently
- [ ] "Experiences, Experiments, Rough Drafts & Finished Works" appears in hero content
- [ ] Three distinct MQ Framework pathways are visually identifiable
- [ ] Voice samples match invitational/exploratory tone requirements

### Functional Display Tests
- [ ] Three content elements are simultaneously visible on desktop
- [ ] Each element has functional link to appropriate section
- [ ] Artwork displays with proper alt text format
- [ ] Writing excerpt includes "Read more..." functionality
- [ ] Reflection content uses present-tense, informal voice

### Visual Design System Tests
- [ ] Moura Teal (#00A8A8) is primary CTA color
- [ ] Living Pink (#E91E63) appears in feeling-related elements
- [ ] Scholar Blue (#2C5985) appears in thinking-related elements
- [ ] Rice Paper (#FDFCF8) is primary background
- [ ] Shufa Red (#8D2305) appears only in signature moments
- [ ] Montserrat used for all headings
- [ ] Lora used for all body text
- [ ] All text meets 4.5:1 contrast minimum

### Responsive & Accessibility Tests
- [ ] Mobile layout maintains triadic identity without loss
- [ ] Marginalia reflows to callout blocks on mobile
- [ ] Hover states lighten by ≤10% consistently
- [ ] Focus indicators visible with --ring color
- [ ] Screen reader announces semantic structure correctly
- [ ] Keyboard navigation follows logical tab order
- [ ] Audio controls (if present) include transcripts

### David Integration Tests
- [ ] At least one David quote appears as marginalia
- [ ] Quote styling uses Scholar Blue with italic formatting
- [ ] Desktop marginalia positioned in right rail
- [ ] Mobile marginalia integrated as callout blocks
- [ ] No separate "David section" exists in hero

## ✅ Homepage Hero Acceptance Checklist

### Core Concept Alignment
- [ ] Hero introduces MQ Studio as a living studio, not a static portfolio
- [ ] Hero clearly communicates Experiences, Experiments, Rough Drafts & Finished Works as the site's ethos
- [ ] Hero embodies the MQ Framework (THINKING / FEELING / DOING) with three distinct but interconnected entryways
- [ ] Hero voice feels invitational, exploratory, grateful, uncertain, and connective (tone: "Wondering Together")

### Functional Display
- [ ] Hero simultaneously displays three live elements:
  - [ ] Current artwork (painting or calligraphy)
  - [ ] Recent writing excerpt (publication or musing)
  - [ ] Today's reflection (short text or micro-musing)
- [ ] Each element links to its relevant section (Artworks, Publications/Musings, or About/Reflections)
- [ ] Featured resonance example (conceptual, temporal, or material) is included or has a placeholder slot

### Visual & Design System
- [ ] Uses Moura Teal (#00A8A8) as primary CTA/navigation color
- [ ] Uses Living Pink (#E91E63) and Scholar Blue (#2C5985) as supporting colors in alignment with MQ Framework (heart/head)
- [ ] Applies Rice Paper (#FDFCF8) as the main background and includes subtle watercolor paper texture
- [ ] Shufa Red (#8D2305) appears only in signature/anchor moments (e.g., MQ seal)
- [ ] Typography follows design system: Montserrat (headings) and Lora (body text)
- [ ] Contrast ratio meets WCAG minimum 4.5:1 for all text

### Interaction & Responsiveness
- [ ] Hero adapts cleanly to mobile layouts, ensuring marginalia and triadic entry points reflow without loss
- [ ] Hover and tap states are gentle (≤10% lightening) and consistent with design system
- [ ] Seasonal visual shifts (spring/summer/fall/winter) are supported or stubbed for later implementation

### Integration of David's Presence
- [ ] At least one marginalia quote from David appears in or near hero content, styled as annotation rather than separate block
- [ ] Hero conveys integration of David's systematic thinking with Moura's fluid expression, not siloed content

### Accessibility
- [ ] All hero images have alt text that describes intent, not just appearance (e.g., "Watercolour expressing emergence")
- [ ] Audio or video snippets (if used in hero) provide captions/transcripts
- [ ] Marginalia and resonance features are screen-reader accessible

---

**Implementation Priority**: CRITICAL - This component establishes the entire site's conceptual foundation and user entry experience.

**Dependencies**: Design system CSS variables, content management system for live updates, image optimization pipeline.

**Success Metrics**: User engagement with triadic entry points, time spent exploring interconnected content, qualitative feedback on "living studio" feel.

## 🔎 Deferred / Open Questions

These specification items remain unresolved and could significantly affect implementation if clarified. They're intentionally not locked in yet:

| Area | Question | Why It Matters / Where It Affects |
|------|----------|-----------------------------------|
| **Resonance Engine Complexity** | What level of "resonance engine" sophistication do we include in MVP vs later? For now, is it a static example, dynamic component, or fully content-driven? | Affects performance, data modeling, component complexity, dependencies. |
| **Seasonal Visual or Content Shifts** | Do we implement seasonal theme/color shifts now, or defer to future versions? What assets/styles will vary per season? | Impacts design tokens, CSS setup, possibly component re-rendering. |
| **Mobile Marginalia / Layout Reflow** | How exactly should marginalia reflow on small screens? E.g. shrink to annotation, collapse, overlay, or hide? | Necessitates responsive design rules and spec for small breakpoints. |
| **Publications Filtering Taxonomy** | How deep will the filtering taxonomy be (e.g. by year / topic / medium)? Do we allow nested filters now? | Impacts content model, UI controls, data fetch performance. |
| **Accessibility for Audio / Multimedia in Hero** | If hero includes audio or multimedia, what specific a11y support (captions, transcripts, controls) is required now? | Influences component props and testing. |
| **Quotations / Marginalia Source Rights** | For quotes from "David," are we certain of rights and usage, or do we need fallback content? | Legal and content governance issue. |
| **Search vs Browse Navigation Balance** | Is the navigation focused predominantly on browsing (hierarchical) or search (filter + query)? What's the design preference for homepage-level CTA? | Changes homepage layout and linking strategy. |

### Priority Decisions Required

**Before Development Starts:**
- Resonance Engine: Start with static examples (2-3 curated connections)
- Marginalia Rights: Verify permissions for David's quotes immediately
- Audio Accessibility: Full a11y required (transcripts, captions, keyboard controls)

**Before Content Modeling:**
- Publications Taxonomy: Simple single-level filters (Type, Year, Topic with 5-7 tags max)
- Search vs Browse: Browse-first approach with exploratory CTAs

**Can Defer to Post-MVP:**
- Seasonal Shifts: Manual curation initially, CSS custom properties for future theming