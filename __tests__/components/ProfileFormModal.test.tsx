import { render, screen, fireEvent } from '@testing-library/react';
import ProfileFormModal from '@/components/ProfileFormModal';

describe('ProfileFormModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        initialData: { username: 'Degen', bio: 'Crypto enthusiast' },
        onSave: jest.fn(),
    };

    it('should render modal', () => {
        render(<ProfileFormModal {...mockProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display form fields', () => {
        render(<ProfileFormModal {...mockProps} />);
        expect(screen.getByLabelText(/username/i)).toHaveValue('Degen');
        expect(screen.getByLabelText(/bio/i)).toHaveValue('Crypto enthusiast');
    });

    it('should handle input changes', () => {
        render(<ProfileFormModal {...mockProps} />);
        const input = screen.getByLabelText(/username/i);
        fireEvent.change(input, { target: { value: 'NewName' } });
        expect(input).toHaveValue('NewName');
    });

    it('should save changes', () => {
        render(<ProfileFormModal {...mockProps} />);
        fireEvent.click(screen.getByText(/save/i));
        expect(mockProps.onSave).toHaveBeenCalledWith(expect.objectContaining({ username: 'Degen' }));
    });

    it('should close modal', () => {
        render(<ProfileFormModal {...mockProps} />);
        fireEvent.click(screen.getByLabelText(/close/i));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should validate inputs', () => {
        render(<ProfileFormModal {...mockProps} />);
        const input = screen.getByLabelText(/username/i);
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByText(/save/i));
        expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<ProfileFormModal {...mockProps} saving={true} />);
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('should handle error state', () => {
        render(<ProfileFormModal {...mockProps} error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should support avatar upload', () => {
        render(<ProfileFormModal {...mockProps} />);
        expect(screen.getByLabelText(/avatar/i)).toBeInTheDocument();
    });

    it('should not render if closed', () => {
        render(<ProfileFormModal {...mockProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
