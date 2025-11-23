import { render, screen, fireEvent } from '@testing-library/react';
import DegenCard from '@/components/DegenCard';
import { useDegenCard } from '@/hooks/useDegenCard';

jest.mock('@/hooks/useDegenCard');
jest.mock('@solana/wallet-adapter-react', () => ({
    useWallet: () => ({ connected: true, publicKey: { toBase58: () => 'test-wallet' } }),
    WalletMultiButton: () => <button>Connect Wallet</button>,
}));

describe('DegenCard Component', () => {
    const mockHook = {
        mounted: true,
        connected: true,
        cardImage: null,
        loading: false,
        error: null,
        analyzing: false,
        analysisProgress: 0,
        analysisMessage: '',
        hasPaid: false,
        showUpgradeModal: false,
        showShareModal: false,
        showProfileModal: false,
        showCelebration: false,
        generateCard: jest.fn(),
        handleUpgrade: jest.fn(),
        handleSkip: jest.fn(),
        downloadPremiumCard: jest.fn(),
    };

    beforeEach(() => {
        (useDegenCard as jest.Mock).mockReturnValue(mockHook);
    });

    it('should render component', () => {
        render(<DegenCard />);
        expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
    });

    it('should show generate button when connected', () => {
        render(<DegenCard />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call generateCard on button click', () => {
        render(<DegenCard />);
        const button = screen.getAllByRole('button')[0];
        fireEvent.click(button);
        expect(mockHook.generateCard).toHaveBeenCalled();
    });

    it('should show loading state', () => {
        (useDegenCard as jest.Mock).mockReturnValue({ ...mockHook, loading: true, analyzing: true });
        render(<DegenCard />);
        expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it('should display card image when generated', () => {
        (useDegenCard as jest.Mock).mockReturnValue({ ...mockHook, cardImage: 'blob:test' });
        render(<DegenCard />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
    });

    it('should show error message', () => {
        (useDegenCard as jest.Mock).mockReturnValue({ ...mockHook, error: 'Test error' });
        render(<DegenCard />);
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    });

    it('should display progress bar', () => {
        (useDegenCard as jest.Mock).mockReturnValue({
            ...mockHook,
            analyzing: true,
            analysisProgress: 50,
            analysisMessage: 'Analyzing wallet...',
        });
        render(<DegenCard />);
        expect(screen.getByText(/Analyzing wallet/i)).toBeInTheDocument();
        expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    it('should show upgrade modal when hasPaid is false', () => {
        (useDegenCard as jest.Mock).mockReturnValue({
            ...mockHook,
            cardImage: 'blob:test',
            showUpgradeModal: true,
        });
        render(<DegenCard />);
        expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
    });

    it('should handle download for paid users', () => {
        (useDegenCard as jest.Mock).mockReturnValue({
            ...mockHook,
            cardImage: 'blob:test',
            hasPaid: true,
        });
        render(<DegenCard />);
        const downloadBtn = screen.getByText(/download/i);
        fireEvent.click(downloadBtn);
        expect(mockHook.downloadPremiumCard).toHaveBeenCalled();
    });

    it('should not render when not mounted', () => {
        (useDegenCard as jest.Mock).mockReturnValue({ ...mockHook, mounted: false });
        const { container } = render(<DegenCard />);
        expect(container.firstChild).toBeNull();
    });
});
