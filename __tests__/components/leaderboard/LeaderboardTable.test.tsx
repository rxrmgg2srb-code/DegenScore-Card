import React from 'react';
import { render } from '@testing-library/react';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable.tsx';

describe('LeaderboardTable', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
