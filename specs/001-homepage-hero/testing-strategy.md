# Homepage Hero Testing Strategy

## Multi-Layer Test Architecture

### Layer 1: Unit/Component Tests (Jest + RTL)
**Purpose**: Fast feedback during development, component isolation
**Technology**: Jest + React Testing Library + jest-axe
**Based on**: ChatGPT's suggestions with our spec requirements

```bash
npm test src/components/Hero.test.js
```

**Coverage**:
- Component renders without crashing
- Required elements are present simultaneously
- Data-testid attributes exist for integration points
- Basic accessibility violations (axe)
- Design token compliance (if tokens exported)

### Layer 2: Integration Tests (Stagehand)
**Purpose**: Real browser behavior, cross-browser validation, visual testing
**Technology**: Playwright + Stagehand
**Based on**: Our existing `tests.md` specification

```bash
npx playwright test tests/homepage-hero.test.js
```

**Coverage**:
- Actual color rendering and contrast ratios
- Real responsive behavior across breakpoints
- Keyboard navigation and focus management
- Performance metrics (load times, CLS)
- Cross-browser compatibility

### Layer 3: Visual Regression (Optional)
**Purpose**: Catch unintended visual changes
**Technology**: Playwright + Percy/Chromatic

```bash
npx percy exec -- playwright test
```

## Recommended Implementation

### 1. Adopt ChatGPT's Jest Structure with Our Requirements

```javascript
// tests/unit/Hero.test.js (ChatGPT's approach + our spec)
import { TOKENS } from '../../src/design/tokens';
import Hero from '../../src/components/Hero';

describe('Homepage Hero — Component Contract', () => {
  // ChatGPT's tests + our specific requirements:

  test('MQ Framework color mapping', () => {
    renderHero();
    const thinking = screen.getByTestId('hero-cta-thinking');
    const feeling = screen.getByTestId('hero-cta-feeling');
    const doing = screen.getByTestId('hero-cta-doing');

    // Our spec requires specific color mapping
    expect(thinking).toHaveAttribute('data-theme', 'thinking'); // Teal
    expect(feeling).toHaveAttribute('data-theme', 'feeling');   // Pink
    expect(doing).toHaveAttribute('data-theme', 'doing');       // Yellow
  });

  test('voice tone validation', () => {
    renderHero();
    const heroContent = screen.getByTestId('hero').textContent;

    // Our spec requires specific voice patterns
    const invitationalWords = ['wondering', 'exploring', 'consider', 'conversation'];
    const hasInvitationalTone = invitationalWords.some(word =>
      heroContent.toLowerCase().includes(word)
    );
    expect(hasInvitationalTone).toBe(true);
  });

  test('David marginalia integration (not separation)', () => {
    renderHero();
    const marginalia = screen.getByTestId('hero-marginalia');

    // Our spec: David integrated, not siloed
    expect(marginalia).toHaveAttribute('data-integration', 'marginalia');
    expect(screen.queryByTestId('david-section')).toBeNull();
  });
});
```

### 2. Enhanced Design Token Validation

```typescript
// src/design/tokens.ts (expanded from ChatGPT's suggestion)
export const TOKENS = {
  colors: {
    // Exact values from our spec
    mouraTeal: '#00A8A8',
    livingPink: '#E91E63',
    scholarBlue: '#2C5985',
    springYellow: '#F4B942',
    ricePaper: '#FDFCF8',
    shufaRed: '#8D2305',
  },
  fonts: {
    heading: 'Montserrat',
    body: 'Lora',
  },
  // Our spec additions
  mqFramework: {
    thinking: { primary: '#00A8A8', secondary: '#2C5985' },
    feeling: { primary: '#E91E63', secondary: '#8B7BAE' },
    doing: { primary: '#F4B942', secondary: '#7A9A82' },
  },
  accessibility: {
    minContrastRatio: 4.5,
    focusRing: '#00A8A8',
  },
};
```

### 3. Component Requirements (data-testids)

```jsx
// Required attributes for both test layers
<section
  data-testid="hero"
  data-bg-token="ricePaper"
  data-layout="triad" // CSS toggles: triad|stacked
  role="banner"
  aria-label="Today at MQ Studio"
>
  <div data-testid="hero-artwork" data-theme="feeling">
    <img alt="Watercolor expressing emergence through fluid boundaries" />
  </div>

  <div data-testid="hero-writing" data-theme="thinking">
    <p>Recent excerpt with "Read more..." link</p>
  </div>

  <div data-testid="hero-reflection" data-theme="doing">
    <p>Today's micro-musing in present tense...</p>
  </div>

  <div data-testid="hero-resonance">
    <p>Currently exploring how...</p>
  </div>

  <aside data-testid="hero-marginalia" data-integration="marginalia">
    <blockquote>"David's systematic thinking..." — David Fushtey</blockquote>
  </aside>
</section>
```

## Test Execution Strategy

### Development Workflow
```bash
# Fast feedback during development
npm run test:unit

# Full validation before PR
npm run test:integration

# Complete acceptance testing
npm run test:hero:full
```

### CI/CD Integration
```yaml
# .github/workflows/hero-validation.yml
name: Hero Component Validation
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit

  browser-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/homepage-hero.test.js

  acceptance-validation:
    needs: [unit-tests, browser-tests]
    runs-on: ubuntu-latest
    steps:
      - run: npx speckit check --spec=001-homepage-hero
```

## Benefits of This Hybrid Approach

### Fast Development Cycle
- Jest tests run in <1s for immediate feedback
- Stagehand tests validate real browser behavior
- Visual tests catch regression issues

### Complete Coverage
- **Unit**: Component contract and token compliance
- **Integration**: Real user interactions and performance
- **Visual**: Design system consistency

### Maintainable
- Clear separation of concerns
- Each layer tests what it's best at
- Shared data-testid contracts between layers

---

**Recommendation**: Implement ChatGPT's Jest approach as Layer 1, keep our Stagehand tests as Layer 2, and use both together for comprehensive validation.