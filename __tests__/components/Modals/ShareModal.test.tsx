import { render, screen, fireEvent } from '@testing-library/react';
import ShareModal from '@/components/Modals/ShareModal';

describe('Modals/ShareModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        cardImage: 'blob:test-image',
        degenScore: 85,
    };

    it('should render when open', () => {
        render(<ShareModal {...mockProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        render(<ShareModal {...mockProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show share buttons', () => {
        render(<ShareModal {...mockProps} />);
        expect(screen.getByText(/twitter/i)).toBeInTheDocument();
        expect(screen.getByText(/telegram/i)).toBeInTheDocument();
    });

    it('should display card image', () => {
        render(<ShareModal {...mockProps} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'blob:test-image');
    });

    it('should show degenScore', () => {
        render(<ShareModal {...mockProps} />);
        expect(screen.getByText(/85/)).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
        render(<ShareModal {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should copy link on button click', async () => {
        Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
        render(<ShareModal {...mockProps} />);
        fireEvent.click(screen.getByText(/copy link/i));
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should show success message after copy', async () => {
        Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
        render(<ShareModal {...mockProps} />);
        fireEvent.click(screen.getByText(/copy link/i));
        await screen.findByText(/copied/i);
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });

    it('should open Twitter share on click', () => {
        const open = jest.fn();
        window.open = open;
        render(<ShareModal {...mockProps} />);
        fireEvent.click(screen.getByText(/twitter/i));
        expect(open).toHaveBeenCalledWith(expect.stringContaining('twitter.com'), '_blank');
    });

    it('should download card image', () => {
        const link = document.createElement('a');
        const click = jest.fn();
        link.click = click;
        jest.spyOn(document, 'createElement').mockReturnValue(link as any);

        render(<ShareModal {...mockProps} />);
        fireEvent.click(screen.getByText(/download/i));
        expect(click).toHaveBeenCalled();
    });
});
