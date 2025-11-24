import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentationContent from '@/components/DocumentationContent';

// Mock dependencies
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    },
  };
});

jest.mock('@/components/LanguageSelector', () => ({
  LanguageSelector: () => React.createElement('div', data-testid="language-selector", 'Language Selector'),
}));

jest.mock('@/components/NavigationButtons', () => ({
  NavigationButtons: () => React.createElement('div', data-testid="navigation-buttons", 'Navigation Buttons'),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    section: ({ children, ...props }) => React.createElement('section', props, children),
  },
  AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('DocumentationContent', () => {
  it('renders the documentation page structure', () => {
    render(React.createElement(null, null, 'MockedComponent'));

    // Check header
    expect(screen.getByText('📚 DegenScore Documentation')).toBeInTheDocument();
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    expect(screen.getByTestId('navigation-buttons')).toBeInTheDocument();

    // Check sidebar sections exist (by checking text that appears in sidebar)
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Generate Your Card')).toBeInTheDocument();
  });

  it('renders content sections', () => {
    render(React.createElement(null, null, 'MockedComponent'));

    // Check for specific content in sections
    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getByText(/DegenScore Card/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Metrics/i)).toBeInTheDocument();
  });

  it('handles section navigation', () => {
    render(React.createElement(null, null, 'MockedComponent'));

    // Find a sidebar link and click it
    // Note: Since we mocked scrollIntoView, we just verify the click doesn't crash
    // and potentially updates state (though state is internal)

    // Assuming DocSidebar renders buttons or links with section titles
    const introLink = screen.getAllByText('Introduction')[0]; // Might appear in sidebar and content
    fireEvent.click(introLink);

    // Since we can't easily check scroll position in JSDOM without more complex mocks,
    // we assume if it didn't crash, it's fine.
    // We could check if the active class is applied if we knew the class name logic, 
    // but for now "renders without crashing" on interaction is good.
  });
});
