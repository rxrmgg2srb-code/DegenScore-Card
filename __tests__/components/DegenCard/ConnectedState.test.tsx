import { render, screen } from '@testing-library/react';
import ConnectedState from '@/components/DegenCard/ConnectedState';

describe('DegenCard/ConnectedState', () => {
    const mockProps = {
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        onGenerate: jest.fn(),
        loading: false,
    };

    it('should render wallet address', () => {
        render(<ConnectedState {...mockProps} />);
        expect(screen.getByText(/7xKXtg/)).toBeInTheDocument();
    });

    it('should call onGenerate when button clicked', () => {
        render(<ConnectedState {...mockProps} />);
        const button = screen.getByRole('button');
        button.click();
        expect(mockProps.onGenerate).toHaveBeenCalled();
    });

    it('should show loading state', () => {
        render(<ConnectedState {...mockProps} loading={true} />);
        expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });

    it('should truncate long wallet address', () => {
        render(<ConnectedState {...mockProps} />);
        const text = screen.getByText(/7xKXtg/);
        expect(text.textContent).toMatch(/\.\.\./);
    });

    it('should disable button when loading', () => {
        render(<ConnectedState {...mockProps} loading={true} />);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('should render generate button text', () => {
        render(<ConnectedState {...mockProps} />);
        expect(screen.getByText(/generate/i)).toBeInTheDocument();
    });

    it('should handle short wallet addresses', () => {
        render(<ConnectedState {...mockProps} walletAddress="short" />);
        expect(screen.getByText(/short/)).toBeInTheDocument();
    });

    it('should show wallet icon', () => {
        const { container } = render(<ConnectedState {...mockProps} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply correct styling', () => {
        const { container } = render(<ConnectedState {...mockProps} />);
        expect(container.firstChild).toHaveClass('flex', 'flex-col');
    });

    it('should not call onGenerate when disabled', () => {
        const onClick = jest.fn();
        render(<ConnectedState {...mockProps} loading={true} onGenerate={onClick} />);
        const button = screen.getByRole('button');
        button.click();
        expect(onClick).not.toHaveBeenCalled();
    });
});
