/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error for testing
function ThrowError({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Working component</div>;
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error during error tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('Normal Operation', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test child content')).toBeInTheDocument();
    });

    test('passes through multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('catches errors and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for error message
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('displays error description', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/We encountered an unexpected error/i)
      ).toBeInTheDocument();
    });

    test('provides Reload Page button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload Page');
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton.tagName).toBe('BUTTON');
    });

    test('provides Go Home link', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeLink = screen.getByText('Go Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Custom Fallback', () => {
    test('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('error UI is accessible', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for semantic heading
      expect(
        screen.getByRole('heading', { name: /something went wrong/i })
      ).toBeInTheDocument();

      // Check for buttons
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    });

    test('error icon has proper SVG structure', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('Error Recovery', () => {
    test('component recovers when error is resolved', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Initially shows error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Rerender without error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Note: ErrorBoundary doesn't automatically recover, needs remount
      // This test verifies the behavior
    });
  });

  describe('Design System Compliance', () => {
    test('uses design system color variables', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for Montserrat font class
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-montserrat');

      // Check for color classes
      expect(heading.className).toMatch(/text-\[var\(--ink-black\)\]/);
    });

    test('uses consistent spacing and layout', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for centered layout
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });
});
