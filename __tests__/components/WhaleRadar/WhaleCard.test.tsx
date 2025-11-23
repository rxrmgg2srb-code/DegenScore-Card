import { render, screen, fireEvent } from '@testing-library/react';
import WhaleCard from '@/components/WhaleRadar/WhaleCard';
import { WhaleWallet } from '@/hooks/useWhaleRadar';

// Mock utilities
jest.mock('@/lib/utils/whale-radar', () => ({
    formatAddress: (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`,
    formatTime: (time: Date) => {
        const diff = Date.now() - new Date(time).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }
}));

describe('WhaleCard', () => {
    const mockWhale: WhaleWallet = {
        id: 'whale-1',
        walletAddress: 'ABC123XYZ789DEF456GHI',
        nickname: 'Whale King',
        totalVolume: 150000,
        winRate: 75.5,
        avgPositionSize: 5000,
        totalProfit: 25000,
        followersCount: 342,
        lastActive: new Date('2024-01-01T12:00:00Z'),
        topTokens: ['SOL', 'BONK', 'WIF']
    };

    const mockProps = {
        whale: mockWhale,
        isFollowing: false,
        onFollow: jest.fn(),
        onUnfollow: jest.fn(),
        isAuthenticated: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.setSystemTime(new Date('2024-01-01T13:00:00Z')); // 1 hour after lastActive
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should render whale card with all information', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText('Whale King')).toBeInTheDocument();
        expect(screen.getByText('ABC1...I456')).toBeInTheDocument();
        expect(screen.getByText('$150,000')).toBeInTheDocument();
        expect(screen.getByText('75.5%')).toBeInTheDocument();
        expect(screen.getByText('$5,000')).toBeInTheDocument();
        expect(screen.getByText('$25,000')).toBeInTheDocument();
    });

    it('should display formatted wallet address when no nickname', () => {
        const whaleWithoutNickname = { ...mockWhale, nickname: undefined };
        render(<WhaleCard {...mockProps} whale={whaleWithoutNickname} />);

        // Should show formatted address as title
        const titles = screen.getAllByText('ABC1...I456');
        expect(titles.length).toBeGreaterThan(1);
    });

    it('should show follow button when not following', () => {
        render(<WhaleCard {...mockProps} />);

        const followButton = screen.getByText('+ Follow');
        expect(followButton).toBeInTheDocument();
        expect(followButton).toHaveClass('bg-blue-600');
    });

    it('should show following button when following', () => {
        render(<WhaleCard {...mockProps} isFollowing={true} />);

        const followingButton = screen.getByText('Following');
        expect(followingButton).toBeInTheDocument();
        expect(followingButton).toHaveClass('bg-gray-700');
    });

    it('should call onFollow when follow button clicked', () => {
        render(<WhaleCard {...mockProps} />);

        const followButton = screen.getByText('+ Follow');
        fireEvent.click(followButton);

        expect(mockProps.onFollow).toHaveBeenCalledWith('whale-1');
        expect(mockProps.onUnfollow).not.toHaveBeenCalled();
    });

    it('should call onUnfollow when following button clicked', () => {
        render(<WhaleCard {...mockProps} isFollowing={true} />);

        const followingButton = screen.getByText('Following');
        fireEvent.click(followingButton);

        expect(mockProps.onUnfollow).toHaveBeenCalledWith('whale-1');
        expect(mockProps.onFollow).not.toHaveBeenCalled();
    });

    it('should disable follow button when not authenticated', () => {
        render(<WhaleCard {...mockProps} isAuthenticated={false} />);

        const followButton = screen.getByText('+ Follow');
        expect(followButton).toBeDisabled();
        expect(followButton).toHaveClass('opacity-50');
    });

    it('should display followers count', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText('342 followers')).toBeInTheDocument();
    });

    it('should display last active time', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText(/Active 1h ago/i)).toBeInTheDocument();
    });

    it('should display top tokens', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText('Top tokens:')).toBeInTheDocument();
        expect(screen.getByText('SOL')).toBeInTheDocument();
        expect(screen.getByText('BONK')).toBeInTheDocument();
        expect(screen.getByText('WIF')).toBeInTheDocument();
    });

    it('should limit top tokens to 3', () => {
        const whaleWithManyTokens = {
            ...mockWhale,
            topTokens: ['SOL', 'BONK', 'WIF', 'JUP', 'ORCA']
        };

        render(<WhaleCard {...mockProps} whale={whaleWithManyTokens} />);

        expect(screen.getByText('SOL')).toBeInTheDocument();
        expect(screen.getByText('BONK')).toBeInTheDocument();
        expect(screen.getByText('WIF')).toBeInTheDocument();
        expect(screen.queryByText('JUP')).not.toBeInTheDocument();
        expect(screen.queryByText('ORCA')).not.toBeInTheDocument();
    });

    it('should not display top tokens section when empty', () => {
        const whaleWithoutTokens = { ...mockWhale, topTokens: [] };
        render(<WhaleCard {...mockProps} whale={whaleWithoutTokens} />);

        expect(screen.queryByText('Top tokens:')).not.toBeInTheDocument();
    });

    it('should display profit in green when positive', () => {
        render(<WhaleCard {...mockProps} />);

        const profitElement = screen.getByText('$25,000');
        expect(profitElement).toHaveClass('text-green-400');
    });

    it('should display profit in red when negative', () => {
        const whaleWithLoss = { ...mockWhale, totalProfit: -5000 };
        render(<WhaleCard {...mockProps} whale={whaleWithLoss} />);

        const profitElement = screen.getByText('$-5,000');
        expect(profitElement).toHaveClass('text-red-400');
    });

    it('should display all stat categories', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText('Volume')).toBeInTheDocument();
        expect(screen.getByText('Win Rate')).toBeInTheDocument();
        expect(screen.getByText('Avg Position')).toBeInTheDocument();
        expect(screen.getByText('Profit')).toBeInTheDocument();
    });

    it('should format large numbers correctly', () => {
        const whaleWithLargeNumbers = {
            ...mockWhale,
            totalVolume: 1500000,
            totalProfit: 250000
        };

        render(<WhaleCard {...mockProps} whale={whaleWithLargeNumbers} />);

        expect(screen.getByText('$1,500,000')).toBeInTheDocument();
        expect(screen.getByText('$250,000')).toBeInTheDocument();
    });

    it('should display whale emoji', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText('🐋')).toBeInTheDocument();
    });

    it('should display followers emoji', () => {
        render(<WhaleCard {...mockProps} />);

        expect(screen.getByText('👥')).toBeInTheDocument();
    });

    it('should have hover effect on border', () => {
        const { container } = render(<WhaleCard {...mockProps} />);

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('hover:border-blue-500/50');
    });
});
