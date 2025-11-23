import { render, screen } from '@testing-library/react';
import { BadgesDisplay, BadgePointsCompact } from '@/components/BadgesDisplay';
import { BadgeDefinition } from '@/lib/badges-with-points';

describe('BadgesDisplay', () =& gt; {
    const mockBadges: BadgeDefinition[] = [
        {
            key: 'early_adopter',
            name: 'Early Adopter',
            icon: '🚀',
            description: 'Joined early',
            points: 100,
            rarity: 'RARE',
        },
        {
            key: 'whale',
            name: 'Whale',
            icon: '🐋',
            description: 'High volume trader',
            points: 200,
            rarity: 'EPIC',
        },
    ];

    it('should render badges with icons', () =& gt; {
        render(& lt;BadgesDisplay badges = { mockBadges } totalPoints = { 300} /& gt;);
        expect(screen.getByText('🚀')).toBeInTheDocument();
        expect(screen.getByText('🐋')).toBeInTheDocument();
    });

    it('should display total achievement points', () =& gt; {
        render(& lt;BadgesDisplay badges = { mockBadges } totalPoints = { 300} /& gt;);
        expect(screen.getByText('300')).toBeInTheDocument();
        expect(screen.getByText('Achievement Points')).toBeInTheDocument();
    });

    it('should hide points when showPoints is false', () =& gt; {
        render(& lt;BadgesDisplay badges = { mockBadges } totalPoints = { 300} showPoints = { false} /& gt;);
        expect(screen.queryByText('Achievement Points')).not.toBeInTheDocument();
    });

    it('should limit displayed badges with maxDisplay', () =& gt; {
        const manyBadges: BadgeDefinition[] = Array(10).fill(null).map((_, i) =& gt; ({
            key: `badge_${i}`,
            name: `Badge ${i}`,
            icon: '🏆',
            description: `Badge number ${i}`,
            points: 50,
            rarity: 'COMMON' as const,
        }));
        render(& lt;BadgesDisplay badges = { manyBadges } totalPoints = { 500} maxDisplay = { 5} /& gt;);
        expect(screen.getByText('+5 more')).toBeInTheDocument();
    });

    it('should display badge points', () =& gt; {
        render(& lt;BadgesDisplay badges = { mockBadges } totalPoints = { 300} /& gt;);
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should render empty state when no badges', () =& gt; {
        const { container } = render(& lt;BadgesDisplay badges = { []} totalPoints = { 0} /& gt;);
        expect(container.querySelector('.flex')).toBeInTheDocument();
    });
});

describe('BadgePointsCompact', () =& gt; {
    it('should render compact points display', () =& gt; {
        render(& lt;BadgePointsCompact totalPoints = { 500} badgeCount = { 5} /& gt;);
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('(5)')).toBeInTheDocument();
    });

    it('should display star icon', () =& gt; {
        render(& lt;BadgePointsCompact totalPoints = { 100} badgeCount = { 2} /& gt;);
        expect(screen.getByText('⭐')).toBeInTheDocument();
    });
});
