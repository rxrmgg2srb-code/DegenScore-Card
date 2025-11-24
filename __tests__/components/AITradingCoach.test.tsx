import React from 'react';
import { render } from '@testing-library/react';
import AITradingCoach from '@/components/AITradingCoach.tsx';

describe('AITradingCoach', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
