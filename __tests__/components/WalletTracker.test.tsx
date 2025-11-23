import { render } from '@testing-library/react';
import WalletTracker from '@/components/WalletTracker';
import { useWallet } from '@solana/wallet-adapter-react';
import { event } from '@/lib/analytics';

// Mock dependencies
jest.mock('@solana/wallet-adapter-react');
jest.mock('@/lib/analytics');

describe('WalletTracker', () => {
    const mockPublicKey = {
        toString: () => 'ABC123XYZ789DEF456'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render any UI', () => {
        (useWallet as jest.Mock).mockReturnValue({
            connected: false,
            publicKey: null
        });

        const { container } = render(<WalletTracker />);
        expect(container.firstChild).toBeNull();
    });

    it('should not track when wallet is not connected', () => {
        (useWallet as jest.Mock).mockReturnValue({
            connected: false,
            publicKey: null
        });

        render(<WalletTracker />);
        expect(event).not.toHaveBeenCalled();
    });

    it('should track when wallet connects', () => {
        (useWallet as jest.Mock).mockReturnValue({
            connected: true,
            publicKey: mockPublicKey
        });

        render(<WalletTracker />);

        expect(event).toHaveBeenCalledWith({
            action: 'wallet_connected',
            category: 'Wallet',
            label: 'ABC123XYZ789DEF456'
        });
    });

    it('should not track when connected but no publicKey', () => {
        (useWallet as jest.Mock).mockReturnValue({
            connected: true,
            publicKey: null
        });

        render(<WalletTracker />);
        expect(event).not.toHaveBeenCalled();
    });

    it('should track again when wallet changes', () => {
        const { rerender } = render(<WalletTracker />);

        // Initial state: not connected
        (useWallet as jest.Mock).mockReturnValue({
            connected: false,
            publicKey: null
        });
        rerender(<WalletTracker />);

        expect(event).not.toHaveBeenCalled();

        // Wallet connects
        (useWallet as jest.Mock).mockReturnValue({
            connected: true,
            publicKey: mockPublicKey
        });
        rerender(<WalletTracker />);

        expect(event).toHaveBeenCalledWith({
            action: 'wallet_connected',
            category: 'Wallet',
            label: 'ABC123XYZ789DEF456'
        });
    });

    it('should track with different wallet addresses', () => {
        const wallet1 = { toString: () => 'WALLET_ADDRESS_1' };
        const wallet2 = { toString: () => 'WALLET_ADDRESS_2' };

        // First wallet
        (useWallet as jest.Mock).mockReturnValue({
            connected: true,
            publicKey: wallet1
        });
        const { rerender } = render(<WalletTracker />);

        expect(event).toHaveBeenCalledWith({
            action: 'wallet_connected',
            category: 'Wallet',
            label: 'WALLET_ADDRESS_1'
        });

        jest.clearAllMocks();

        // Second wallet
        (useWallet as jest.Mock).mockReturnValue({
            connected: true,
            publicKey: wallet2
        });
        rerender(<WalletTracker />);

        expect(event).toHaveBeenCalledWith({
            action: 'wallet_connected',
            category: 'Wallet',
            label: 'WALLET_ADDRESS_2'
        });
    });

    it('should only track once per connection', () => {
        (useWallet as jest.Mock).mockReturnValue({
            connected: true,
            publicKey: mockPublicKey
        });

        const { rerender } = render(<WalletTracker />);

        expect(event).toHaveBeenCalledTimes(1);

        // Rerender with same state
        rerender(<WalletTracker />);

        // Should still only be called once (no re-tracking)
        expect(event).toHaveBeenCalledTimes(1);
    });
});
