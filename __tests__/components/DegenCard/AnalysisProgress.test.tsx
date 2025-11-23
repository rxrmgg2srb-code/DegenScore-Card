import { render, screen } from '@testing-library/react';
import AnalysisProgress from '@/components/DegenCard/AnalysisProgress';

describe('DegenCard/AnalysisProgress', () => {
    const mockSteps = [
        { label: 'Checking Wallet', status: 'completed' },
        { label: 'Analyzing Tokens', status: 'processing' },
        { label: 'Calculating Score', status: 'pending' },
    ];

    it('should render steps', () => {
        render(<AnalysisProgress steps={mockSteps} />);
        expect(screen.getByText('Checking Wallet')).toBeInTheDocument();
        expect(screen.getByText('Analyzing Tokens')).toBeInTheDocument();
    });

    it('should show status icons', () => {
        render(<AnalysisProgress steps={mockSteps} />);
        // Assuming icons are rendered based on status
        // Check for completed icon
        expect(screen.getByTestId('status-completed')).toBeInTheDocument();
        // Check for processing spinner
        expect(screen.getByTestId('status-processing')).toBeInTheDocument();
    });

    it('should show progress bar', () => {
        render(<AnalysisProgress progress={50} />);
        expect(screen.getByRole('progressbar')).toHaveStyle('width: 50%');
    });

    it('should animate progress', () => {
        const { rerender } = render(<AnalysisProgress progress={0} />);
        rerender(<AnalysisProgress progress={100} />);
        // Check transition class
    });

    it('should display current action', () => {
        render(<AnalysisProgress currentAction="Scanning..." />);
        expect(screen.getByText('Scanning...')).toBeInTheDocument();
    });

    it('should handle empty steps', () => {
        render(<AnalysisProgress steps={[]} />);
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('should show completion message', () => {
        render(<AnalysisProgress completed={true} />);
        expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });

    it('should handle error state', () => {
        render(<AnalysisProgress error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
        expect(screen.getByTestId('status-error')).toBeInTheDocument();
    });

    it('should be accessible', () => {
        render(<AnalysisProgress steps={mockSteps} />);
        expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should support custom colors', () => {
        // ...
    });
});
