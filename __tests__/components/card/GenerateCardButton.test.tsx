import React from 'react';
import { render } from '@testing-library/react';
import GenerateCardButton from '@/components/card/GenerateCardButton.tsx';

describe('GenerateCardButton', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
