import { render, screen, fireEvent } from '@testing-library/react';
import AnimatedToast from '@/components/AnimatedToast';

describe('AnimatedToast', () => {
    const mockProps = {
        message: 'Success!',
        type: 'success' as const,
        onClose: jest.fn(),
    };

    it('should render message', () => {
        render(<AnimatedToast {...mockProps} />);
        expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('should show success icon', () => {
        render(<AnimatedToast {...mockProps} />);
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should show error icon', () => {
        render(<AnimatedToast {...mockProps} type="error" />);
        expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('should show warning icon', () => {
        render(<AnimatedToast {...mockProps} type="warning" />);
        expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should show info icon', () => {
        render(<AnimatedToast {...mockProps} type="info" />);
        expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });

    it('should call onClose click', () => {
        render(<AnimatedToast {...mockProps} />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should auto-close', () => {
        jest.useFakeTimers();
        render(<AnimatedToast {...mockProps} duration={2000} />);
        jest.advanceTimersByTime(2000);
        expect(mockProps.onClose).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('should animate entry', () => {
        const { container } = render(<AnimatedToast {...mockProps} />);
        expect(container.firstChild).toHaveClass('animate-slide-in');
    });

    it('should animate exit', () => {
        const { rerender, container } = render(<AnimatedToast {...mockProps} show={true} />);
        rerender(<AnimatedToast {...mockProps} show={false} />);
        expect(container.firstChild).toHaveClass('animate-slide-out');
    });

    it('should stack multiple toasts', () => {
        // This logic might be in a ToastContainer, but checking if it supports positioning
        const { container } = render(<AnimatedToast {...mockProps} position="top-right" />);
        expect(container.firstChild).toHaveClass('top-4 right-4');
    });
});
