import { render, screen } from '@testing-library/react';
import SkeletonLoader, { ProgressSkeleton } from '@/components/SkeletonLoader';

describe('SkeletonLoader', () => {
  describe('Rendering', () => {
    it('should render card variant by default', () => {
      const { container } = render(<SkeletonLoader />);
      expect(container.querySelector('.bg-gray-800')).toBeInTheDocument();
    });

    it('should render leaderboard variant when specified', () => {
      const { container } = render(<SkeletonLoader variant="leaderboard" />);
      const leaderboardElement = container.querySelector('.flex.items-center.justify-between');
      expect(leaderboardElement).toBeInTheDocument();
    });

    it('should render text variant when specified', () => {
      const { container } = render(<SkeletonLoader variant="text" />);
      const textElements = container.querySelectorAll('.h-4.bg-gray-700');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should render avatar variant when specified', () => {
      const { container } = render(<SkeletonLoader variant="avatar" />);
      const avatar = container.querySelector('.w-16.h-16.bg-gray-700.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should render badge variant when specified', () => {
      const { container } = render(<SkeletonLoader variant="badge" />);
      const badgeContainer = container.querySelector('.flex.items-center.space-x-2');
      expect(badgeContainer).toBeInTheDocument();
    });
  });

  describe('Count Prop', () => {
    it('should render single skeleton by default', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      const skeletons = container.querySelectorAll('.bg-gray-800.rounded-lg.p-6');
      expect(skeletons).toHaveLength(1);
    });

    it('should render multiple skeletons when count is specified', () => {
      const { container } = render(<SkeletonLoader variant="card" count={3} />);
      const skeletons = container.querySelectorAll('.bg-gray-800.rounded-lg.p-6');
      expect(skeletons).toHaveLength(3);
    });

    it('should render correct number of leaderboard items', () => {
      const { container } = render(<SkeletonLoader variant="leaderboard" count={5} />);
      const items = container.querySelectorAll('.flex.items-center.justify-between');
      expect(items).toHaveLength(5);
    });
  });

  describe('Accessibility', () => {
    it('should have pulse animation class for loading indication', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle count of 0', () => {
      const { container } = render(<SkeletonLoader variant="card" count={0} />);
      const skeletons = container.querySelectorAll('.bg-gray-800.rounded-lg.p-6');
      expect(skeletons).toHaveLength(0);
    });

    it('should fall back to card variant for invalid variant', () => {
      // @ts-expect-error Testing invalid variant
      const { container } = render(<SkeletonLoader variant="invalid" />);
      expect(container.querySelector('.bg-gray-800.rounded-lg.p-6')).toBeInTheDocument();
    });
  });
});

describe('ProgressSkeleton', () => {
  it('should render default number of steps (5)', () => {
    const { container } = render(<ProgressSkeleton />);
    const steps = container.querySelectorAll('.space-y-2 > .space-y-2');
    expect(steps).toHaveLength(5);
  });

  it('should render custom number of steps', () => {
    const { container } = render(<ProgressSkeleton steps={3} />);
    const steps = container.querySelectorAll('.space-y-2 > .space-y-2');
    expect(steps).toHaveLength(3);
  });

  it('should render progress bars for each step', () => {
    const { container } = render(<ProgressSkeleton steps={2} />);
    const progressBars = container.querySelectorAll('.h-2.bg-gray-700.rounded-full');
    expect(progressBars).toHaveLength(2);
  });

  it('should have pulse animation', () => {
    const { container } = render(<ProgressSkeleton />);
    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });
});
