import { render, screen, fireEvent } from '@testing-library/react';
import NotificationSettings from '@/components/NotificationSettings';

describe('NotificationSettings', () => {
    const mockSettings = {
        email: true,
        push: false,
        marketing: true,
    };

    it('should render settings', () => {
        render(<NotificationSettings settings={mockSettings} />);
        expect(screen.getByLabelText(/email/i)).toBeChecked();
        expect(screen.getByLabelText(/push/i)).not.toBeChecked();
    });

    it('should toggle settings', () => {
        const onUpdate = jest.fn();
        render(<NotificationSettings settings={mockSettings} onUpdate={onUpdate} />);
        fireEvent.click(screen.getByLabelText(/push/i));
        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ push: true }));
    });

    it('should show save button', () => {
        render(<NotificationSettings />);
        expect(screen.getByText(/save/i)).toBeInTheDocument();
    });

    it('should handle save', () => {
        const onSave = jest.fn();
        render(<NotificationSettings onSave={onSave} />);
        fireEvent.click(screen.getByText(/save/i));
        expect(onSave).toHaveBeenCalled();
    });

    it('should show success message', () => {
        render(<NotificationSettings success={true} />);
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });

    it('should show error message', () => {
        render(<NotificationSettings error="Failed" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should validate email', () => {
        render(<NotificationSettings />);
        const input = screen.getByPlaceholderText(/email/i);
        fireEvent.change(input, { target: { value: 'invalid' } });
        fireEvent.blur(input);
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('should disable controls while saving', () => {
        render(<NotificationSettings saving={true} />);
        expect(screen.getByText(/save/i)).toBeDisabled();
    });

    it('should support categories', () => {
        render(<NotificationSettings />);
        expect(screen.getByText(/security/i)).toBeInTheDocument();
        expect(screen.getByText(/marketing/i)).toBeInTheDocument();
    });

    it('should be accessible', () => {
        render(<NotificationSettings />);
        expect(screen.getByRole('form')).toBeInTheDocument();
    });
});
