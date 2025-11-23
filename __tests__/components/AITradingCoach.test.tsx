import { render, screen, fireEvent } from '@testing-library/react';
import AITradingCoach from '@/components/AITradingCoach';
import { getAiAdvice } from '@/lib/aiCoach';

jest.mock('@/lib/aiCoach');

describe('AITradingCoach', () => {
    const mockProps = {
        score: 85,
        walletAddress: 'test-wallet',
    };

    beforeEach(() => {
        (getAiAdvice as jest.Mock).mockResolvedValue('Great job! Keep it up.');
    });

    it('should render coach component', () => {
        render(<AITradingCoach {...mockProps} />);
        expect(screen.getByText(/AI Coach/i)).toBeInTheDocument();
    });

    it('should display advice', async () => {
        render(<AITradingCoach {...mockProps} />);
        const advice = await screen.findByText('Great job! Keep it up.');
        expect(advice).toBeInTheDocument();
    });

    it('should show loading state', () => {
        (getAiAdvice as jest.Mock).mockImplementation(() => new Promise(() => { }));
        render(<AITradingCoach {...mockProps} />);
        expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it('should handle errors', async () => {
        (getAiAdvice as jest.Mock).mockRejectedValue(new Error('Failed'));
        render(<AITradingCoach {...mockProps} />);
        const error = await screen.findByText(/failed/i);
        expect(error).toBeInTheDocument();
    });

    it('should refresh advice on button click', async () => {
        render(<AITradingCoach {...mockProps} />);
        await screen.findByText('Great job! Keep it up.');

        const button = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(button);

        expect(getAiAdvice).toHaveBeenCalledTimes(2);
    });

    it('should display robot icon', () => {
        render(<AITradingCoach {...mockProps} />);
        expect(screen.getByText('🤖')).toBeInTheDocument();
    });

    it('should animate on load', async () => {
        const { container } = render(<AITradingCoach {...mockProps} />);
        expect(container.firstChild).toHaveClass('animate-fade-in');
    });

    it('should show premium features for high scores', async () => {
        render(<AITradingCoach {...mockProps} score={95} />);
        await screen.findByText(/premium/i);
        expect(screen.getByText(/premium/i)).toBeInTheDocument();
    });

    it('should suggest improvements for low scores', async () => {
        (getAiAdvice as jest.Mock).mockResolvedValue('Try to diversify.');
        render(<AITradingCoach {...mockProps} score={30} />);
        const advice = await screen.findByText('Try to diversify.');
        expect(advice).toBeInTheDocument();
    });

    it('should customize advice for wallet', async () => {
        render(<AITradingCoach {...mockProps} />);
        expect(getAiAdvice).toHaveBeenCalledWith(85, expect.objectContaining({ walletAddress: 'test-wallet' }));
    });
});
