import { render, screen } from '@testing-library/react';
import PaymentFlow from '@/components/Features/PaymentFlow';

describe('Features/PaymentFlow', () => {
    const mockProps = {
        amount: 0.1,
        onSuccess: jest.fn(),
        onCancel: jest.fn(),
    };

    it('should display payment amount', () => {
        render(<PaymentFlow {...mockProps} />);
        expect(screen.getByText(/0\.1/)).toBeInTheDocument();
    });

    it('should show payment methods', () => {
        render(<PaymentFlow {...mockProps} />);
        expect(screen.getByText(/SOL/i)).toBeInTheDocument();
        expect(screen.getByText(/USDC/i)).toBeInTheDocument();
    });

    it('should call onSuccess after payment', async () => {
        render(<PaymentFlow {...mockProps} />);
        fireEvent.click(screen.getByText(/pay/i));
        await waitFor(() => {
            expect(mockProps.onSuccess).toHaveBeenCalled();
        });
    });

    it('should handle payment errors', async () => {
        render(<PaymentFlow {...mockProps} />);
        expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<PaymentFlow {...mockProps} processing={true} />);
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    it('should display transaction fee', () => {
        render(<PaymentFlow {...mockProps} />);
        expect(screen.getByText(/fee/i)).toBeInTheDocument();
    });

    it('should show total amount', () => {
        render(<PaymentFlow {...mockProps} />);
        expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it('should call onCancel', () => {
        render(<PaymentFlow {...mockProps} />);
        fireEvent.click(screen.getByText(/cancel/i));
        expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('should validate wallet connection', () => {
        render(<PaymentFlow {...mockProps} walletConnected={false} />);
        expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    });

    it('should show payment confirmation', async () => {
        render(<PaymentFlow {...mockProps} />);
        expect(await screen.findByText(/confirm/i)).toBeInTheDocument();
    });
});
