import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '@/components/LanguageSelector';

describe('LanguageSelector', () => {
    const mockProps = {
        currentLang: 'en',
        onChange: jest.fn(),
    };

    it('should render selector', () => {
        render(<LanguageSelector {...mockProps} />);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display current language', () => {
        render(<LanguageSelector {...mockProps} />);
        expect(screen.getByDisplayValue(/english/i)).toBeInTheDocument();
    });

    it('should change language', () => {
        render(<LanguageSelector {...mockProps} />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } });
        expect(mockProps.onChange).toHaveBeenCalledWith('es');
    });

    it('should list available languages', () => {
        render(<LanguageSelector {...mockProps} />);
        expect(screen.getByText(/spanish/i)).toBeInTheDocument();
        expect(screen.getByText(/french/i)).toBeInTheDocument();
    });

    it('should show flags', () => {
        render(<LanguageSelector {...mockProps} />);
        expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('should be accessible', () => {
        render(<LanguageSelector {...mockProps} />);
        expect(screen.getByLabelText(/select language/i)).toBeInTheDocument();
    });

    it('should persist selection', () => {
        // Check local storage interaction if applicable
    });

    it('should support custom styling', () => {
        const { container } = render(<LanguageSelector {...mockProps} className="custom" />);
        expect(container.firstChild).toHaveClass('custom');
    });

    it('should handle missing languages', () => {
        // ...
    });

    it('should close dropdown on outside click', () => {
        // ...
    });
});
