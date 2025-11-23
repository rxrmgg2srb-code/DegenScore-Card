import { render, screen, fireEvent } from '@testing-library/react';
import FollowButton from '@/components/FollowButton';

describe('FollowButton', () => {
    const mockProps = {
        targetWallet: 'target-wallet',
        isFollowing: false,
        onFollow: jest.fn(),
        onUnfollow: jest.fn(),
    };

    it('should render follow button', () => {
        render(<FollowButton {...mockProps} />);
        expect(screen.getByText(/follow/i)).toBeInTheDocument();
    });

    it('should render following state', () => {
        render(<FollowButton {...mockProps} isFollowing={true} />);
        expect(screen.getByText(/following/i)).toBeInTheDocument();
    });

    it('should call onFollow when clicked', () => {
        render(<FollowButton {...mockProps} />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockProps.onFollow).toHaveBeenCalled();
    });

    it('should call onUnfollow when clicked while following', () => {
        render(<FollowButton {...mockProps} isFollowing={true} />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockProps.onUnfollow).toHaveBeenCalled();
    });

    it('should show loading state', () => {
        render(<FollowButton {...mockProps} loading={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should disable if not authenticated', () => {
        render(<FollowButton {...mockProps} authenticated={false} />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show icon', () => {
        render(<FollowButton {...mockProps} />);
        expect(screen.getByTestId('follow-icon')).toBeInTheDocument();
    });

    it('should animate on toggle', () => {
        const { container } = render(<FollowButton {...mockProps} />);
        fireEvent.click(screen.getByRole('button'));
        expect(container.firstChild).toHaveClass('transform');
    });

    it('should support different sizes', () => {
        const { container } = render(<FollowButton {...mockProps} size="small" />);
        expect(container.firstChild).toHaveClass('text-sm');
    });

    it('should handle error state', () => {
        render(<FollowButton {...mockProps} error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });
});
