/**
 * Unit tests for Hero component
 * Tests aligned to specs/001-homepage-hero/spec.md acceptance criteria
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Hero } from '../../src/components/Hero';
import { TOKENS } from '../../src/design/tokens';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Hero Component', () => {
  describe('Core Structure and Accessibility', () => {
    test('renders hero region with proper aria-label', () => {
      render(<Hero />);

      const heroRegion = screen.getByRole('region', { name: 'Today at MQ Studio' });
      expect(heroRegion).toBeInTheDocument();
      expect(heroRegion).toHaveAttribute('data-testid', 'hero');
      expect(heroRegion).toHaveAttribute('aria-label', 'Today at MQ Studio');
    });

    test('has required data attributes for layout and background', () => {
      render(<Hero />);

      const heroRegion = screen.getByTestId('hero');
      expect(heroRegion).toHaveAttribute('data-layout', 'triad');
      expect(heroRegion).toHaveAttribute('data-bg-token', 'ricePaper');
    });

    test('has no critical accessibility violations', async () => {
      const { container } = render(<Hero />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Triadic Content Elements', () => {
    test('displays three simultaneous content zones', () => {
      render(<Hero />);

      // All three content elements should be present simultaneously
      const artworkElement = screen.getByTestId('hero-artwork');
      const writingElement = screen.getByTestId('hero-writing');
      const reflectionElement = screen.getByTestId('hero-reflection');

      expect(artworkElement).toBeInTheDocument();
      expect(writingElement).toBeInTheDocument();
      expect(reflectionElement).toBeInTheDocument();
    });

    test('each content zone has proper linking structure', () => {
      render(<Hero />);

      // Each zone should be wrapped in a link
      const artworkLink = screen.getByLabelText('View current artwork in gallery');
      const writingLink = screen.getByLabelText('Read recent writing in publications');
      const reflectionLink = screen.getByLabelText('Explore current reflections and musings');

      expect(artworkLink).toHaveAttribute('href', '/artworks');
      expect(writingLink).toHaveAttribute('href', '/publications');
      expect(reflectionLink).toHaveAttribute('href', '/musings');
    });

    test('artwork has meaningful alt text for role="img"', () => {
      render(<Hero />);

      const artworkImage = screen.getByRole('img');
      expect(artworkImage).toHaveAttribute('aria-label', 'Watercolour expressing emergence and connection through flowing blues and teals');
    });
  });

  describe('Triadic CTAs', () => {
    test('displays all three triadic CTAs', () => {
      render(<Hero />);

      const thinkingCTA = screen.getByTestId('hero-cta-thinking');
      const feelingCTA = screen.getByTestId('hero-cta-feeling');
      const doingCTA = screen.getByTestId('hero-cta-doing');

      expect(thinkingCTA).toBeInTheDocument();
      expect(feelingCTA).toBeInTheDocument();
      expect(doingCTA).toBeInTheDocument();
    });

    test('CTAs are focusable and have proper aria-labels', () => {
      render(<Hero />);

      const thinkingCTA = screen.getByTestId('hero-cta-thinking');
      const feelingCTA = screen.getByTestId('hero-cta-feeling');
      const doingCTA = screen.getByTestId('hero-cta-doing');

      expect(thinkingCTA).toHaveAttribute('aria-label', 'Explore thinking pathway - governance papers and intellectual work');
      expect(feelingCTA).toHaveAttribute('aria-label', 'Explore feeling pathway - watercolours and artistic expressions');
      expect(doingCTA).toHaveAttribute('aria-label', 'Explore doing pathway - calligraphy and creative practice');

      // Test focusability
      thinkingCTA.focus();
      expect(document.activeElement).toBe(thinkingCTA);
    });

    test('CTAs meet minimum touch target size', () => {
      render(<Hero />);

      const thinkingCTA = screen.getByTestId('hero-cta-thinking');
      const computedStyle = window.getComputedStyle(thinkingCTA);

      // Check minimum 44px touch target
      expect(computedStyle.minWidth).toBe('44px');
      expect(computedStyle.minHeight).toBe('44px');
    });
  });

  describe('Resonance and Marginalia', () => {
    test('includes resonance slot with proper content', () => {
      render(<Hero />);

      const resonanceSlot = screen.getByTestId('hero-resonance');
      expect(resonanceSlot).toBeInTheDocument();

      // Check for "Currently exploring how..." header
      expect(screen.getByText('Currently exploring how...')).toBeInTheDocument();

      // Check for example resonance content
      expect(screen.getByText(/This 1992 paper on public space governance/)).toBeInTheDocument();
    });

    test('includes marginalia slot with David quote', () => {
      render(<Hero />);

      const marginaliaSlot = screen.getByTestId('hero-marginalia');
      expect(marginaliaSlot).toBeInTheDocument();

      // Check for David's quote
      expect(screen.getByText(/The most systematic approach sometimes reveals/)).toBeInTheDocument();
      expect(screen.getByText('— David Fushtey')).toBeInTheDocument();
    });
  });

  describe('Design System Compliance', () => {
    test('design tokens are properly imported and accessible', () => {
      // Test that TOKENS object contains expected color values
      expect(TOKENS.colors.mouraTeal).toBe('#00A8A8');
      expect(TOKENS.colors.livingPink).toBe('#E91E63');
      expect(TOKENS.colors.scholarBlue).toBe('#2C5985');
      expect(TOKENS.colors.ricePaper).toBe('#FDFCF8');
      expect(TOKENS.colors.shufaRed).toBe('#8D2305');
    });

    test('hero applies Rice Paper background token', () => {
      render(<Hero />);

      const heroRegion = screen.getByTestId('hero');
      expect(heroRegion).toHaveAttribute('data-bg-token', 'ricePaper');

      // Check computed style uses token value
      const computedStyle = window.getComputedStyle(heroRegion);
      expect(computedStyle.backgroundColor).toBe('rgb(253, 252, 248)'); // #FDFCF8 in RGB
    });

    test('typography uses design system fonts', () => {
      render(<Hero />);

      const heroRegion = screen.getByTestId('hero');
      const computedStyle = window.getComputedStyle(heroRegion);

      // Hero should use body font (Lora)
      expect(computedStyle.fontFamily).toContain('Lora');
    });

    test('MQ Framework colors are applied correctly', () => {
      render(<Hero />);

      // THINKING (Scholar Blue)
      const thinkingCTA = screen.getByTestId('hero-cta-thinking');
      const thinkingStyle = window.getComputedStyle(thinkingCTA);
      expect(thinkingStyle.backgroundColor).toBe('rgb(44, 89, 133)'); // #2C5985

      // FEELING (Living Pink)
      const feelingCTA = screen.getByTestId('hero-cta-feeling');
      const feelingStyle = window.getComputedStyle(feelingCTA);
      expect(feelingStyle.backgroundColor).toBe('rgb(233, 30, 99)'); // #E91E63

      // DOING (Moura Teal)
      const doingCTA = screen.getByTestId('hero-cta-doing');
      const doingStyle = window.getComputedStyle(doingCTA);
      expect(doingStyle.backgroundColor).toBe('rgb(0, 168, 168)'); // #00A8A8
    });
  });

  describe('Content and Voice Requirements', () => {
    test('displays invitational and exploratory tone', () => {
      render(<Hero />);

      // Check for exploratory language
      expect(screen.getByText(/I'm noticing how yesterday's conversation/)).toBeInTheDocument();
      expect(screen.getByText(/Current work-in-progress/)).toBeInTheDocument();
    });

    test('shows work in progress rather than finished pieces', () => {
      render(<Hero />);

      // Check for work-in-progress indicators
      expect(screen.getByText(/Current work-in-progress • September 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Latest piece exploring/)).toBeInTheDocument();
    });

    test('demonstrates connective thinking', () => {
      render(<Hero />);

      // Check for connections between different elements
      expect(screen.getByText(/This 1992 paper on public space governance suddenly speaks to yesterday's painting/)).toBeInTheDocument();
      expect(screen.getByText(/conversation with David about systematic approaches suddenly illuminates/)).toBeInTheDocument();
    });
  });

  describe('Accessibility Standards', () => {
    test('all interactive elements have accessible names', () => {
      render(<Hero />);

      // Check all links have accessible names
      const artworkLink = screen.getByLabelText('View current artwork in gallery');
      const writingLink = screen.getByLabelText('Read recent writing in publications');
      const reflectionLink = screen.getByLabelText('Explore current reflections and musings');

      expect(artworkLink).toBeInTheDocument();
      expect(writingLink).toBeInTheDocument();
      expect(reflectionLink).toBeInTheDocument();
    });

    test('semantic HTML structure is used', () => {
      render(<Hero />);

      // Check for proper semantic elements
      const region = screen.getByRole('region');
      const headings = screen.getAllByRole('heading');
      const links = screen.getAllByRole('link');
      const buttons = screen.getAllByRole('button');

      expect(region).toBeInTheDocument();
      expect(headings).toHaveLength(4); // Current Artwork, Recent Writing, Today's Reflection, Currently exploring how...
      expect(links).toHaveLength(3); // Three content zone links
      expect(buttons).toHaveLength(3); // Three CTA buttons
    });

    test('marginalia and resonance are screen reader accessible', () => {
      render(<Hero />);

      const resonance = screen.getByTestId('hero-resonance');
      const marginalia = screen.getByTestId('hero-marginalia');

      // Should be in the accessibility tree
      expect(resonance).toBeInTheDocument();
      expect(marginalia).toBeInTheDocument();

      // Content should be readable by screen readers
      expect(screen.getByText('Currently exploring how...')).toBeInTheDocument();
      expect(screen.getByText(/The most systematic approach/)).toBeInTheDocument();
    });
  });
});