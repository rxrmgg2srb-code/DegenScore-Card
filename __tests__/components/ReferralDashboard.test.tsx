import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ReferralDashboard from '@/components/ReferralDashboard';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@solana/wallet-adapter-react');
jest.mock('react-hot-toast');
global.fetch = jest.fn();

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
    },
});

describe('ReferralDashboard', () => {
    const mockPublicKey = {
        toString: () => 'ABC123XYZ789DEF456'
    };

    const mockStats = {
        totalReferrals: 15,
        level1Referrals: 10,
        level2Referrals: 3,
        level3Referrals: 2,
        totalEarnings: 5000,
        pendingRewards: 1200,
        claimedRewards: 3800,
        currentTier: 'Silver',
        nextMilestone: { referrals: 25, reward: 500 }
    };

    beforeEach(() => {
        (global.fetch as jest.Mock).mockReset();
        (toast.success as jest.Mock).mockClear();
        (navigator.clipboard.writeText as jest.Mock).mockClear();
    });

    it('should show connect wallet message when no wallet connected', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });

        render(<ReferralDashboard />);
        expect(screen.getByText(/Connect your wallet/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));

        render(<ReferralDashboard />);
        expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should fetch and display referral stats', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(screen.getByText('15')).toBeInTheDocument(); // Total referrals
            expect(screen.getByText('10')).toBeInTheDocument(); // Level 1
            expect(screen.getByText('5000 $DEGEN')).toBeInTheDocument(); // Total earnings
            expect(screen.getByText('1200 $DEGEN')).toBeInTheDocument(); // Pending
        });
    });

    it('should display referral link with short code', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            const input = screen.getByDisplayValue(/https:\/\/degenscore\.com\?ref=ABC123XY/);
            expect(input).toBeInTheDocument();
        });
    });

    it('should copy referral link to clipboard', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Copy')).toBeInTheDocument();
        });

        const copyButton = screen.getByText('Copy');
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://degenscore.com?ref=ABC123XY');
        expect(toast.success).toHaveBeenCalledWith('Referral link copied!');
    });

    it('should send authorization header when fetching stats', async () => {
        const mockToken = 'test-auth-token';
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => mockToken),
            },
            writable: true
        });

        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/referrals/stats',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-auth-token'
                    })
                })
            );
        });
    });

    it('should handle fetch errors gracefully', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        render(<ReferralDashboard />);

        await waitFor(() => {
            // Should show 0 for all stats when error occurs
            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    it('should display all stat cards', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Total Referrals')).toBeInTheDocument();
            expect(screen.getByText('Level 1 (Direct)')).toBeInTheDocument();
            expect(screen.getByText('Total Earnings')).toBeInTheDocument();
            expect(screen.getByText('Pending Rewards')).toBeInTheDocument();
        });
    });

    it('should show zero values when stats are null', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: null })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBeGreaterThan(0);
        });
    });

    it('should display program title and description', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        expect(screen.getByText(/🔥 Viral Referral Program/i)).toBeInTheDocument();
        expect(screen.getByText(/Earn \$DEGEN by inviting friends/i)).toBeInTheDocument();
    });

    it('should show emoji icons for each stat', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ stats: mockStats })
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(screen.getByText('👥')).toBeInTheDocument();
            expect(screen.getByText('🎯')).toBeInTheDocument();
            expect(screen.getByText('💰')).toBeInTheDocument();
            expect(screen.getByText('⏳')).toBeInTheDocument();
        });
    });
});
