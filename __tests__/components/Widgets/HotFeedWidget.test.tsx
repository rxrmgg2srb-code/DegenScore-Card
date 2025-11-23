import { render, screen } from '@testing-library/react';
import HotFeedWidget from '@/components/Widgets/HotFeedWidget';

describe('Widgets/HotFeedWidget', () => {
    const mockItems = [
        { id: '1', type: 'card', user: 'Alice', score: 95, timestamp: Date.now() },
        { id: '2', type: 'trade', user: 'Bob', amount: 1000, timestamp: Date.now() },
    ];

    it('should render feed items', () => {
        render(<HotFeedWidget items={mockItems} />);
        expect(screen.getByText(/Alice/)).toBeInTheDocument();
        expect(screen.getByText(/Bob/)).toBeInTheDocument();
    });

    it('should show activity types', () => {
        render(<HotFeedWidget items={mockItems} />);
        expect(screen.getByText(/card/i)).toBeInTheDocument();
        expect(screen.getByText(/trade/i)).toBeInTheDocument();
    });

    it('should display scores', () => {
        render(<HotFeedWidget items={mockItems} />);
        expect(screen.getByText(/95/)).toBeInTheDocument();
    });

    it('should show timestamps', () => {
        render(<HotFeedWidget items={mockItems} />);
        expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });

    it('should handle empty feed', () => {
        render(<HotFeedWidget items={[]} />);
        expect(screen.getByText(/no activity/i)).toBeInTheDocument();
    });

    it('should limit displayed items', () => {
        const many = Array(100).fill(mockItems[0]).map((item, i) => ({ ...item, id: String(i) }));
        render(<HotFeedWidget items={many} maxItems={10} />);
        const items = screen.getAllByRole('listitem');
        expect(items.length).toBeLessThanOrEqual(10);
    });

    it('should show user avatars', () => {
        const { container } = render(<HotFeedWidget items={mockItems} />);
        expect(container.querySelectorAll('img').length).toBeGreaterThan(0);
    });

    it('should display activity icons', () => {
        render(<HotFeedWidget items={mockItems} />);
        expect(screen.getAllByText(/🎴|💰/).length).toBeGreaterThan(0);
    });

    it('should auto-refresh', async () => {
        const { rerender } = render(<HotFeedWidget items={mockItems} />);
        const newItems = [...mockItems, { id: '3', type: 'achievement', user: 'Charlie', timestamp: Date.now() }];
        rerender(<HotFeedWidget items={newItems} />);
        expect(screen.getByText(/Charlie/)).toBeInTheDocument();
    });

    it('should link to user profiles', () => {
        render(<HotFeedWidget items={mockItems} />);
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });
});
