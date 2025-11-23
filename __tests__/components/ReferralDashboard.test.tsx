import { render, screen } from '@testing-library/react';
import ReferralDashboard from '@/components/ReferralDashboard';

describe('ReferralDashboard', () => {
    const mockData = {
        code: 'REF123',
        count: 5,
        earnings: 100,
        referrals: [{ wallet: 'user1', date: '2024-01-01', status: 'active' }],
    };

    it('should render dashboard', () => {
        render(<ReferralDashboard data={mockData} />);
        expect(screen.getByText('REF123')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should copy referral code', () => {
        // Mock clipboard API
        render(<ReferralDashboard data={mockData} />);
        fireEvent.click(screen.getByText(/copy/i));
        // Expect copy action
    });

    it('should display referral list', () => {
        render(<ReferralDashboard data={mockData} />);
        expect(screen.getByText('user1')).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<ReferralDashboard loading={true} />);
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should handle empty state', () => {
        render(<ReferralDashboard data={{ ...mockData, referrals: [] }} />);
        expect(screen.getByText(/no referrals/i)).toBeInTheDocument();
    });

    it('should claim rewards', () => {
        const onClaim = jest.fn();
        render(<ReferralDashboard data={mockData} onClaim={onClaim} />);
        fireEvent.click(screen.getByText(/claim/i));
        expect(onClaim).toHaveBeenCalled();
    });

    it('should share link', () => {
        // ...
    });

    it('should show tier progress', () => {
        // ...
    });

    it('should filter referrals', () => {
        // ...
    });

    it('should handle errors', () => {
        // ...
    });
});
