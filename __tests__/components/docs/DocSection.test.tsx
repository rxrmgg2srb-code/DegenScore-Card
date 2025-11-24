import React from 'react';
import { render } from '@testing-library/react';
import DocSection from '@/components/docs/DocSection.tsx';

describe('DocSection', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
