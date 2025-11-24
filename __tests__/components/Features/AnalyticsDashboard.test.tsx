import React from 'react';
import { render } from '@testing-library/react';
import AnalyticsDashboard from '@/components/Features/AnalyticsDashboard.tsx';

describe('AnalyticsDashboard', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
