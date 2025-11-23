import { render, screen } from '@testing-library/react';
import DegenCardRefactored from '@/components/DegenCardRefactored';

describe('DegenCardRefactored', () => {
    it('should render main container', () => {
        render(<DegenCardRefactored />);
        expect(screen.getByTestId('degen-card')).toBeInTheDocument();
    });

    it('should show header', () => {
        render(<DegenCardRefactored />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should display score', () => {
        render(<DegenCardRefactored score={90} />);
        expect(screen.getByText('90')).toBeInTheDocument();
    });

    it('should render wallet connection if not connected', () => {
        render(<DegenCardRefactored connected={false} />);
        expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    });

    it('should show analysis when connected', () => {
        render(<DegenCardRefactored connected={true} />);
        expect(screen.getByText(/analyze/i)).toBeInTheDocument();
    });

    it('should handle loading state', () => {
        render(<DegenCardRefactored loading={true} />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should display error message', () => {
        render(<DegenCardRefactored error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should show share options', () => {
        render(<DegenCardRefactored showShare={true} />);
        expect(screen.getByText(/share/i)).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<DegenCardRefactored />);
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('should support themes', () => {
        const { container } = render(<DegenCardRefactored theme="dark" />);
        expect(container.firstChild).toHaveClass('dark');
    });
});
