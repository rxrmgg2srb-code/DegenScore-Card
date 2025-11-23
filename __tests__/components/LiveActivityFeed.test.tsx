import { render, screen } from '@testing-library/react';
import LiveActivityFeed from '@/components/LiveActivityFeed';

describe('LiveActivityFeed', () => {
    const mockActivities = [
        { id: '1', type: 'trade', user: 'alice', amount: 100 },
        { id: '2', type: 'mint', user: 'bob', amount: 50 },
    ];

    it('should render feed', () => {
        render(<LiveActivityFeed activities={mockActivities} />);
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('should display activity types', () => {
        render(<LiveActivityFeed activities={mockActivities} />);
        expect(screen.getByText(/trade/i)).toBeInTheDocument();
        expect(screen.getByText(/mint/i)).toBeInTheDocument();
    });

    it('should animate new items', () => {
        const { rerender, container } = render(<LiveActivityFeed activities={mockActivities} />);
        const newActivities = [{ id: '3', type: 'burn', user: 'charlie' }, ...mockActivities];
        rerender(<LiveActivityFeed activities={newActivities} />);
        // Check animation class
        expect(container.firstChild).toHaveClass('animate-fade-in');
    });

    it('should limit items', () => {
        const many = Array(20).fill(mockActivities[0]).map((a, i) => ({ ...a, id: String(i) }));
        render(<LiveActivityFeed activities={many} limit={5} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    it('should show empty state', () => {
        render(<LiveActivityFeed activities={[]} />);
        expect(screen.getByText(/no activity/i)).toBeInTheDocument();
    });

    it('should show timestamps', () => {
        render(<LiveActivityFeed activities={mockActivities} />);
        expect(screen.getAllByText(/ago/i).length).toBeGreaterThan(0);
    });

    it('should support filters', () => {
        render(<LiveActivityFeed activities={mockActivities} showFilters={true} />);
        expect(screen.getByText(/filter/i)).toBeInTheDocument();
    });

    it('should handle websocket updates', () => {
        // Mock websocket hook
    });

    it('should be accessible', () => {
        render(<LiveActivityFeed activities={mockActivities} />);
        expect(screen.getByRole('feed')).toBeInTheDocument();
    });

    it('should support dark mode', () => {
        // ...
    });
});
