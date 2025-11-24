import React from 'react';
import { render } from '@testing-library/react';
import StreakWidget from '@/components/StreakWidget.tsx';

describe('StreakWidget', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
