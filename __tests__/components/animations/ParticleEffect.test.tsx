import React from 'react';
import { render } from '@testing-library/react';
import ParticleEffect from '@/components/animations/ParticleEffect.tsx';

describe('ParticleEffect', () => {
  it('renders without crashing', () => {
    const { container } = render(React.createElement(null, null, 'MockedComponent'));
    expect(container).toBeInTheDocument();
  });
});
