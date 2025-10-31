import { renderHook, act } from '@testing-library/react';
import { useViewPreference } from '@/hooks/useViewPreference';
import { ViewMode } from '@/lib/types/publications';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.history
const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockReplaceState,
  },
  writable: true,
});

describe('useViewPreference Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockReplaceState.mockClear();
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000/gallery/publications',
      search: '',
    };
  });

  test('initializes with default view mode (moderate)', () => {
    const { result } = renderHook(() => useViewPreference());

    expect(result.current.viewMode).toBe('moderate');
  });

  test('loads saved preference from localStorage', () => {
    localStorageMock.setItem('publicationViewMode', 'full');

    const { result } = renderHook(() => useViewPreference());

    // Wait for effect to run
    act(() => {
      // Effect runs on mount
    });

    expect(result.current.viewMode).toBe('full');
  });

  test('updates view mode and saves to localStorage', () => {
    const { result } = renderHook(() => useViewPreference());

    act(() => {
      result.current.updateViewMode('compact');
    });

    expect(result.current.viewMode).toBe('compact');
    expect(localStorageMock.getItem('publicationViewMode')).toBe('compact');
  });

  test('updates URL parameter when view mode changes', () => {
    const { result } = renderHook(() => useViewPreference());

    act(() => {
      result.current.updateViewMode('full');
    });

    expect(mockReplaceState).toHaveBeenCalled();
  });

  test('URL parameter overrides localStorage preference', () => {
    localStorageMock.setItem('publicationViewMode', 'moderate');

    // Mock URL with view parameter
    (window as any).location = {
      href: 'http://localhost:3000/gallery/publications?view=compact',
      search: '?view=compact',
    };

    const { result } = renderHook(() => useViewPreference({ urlParam: 'view' }));

    act(() => {
      // Effect runs on mount
    });

    expect(result.current.viewMode).toBe('compact');
  });

  test('ignores invalid view modes from localStorage', () => {
    localStorageMock.setItem('publicationViewMode', 'invalid' as ViewMode);

    const { result } = renderHook(() => useViewPreference());

    expect(result.current.viewMode).toBe('moderate'); // Should default
  });

  test('isClient flag is set after mount', () => {
    const { result } = renderHook(() => useViewPreference());

    act(() => {
      // Effect runs on mount
    });

    expect(result.current.isClient).toBe(true);
  });
});
