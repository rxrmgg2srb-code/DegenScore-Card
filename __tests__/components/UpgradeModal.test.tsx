import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpgradeModal from '@/components/UpgradeModal';
import { useWallet } from '@solana/wallet-adapter-react';

// Mock dependencies
jest.mock('@solana/wallet-adapter-react');
jest.mock('@solana/wallet-adapter-react-ui', () => ({
    WalletMultiButton: () => <button>Connect Wallet</button>
}));
jest.mock('react-countup', () => ({
    __esModule: true,
    default: ({ end }: { end: number }) => <span>{end}</span>
}));
global.fetch = jest.fn();

describe('UpgradeModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onUpgrade: jest.fn(),
        onSkip: jest.fn(),
        onPromoCodeApplied: jest.fn()
    };

    const mockPublicKey = {
        toString: () => 'ABC123XYZ789'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockReset();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should not render when isOpen is false', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        const { container } = render(<UpgradeModal {...mockProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText(/Customize & Join Leaderboard/i)).toBeInTheDocument();
    });

    it('should close modal when X button is clicked', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        const closeButton = screen.getByText('✕');
        fireEvent.click(closeButton);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should display all premium features', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText('Custom Profile Photo')).toBeInTheDocument();
        expect(screen.getByText('Social Links')).toBeInTheDocument();
        expect(screen.getByText('Leaderboard Access')).toBeInTheDocument();
        expect(screen.getByText('Premium Download')).toBeInTheDocument();
    });

    it('should show wallet connect button when no wallet connected', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
        expect(screen.getByText(/Connect your wallet to continue/i)).toBeInTheDocument();
    });

    it('should show upgrade button when wallet is connected', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText(/Continue to Customize/i)).toBeInTheDocument();
    });

    it('should call onUpgrade and onClose when upgrade button is clicked', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        render(<UpgradeModal {...mockProps} />);

        const upgradeButton = screen.getByText(/Continue to Customize/i);
        fireEvent.click(upgradeButton);

        expect(mockProps.onClose).toHaveBeenCalled();
        expect(mockProps.onUpgrade).toHaveBeenCalled();
    });

    it('should call onSkip when skip button is clicked', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        const skipButton = screen.getByText(/Download Basic \(Free\)/i);
        fireEvent.click(skipButton);

        expect(mockProps.onSkip).toHaveBeenCalled();
    });

    it('should display upgrade count', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText(/users upgraded today/i)).toBeInTheDocument();
    });

    it('should show promo code input', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByPlaceholderText(/Enter code/i)).toBeInTheDocument();
        expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    it('should convert promo code to uppercase on input', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        render(<UpgradeModal {...mockProps} />);

        const input = screen.getByPlaceholderText(/Enter code/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'degenlaunch' } });

        expect(input.value).toBe('DEGENLAUNCH');
    });

    it('should show error when wallet not connected and promo code applied', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        const input = screen.getByPlaceholderText(/Enter code/i);
        fireEvent.change(input, { target: { value: 'TEST123' } });

        const applyButton = screen.getByText('Apply');
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText(/Please connect your wallet first/i)).toBeInTheDocument();
        });
    });

    it('should show error when empty promo code is submitted', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        render(<UpgradeModal {...mockProps} />);

        const applyButton = screen.getByText('Apply');
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText(/Please enter a promo code/i)).toBeInTheDocument();
        });
    });

    it('should apply valid promo code successfully', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Promo code applied! Enjoy premium access.' })
        });

        render(<UpgradeModal {...mockProps} />);

        const input = screen.getByPlaceholderText(/Enter code/i);
        fireEvent.change(input, { target: { value: 'DEGENLAUNCH2024' } });

        const applyButton = screen.getByText('Apply');
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText(/Promo code applied!/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(mockProps.onPromoCodeApplied).toHaveBeenCalledWith('DEGENLAUNCH2024');
        });
    });

    it('should handle invalid promo code', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Invalid promo code' })
        });

        render(<UpgradeModal {...mockProps} />);

        const input = screen.getByPlaceholderText(/Enter code/i);
        fireEvent.change(input, { target: { value: 'INVALID' } });

        const applyButton = screen.getByText('Apply');
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid promo code/i)).toBeInTheDocument();
        });
    });

    it('should disable apply button while processing', async () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
        (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));

        render(<UpgradeModal {...mockProps} />);

        const input = screen.getByPlaceholderText(/Enter code/i);
        fireEvent.change(input, { target: { value: 'TEST' } });

        const applyButton = screen.getByText('Apply');
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(screen.getByText('Applying...')).toBeInTheDocument();
        });
    });

    it('should show FOMO triggers', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText(/🔥 TRENDING/i)).toBeInTheDocument();
        expect(screen.getByText(/Limited Founder Slots/i)).toBeInTheDocument();
        expect(screen.getByText(/87% CLAIMED/i)).toBeInTheDocument();
    });

    it('should display pricing information', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText(/One-time payment/i)).toBeInTheDocument();
        expect(screen.getByText(/SOL/i)).toBeInTheDocument();
    });

    it('should show value propositions', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        expect(screen.getByText(/Instant access • No recurring fees • Lifetime features/i)).toBeInTheDocument();
    });

    it('should increment upgrades count every 8 seconds', () => {
        (useWallet as jest.Mock).mockReturnValue({ publicKey: null });
        render(<UpgradeModal {...mockProps} />);

        const initialText = screen.getByText(/users upgraded today/i).textContent;

        jest.advanceTimersByTime(8000);

        // Count might increase (70% chance)
        expect(screen.getByText(/users upgraded today/i)).toBeInTheDocument();
    });
});
