import { render, screen } from '@testing-library/react';
import ReferralSystem from '@/components/Features/ReferralSystem';

describe('Features/ReferralSystem', () => {
    const mockData = {
        referralCode: 'ABC123',
        totalReferrals: 15,
        pendingRewards: 500,
        claimedRewards: 1200,
        referralsList: [
            { id: '1', wallet: 'alice', joinedAt: Date.now(), earned: 50 },
            { id: '2', wallet: 'bob', joinedAt: Date.now(), earned: 75 },
        ],
    };

    it('should display referral code', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/ABC123/)).toBeInTheDocument();
    });

    it('should show total referrals', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('should display pending rewards', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/500/)).toBeInTheDocument();
    });

    it('should show claimed rewards', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/1200/)).toBeInTheDocument();
    });

    it('should render referrals list', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/alice/)).toBeInTheDocument();
        expect(screen.getByText(/bob/)).toBeInTheDocument();
    });

    it('should have copy button', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/copy|share/i)).toBeInTheDocument();
    });

    it('should show claim button', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/claim/i)).toBeInTheDocument();
    });

    it('should display earnings per referral', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getByText(/50/)).toBeInTheDocument();
        expect(screen.getByText(/75/)).toBeInTheDocument();
    });

    it('should handle no referrals', () => {
        render(<ReferralSystem data={{ ...mockData, referralsList: [] }} />);
        expect(screen.getByText(/no referrals/i)).toBeInTheDocument();
    });

    it('should show share options', () => {
        render(<ReferralSystem data={mockData} />);
        expect(screen.getAllByText(/twitter|telegram/i).length).toBeGreaterThan(0);
    });
});
