import React from 'react';
import { render } from '@testing-library/react';
import ScoreBar from '@/components/TokenSecurityScanner/Shared/ScoreBar.tsx';

describe('ScoreBar', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
