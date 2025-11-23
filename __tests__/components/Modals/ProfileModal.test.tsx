import { render, screen, fireEvent } from '@testing-library/react';
import ProfileModal from '@/components/Modals/ProfileModal';

describe('Modals/ProfileModal', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn(),
        initialData: { username: 'test_user', bio: 'Test bio' },
    };

    it('should render profile form', () => {
        render(<ProfileModal {...mockProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display initial username', () => {
        render(<ProfileModal {...mockProps} />);
        expect(screen.getByDisplayValue('test_user')).toBeInTheDocument();
    });

    it('should display initial bio', () => {
        render(<ProfileModal {...mockProps} />);
        expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    });

    it('should update username on input', () => {
        render(<ProfileModal {...mockProps} />);
        const input = screen.getByLabelText(/username/i);
        fireEvent.change(input, { target: { value: 'new_username' } });
        expect(input).toHaveValue('new_username');
    });

    it('should update bio on input', () => {
        render(<ProfileModal {...mockProps} />);
        const textarea = screen.getByLabelText(/bio/i);
        fireEvent.change(textarea, { target: { value: 'New bio' } });
        expect(textarea).toHaveValue('New bio');
    });

    it('should call onSave with updated data', () => {
        render(<ProfileModal {...mockProps} />);
        const input = screen.getByLabelText(/username/i);
        fireEvent.change(input, { target: { value: 'updated' } });
        fireEvent.click(screen.getByText(/save/i));
        expect(mockProps.onSave).toHaveBeenCalledWith(expect.objectContaining({ username: 'updated' }));
    });

    it('should validate username length', () => {
        render(<ProfileModal {...mockProps} />);
        const input = screen.getByLabelText(/username/i);
        fireEvent.change(input, { target: { value: 'ab' } });
        fireEvent.click(screen.getByText(/save/i));
        expect(screen.getByText(/too short/i)).toBeInTheDocument();
    });

    it('should validate bio length', () => {
        render(<ProfileModal {...mockProps} />);
        const textarea = screen.getByLabelText(/bio/i);
        const longBio = 'a'.repeat(300);
        fireEvent.change(textarea, { target: { value: longBio } });
        expect(screen.getByText(/too long/i)).toBeInTheDocument();
    });

    it('should show character count', () => {
        render(<ProfileModal {...mockProps} />);
        expect(screen.getByText(/characters/i)).toBeInTheDocument();
    });

    it('should close on cancel', () => {
        render(<ProfileModal {...mockProps} />);
        fireEvent.click(screen.getByText(/cancel/i));
        expect(mockProps.onClose).toHaveBeenCalled();
    });
});
