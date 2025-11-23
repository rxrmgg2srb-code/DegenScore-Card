import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

describe('Header', () => {
    it('should render logo', () => {
        render(<Header />);
        expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    });

    it('should render navigation links', () => {
        render(<Header />);
        expect(screen.getByText(/home/i)).toBeInTheDocument();
        expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
    });

    it('should show connect wallet button', () => {
        render(<Header />);
        expect(screen.getByText(/connect/i)).toBeInTheDocument();
    });

    it('should show user profile when connected', () => {
        render(<Header connected={true} username="Degen" />);
        expect(screen.getByText('Degen')).toBeInTheDocument();
    });

    it('should toggle mobile menu', () => {
        render(<Header />);
        const menuBtn = screen.getByLabelText(/menu/i);
        fireEvent.click(menuBtn);
        expect(screen.getByRole('navigation')).toBeVisible();
    });

    it('should highlight active link', () => {
        // Mock router
        render(<Header activePath="/leaderboard" />);
        expect(screen.getByText(/leaderboard/i)).toHaveClass('active');
    });

    it('should show notifications', () => {
        render(<Header notifications={5} />);
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should be sticky', () => {
        const { container } = render(<Header sticky={true} />);
        expect(container.firstChild).toHaveClass('sticky');
    });

    it('should change style on scroll', () => {
        // Mock scroll event
    });

    it('should support dark mode toggle', () => {
        const onToggle = jest.fn();
        render(<Header onThemeToggle={onToggle} />);
        fireEvent.click(screen.getByLabelText(/theme/i));
        expect(onToggle).toHaveBeenCalled();
    });
});
