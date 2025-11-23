import { render, screen } from '@testing-library/react';
import FollowingContent from '@/components/FollowingContent';

describe('FollowingContent', () => {
    const mockFollowing = [
        { wallet: 'alice', score: 90, avatar: 'alice.png' },
        { wallet: 'bob', score: 80, avatar: 'bob.png' },
    ];

    it('should render following list', () => {
        render(<FollowingContent following={mockFollowing} />);
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('should display scores', () => {
        render(<FollowingContent following={mockFollowing} />);
        expect(screen.getByText('90')).toBeInTheDocument();
        expect(screen.getByText('80')).toBeInTheDocument();
    });

    it('should show avatars', () => {
        render(<FollowingContent following={mockFollowing} />);
        expect(screen.getAllByRole('img')).toHaveLength(2);
    });

    it('should handle empty list', () => {
        render(<FollowingContent following={[]} />);
        expect(screen.getByText(/not following anyone/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<FollowingContent loading={true} />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should allow unfollowing', () => {
        const onUnfollow = jest.fn();
        render(<FollowingContent following={mockFollowing} onUnfollow={onUnfollow} />);
        const buttons = screen.getAllByText(/unfollow/i);
        fireEvent.click(buttons[0]);
        expect(onUnfollow).toHaveBeenCalledWith('alice');
    });

    it('should filter list', () => {
        render(<FollowingContent following={mockFollowing} />);
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'alice' } });
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.queryByText('bob')).not.toBeInTheDocument();
    });

    it('should show activity status', () => {
        const activeFollowing = [{ ...mockFollowing[0], online: true }];
        render(<FollowingContent following={activeFollowing} />);
        expect(screen.getByTestId('online-indicator')).toBeInTheDocument();
    });

    it('should paginate list', () => {
        // ...
    });

    it('should sort list', () => {
        // ...
    });
});
