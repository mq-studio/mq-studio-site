import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewSwitcher from '@/components/publications/ViewSwitcher';
import { ViewMode } from '@/lib/types/publications';

describe('ViewSwitcher Component', () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
  });

  test('renders all three view mode buttons', () => {
    render(<ViewSwitcher currentView="moderate" onViewChange={mockOnViewChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  test('highlights the current view mode', () => {
    render(<ViewSwitcher currentView="full" onViewChange={mockOnViewChange} />);

    const fullButton = screen.getByLabelText(/full view/i);
    expect(fullButton).toHaveClass('bg-[var(--scholar-blue)]');
    expect(fullButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('calls onViewChange when clicking a different view', () => {
    render(<ViewSwitcher currentView="moderate" onViewChange={mockOnViewChange} />);

    const fullButton = screen.getByLabelText(/full view/i);
    fireEvent.click(fullButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('full');
  });

  test('calls onViewChange with compact when clicking compact view', () => {
    render(<ViewSwitcher currentView="moderate" onViewChange={mockOnViewChange} />);

    const compactButton = screen.getByLabelText(/compact view/i);
    fireEvent.click(compactButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('compact');
  });

  test('has proper ARIA labels for accessibility', () => {
    render(<ViewSwitcher currentView="moderate" onViewChange={mockOnViewChange} />);

    expect(screen.getByLabelText(/full view - single column with all details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/moderate view - three columns grid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/compact view - multiple columns with minimal details/i)).toBeInTheDocument();
  });

  test('has proper role for button group', () => {
    const { container } = render(<ViewSwitcher currentView="moderate" onViewChange={mockOnViewChange} />);

    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Publication view mode selector');
  });
});
