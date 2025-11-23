import { render, screen, fireEvent } from '@testing-library/react';
import UpgradeModal from '@/components/Modals/UpgradeModal';

describe('Modals/UpgradeModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onUpgrade: jest.fn(),
        onSkip: jest.fn(),
    };

    it('should render upgrade options', () => {
        render(<UpgradeModal {...mockProps} />);
        expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
    });

    it('should display pricing', () => {
        render(<UpgradeModal {...mockProps} />);
        expect(screen.getByText(/\$|SOL/)).toBeInTheDocument();
    });

    it('should show premium features', () => {
        render(<UpgradeModal {...mockProps} />);
        expect(screen.getByText(/HD/i)).toBeInTheDocument();
        expect(screen.getByText(/no watermark/i)).toBeInTheDocument();
    });

    it('should call onUpgrade', () => {
        render(<UpgradeModal {...mockProps} />);
        fireEvent.click(screen.getByText(/upgrade now/i));
        expect(mockProps.onUpgrade).toHaveBeenCalled();
    });

    it('should call onSkip', () => {
        render(<UpgradeModal {...mockProps} />);
        fireEvent.click(screen.getByText(/skip|later/i));
        expect(mockProps.onSkip).toHaveBeenCalled();
    });

    it('should display limited features warning', () => {
        render(<UpgradeModal {...mockProps} />);
        expect(screen.getByText(/limited/i)).toBeInTheDocument();
    });

    it('should show payment options', () => {
        render(<UpgradeModal {...mockProps} />);
        expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    });

    it('should display discount if available', () => {
        render(<UpgradeModal {...mockProps} discount={20} />);
        expect(screen.getByText(/20%/)).toBeInTheDocument();
    });

    it('should close on backdrop click', () => {
        render(<UpgradeModal {...mockProps} />);
        fireEvent.click(screen.getByRole('dialog').parentElement);
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should disable upgrade button when processing', () => {
        render(<UpgradeModal {...mockProps} processing={true} />);
        expect(screen.getByText(/upgrade now/i)).toBeDisabled();
    });
});
