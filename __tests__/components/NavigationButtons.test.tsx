import { render, screen, fireEvent } from '@testing-library/react';
import NavigationButtons from '@/components/NavigationButtons';

describe('NavigationButtons', () => {
    it('should render buttons', () => {
        render(<NavigationButtons />);
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should handle clicks', () => {
        const onBack = jest.fn();
        const onNext = jest.fn();
        render(<NavigationButtons onBack={onBack} onNext={onNext} />);
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        expect(onBack).toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        expect(onNext).toHaveBeenCalled();
    });

    it('should disable buttons', () => {
        render(<NavigationButtons disableBack={true} disableNext={true} />);
        expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('should hide buttons', () => {
        render(<NavigationButtons showBack={false} />);
        expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('should support custom labels', () => {
        render(<NavigationButtons backLabel="Previous" nextLabel="Continue" />);
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<NavigationButtons loading={true} />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const { container } = render(<NavigationButtons />);
        expect(container.firstChild).toHaveClass('flex');
    });

    it('should support icons', () => {
        render(<NavigationButtons showIcons={true} />);
        expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });

    it('should handle custom classes', () => {
        // ...
    });

    it('should support keyboard navigation', () => {
        // ...
    });
});
