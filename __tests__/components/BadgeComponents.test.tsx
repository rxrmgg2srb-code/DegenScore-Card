import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge, BadgeCategory, BadgeItem, RarityBadge } from '../../components/docs/BadgeComponents';

describe('Badge Components - Comprehensive Tests', () => {
    describe('Badge Component', () => {
        it('should render with children text', () => {
            render(<Badge>Test Badge</Badge>);
            expect(screen.getByText('Test Badge')).toBeInTheDocument();
        });

        it('should apply correct CSS classes', () => {
            const { container } = render(<Badge>Test</Badge>);
            const badge = container.firstChild as HTMLElement;
            expect(badge).toHaveClass('bg-purple-900/50');
            expect(badge).toHaveClass('border');
            expect(badge).toHaveClass('border-purple-500/30');
            expect(badge).toHaveClass('px-2');
            expect(badge).toHaveClass('py-1');
            expect(badge).toHaveClass('rounded');
            expect(badge).toHaveClass('text-xs');
        });

        it('should render as span element', () => {
            const { container } = render(<Badge>Test</Badge>);
            expect(container.firstChild?.nodeName).toBe('SPAN');
        });

        it('should handle empty children', () => {
            const { container } = render(<Badge></Badge>);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should handle complex children with React nodes', () => {
            render(
                <Badge>
                    <strong>Bold</strong> and <em>italic</em>
                </Badge>
            );
            expect(screen.getByText('Bold')).toBeInTheDocument();
            expect(screen.getByText('and')).toBeInTheDocument();
        });

        it('should handle special characters and emojis', () => {
            render(<Badge>🔥 Fire Badge! @#$%</Badge>);
            expect(screen.getByText('🔥 Fire Badge! @#$%')).toBeInTheDocument();
        });

        it('should handle very long text', () => {
            const longText = 'A'.repeat(1000);
            render(<Badge>{longText}</Badge>);
            expect(screen.getByText(longText)).toBeInTheDocument();
        });

        it('should render multiple badges independently', () => {
            render(
                <>
                    <Badge>Badge 1</Badge>
                    <Badge>Badge 2</Badge>
                    <Badge>Badge 3</Badge>
                </>
            );
            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Badge 2')).toBeInTheDocument();
            expect(screen.getByText('Badge 3')).toBeInTheDocument();
        });
    });

    describe('BadgeCategory Component', () => {
        it('should render with title and children', () => {
            render(
                <BadgeCategory title="Test Category">
                    <div>Child Content</div>
                </BadgeCategory>
            );
            expect(screen.getByText('Test Category')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });

        it('should apply correct CSS classes to container', () => {
            const { container } = render(
                <BadgeCategory title="Test">
                    <div>Content</div>
                </BadgeCategory>
            );
            const categoryDiv = container.firstChild as HTMLElement;
            expect(categoryDiv).toHaveClass('bg-black/30');
            expect(categoryDiv).toHaveClass('border');
            expect(categoryDiv).toHaveClass('border-gray-700');
            expect(categoryDiv).toHaveClass('rounded-lg');
            expect(categoryDiv).toHaveClass('p-4');
        });

        it('should render title as h4 with correct classes', () => {
            render(
                <BadgeCategory title="Category Title">
                    <div>Content</div>
                </BadgeCategory>
            );
            const title = screen.getByText('Category Title');
            expect(title.tagName).toBe('H4');
            expect(title).toHaveClass('font-bold');
            expect(title).toHaveClass('mb-3');
        });

        it('should apply space-y-2 to children container', () => {
            const { container } = render(
                <BadgeCategory title="Test">
                    <div>Child 1</div>
                    <div>Child 2</div>
                </BadgeCategory>
            );
            const childrenContainer = container.querySelector('.space-y-2');
            expect(childrenContainer).toBeInTheDocument();
        });

        it('should handle empty title', () => {
            render(
                <BadgeCategory title="">
                    <div>Content</div>
                </BadgeCategory>
            );
            expect(screen.getByText('Content')).toBeInTheDocument();
        });

        it('should handle multiple children', () => {
            render(
                <BadgeCategory title="Multiple">
                    <div>Child 1</div>
                    <div>Child 2</div>
                    <div>Child 3</div>
                </BadgeCategory>
            );
            expect(screen.getByText('Child 1')).toBeInTheDocument();
            expect(screen.getByText('Child 2')).toBeInTheDocument();
            expect(screen.getByText('Child 3')).toBeInTheDocument();
        });

        it('should handle special characters in title', () => {
            render(
                <BadgeCategory title="🎮 Gaming Badges! @#$">
                    <div>Content</div>
                </BadgeCategory>
            );
            expect(screen.getByText('🎮 Gaming Badges! @#$')).toBeInTheDocument();
        });

        it('should nest Badge components correctly', () => {
            render(
                <BadgeCategory title="Category">
                    <Badge>Badge 1</Badge>
                    <Badge>Badge 2</Badge>
                </BadgeCategory>
            );
            expect(screen.getByText('Category')).toBeInTheDocument();
            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Badge 2')).toBeInTheDocument();
        });
    });

    describe('BadgeItem Component', () => {
        it('should render with all props', () => {
            render(
                <BadgeItem
                    name="Test Badge"
                    description="Test Description"
                    rarity="RARE"
                />
            );
            expect(screen.getByText('Test Badge')).toBeInTheDocument();
            expect(screen.getByText('Test Description')).toBeInTheDocument();
            expect(screen.getByText('RARE')).toBeInTheDocument();
        });

        it('should apply correct color for COMMON rarity', () => {
            render(<BadgeItem name="Common" description="Desc" rarity="COMMON" />);
            const rarityText = screen.getByText('COMMON');
            expect(rarityText).toHaveClass('text-gray-400');
        });

        it('should apply correct color for RARE rarity', () => {
            render(<BadgeItem name="Rare" description="Desc" rarity="RARE" />);
            const rarityText = screen.getByText('RARE');
            expect(rarityText).toHaveClass('text-green-400');
        });

        it('should apply correct color for EPIC rarity', () => {
            render(<BadgeItem name="Epic" description="Desc" rarity="EPIC" />);
            const rarityText = screen.getByText('EPIC');
            expect(rarityText).toHaveClass('text-purple-400');
        });

        it('should apply correct color for LEGENDARY rarity', () => {
            render(<BadgeItem name="Legendary" description="Desc" rarity="LEGENDARY" />);
            const rarityText = screen.getByText('LEGENDARY');
            expect(rarityText).toHaveClass('text-orange-400');
        });

        it('should apply correct color for MYTHIC rarity', () => {
            render(<BadgeItem name="Mythic" description="Desc" rarity="MYTHIC" />);
            const rarityText = screen.getByText('MYTHIC');
            expect(rarityText).toHaveClass('text-red-400');
        });

        it('should render name with font-medium class', () => {
            render(<BadgeItem name="Test Name" description="Desc" rarity="COMMON" />);
            const nameElement = screen.getByText('Test Name');
            expect(nameElement).toHaveClass('font-medium');
        });

        it('should render description with correct classes', () => {
            render(<BadgeItem name="Name" description="Test Description" rarity="COMMON" />);
            const descElement = screen.getByText('Test Description');
            expect(descElement).toHaveClass('text-xs');
            expect(descElement).toHaveClass('text-gray-500');
        });

        it('should use flex layout with correct structure', () => {
            const { container } = render(
                <BadgeItem name="Test" description="Desc" rarity="RARE" />
            );
            const flexContainer = container.querySelector('.flex.justify-between');
            expect(flexContainer).toBeInTheDocument();
        });

        it('should handle empty strings', () => {
            render(<BadgeItem name="" description="" rarity="COMMON" />);
            expect(screen.getByText('COMMON')).toBeInTheDocument();
        });

        it('should handle very long names and descriptions', () => {
            const longName = 'A'.repeat(500);
            const longDesc = 'B'.repeat(500);
            render(<BadgeItem name={longName} description={longDesc} rarity="RARE" />);
            expect(screen.getByText(longName)).toBeInTheDocument();
            expect(screen.getByText(longDesc)).toBeInTheDocument();
        });

        it('should handle special characters and emojis', () => {
            render(
                <BadgeItem
                    name="🏆 Trophy Badge @#$"
                    description="Earned by winners! 🎉"
                    rarity="LEGENDARY"
                />
            );
            expect(screen.getByText('🏆 Trophy Badge @#$')).toBeInTheDocument();
            expect(screen.getByText('Earned by winners! 🎉')).toBeInTheDocument();
        });

        it('should render multiple badge items correctly', () => {
            render(
                <>
                    <BadgeItem name="Badge 1" description="Desc 1" rarity="COMMON" />
                    <BadgeItem name="Badge 2" description="Desc 2" rarity="RARE" />
                    <BadgeItem name="Badge 3" description="Desc 3" rarity="EPIC" />
                </>
            );
            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Badge 2')).toBeInTheDocument();
            expect(screen.getByText('Badge 3')).toBeInTheDocument();
        });

        it('should handle undefined rarity gracefully', () => {
            render(<BadgeItem name="Test" description="Desc" rarity={'UNKNOWN' as any} />);
            expect(screen.getByText('Test')).toBeInTheDocument();
            expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
        });
    });

    describe('RarityBadge Component', () => {
        it('should render with children and gray color', () => {
            render(<RarityBadge color="gray">Common</RarityBadge>);
            const badge = screen.getByText('Common');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-gray-700');
            expect(badge).toHaveClass('text-gray-300');
        });

        it('should apply correct classes for green color', () => {
            render(<RarityBadge color="green">Uncommon</RarityBadge>);
            const badge = screen.getByText('Uncommon');
            expect(badge).toHaveClass('bg-green-900/50');
            expect(badge).toHaveClass('text-green-300');
            expect(badge).toHaveClass('border-green-500/30');
        });

        it('should apply correct classes for purple color', () => {
            render(<RarityBadge color="purple">Rare</RarityBadge>);
            const badge = screen.getByText('Rare');
            expect(badge).toHaveClass('bg-purple-900/50');
            expect(badge).toHaveClass('text-purple-300');
            expect(badge).toHaveClass('border-purple-500/30');
        });

        it('should apply correct classes for orange color', () => {
            render(<RarityBadge color="orange">Epic</RarityBadge>);
            const badge = screen.getByText('Epic');
            expect(badge).toHaveClass('bg-orange-900/50');
            expect(badge).toHaveClass('text-orange-300');
            expect(badge).toHaveClass('border-orange-500/30');
        });

        it('should apply correct classes for red color', () => {
            render(<RarityBadge color="red">Legendary</RarityBadge>);
            const badge = screen.getByText('Legendary');
            expect(badge).toHaveClass('bg-red-900/50');
            expect(badge).toHaveClass('text-red-300');
            expect(badge).toHaveClass('border-red-500/30');
        });

        it('should render as div with consistent classes', () => {
            const { container } = render(<RarityBadge color="gray">Test</RarityBadge>);
            const badge = container.firstChild as HTMLElement;
            expect(badge.tagName).toBe('DIV');
            expect(badge).toHaveClass('border');
            expect(badge).toHaveClass('px-2');
            expect(badge).toHaveClass('py-1');
            expect(badge).toHaveClass('rounded');
            expect(badge).toHaveClass('text-xs');
            expect(badge).toHaveClass('font-bold');
            expect(badge).toHaveClass('text-center');
        });

        it('should handle empty children', () => {
            const { container } = render(<RarityBadge color="gray"></RarityBadge>);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should handle complex React nodes as children', () => {
            render(
                <RarityBadge color="purple">
                    <span>Rare</span> <strong>Item</strong>
                </RarityBadge>
            );
            expect(screen.getByText('Rare')).toBeInTheDocument();
            expect(screen.getByText('Item')).toBeInTheDocument();
        });

        it('should handle emojis and special characters', () => {
            render(<RarityBadge color="red">🔥 LEGENDARY! @#$</RarityBadge>);
            expect(screen.getByText('🔥 LEGENDARY! @#$')).toBeInTheDocument();
        });

        it('should handle invalid color gracefully', () => {
            render(<RarityBadge color={'invalid' as any}>Test</RarityBadge>);
            const badge = screen.getByText('Test');
            expect(badge).toBeInTheDocument();
            // Should not have any color classes but still render
        });

        it('should render multiple rarity badges correctly', () => {
            render(
                <>
                    <RarityBadge color="gray">Common</RarityBadge>
                    <RarityBadge color="green">Uncommon</RarityBadge>
                    <RarityBadge color="purple">Rare</RarityBadge>
                    <RarityBadge color="orange">Epic</RarityBadge>
                    <RarityBadge color="red">Legendary</RarityBadge>
                </>
            );
            expect(screen.getByText('Common')).toBeInTheDocument();
            expect(screen.getByText('Uncommon')).toBeInTheDocument();
            expect(screen.getByText('Rare')).toBeInTheDocument();
            expect(screen.getByText('Epic')).toBeInTheDocument();
            expect(screen.getByText('Legendary')).toBeInTheDocument();
        });

        it('should handle very long text content', () => {
            const longText = 'LEGENDARY '.repeat(10);
            render(<RarityBadge color="red">{longText}</RarityBadge>);
            expect(screen.getByText(longText.trim())).toBeInTheDocument();
        });
    });

    describe('Integration Tests', () => {
        it('should render complete badge category with items', () => {
            render(
                <BadgeCategory title="Trading Badges">
                    <BadgeItem name="First Trade" description="Complete your first trade" rarity="COMMON" />
                    <BadgeItem name="Whale Trader" description="Trade over 1M SOL" rarity="LEGENDARY" />
                    <BadgeItem name="Diamond Hands" description="Hold for 30 days" rarity="EPIC" />
                </BadgeCategory>
            );

            expect(screen.getByText('Trading Badges')).toBeInTheDocument();
            expect(screen.getByText('First Trade')).toBeInTheDocument();
            expect(screen.getByText('Whale Trader')).toBeInTheDocument();
            expect(screen.getByText('Diamond Hands')).toBeInTheDocument();
        });

        it('should render multiple badge categories', () => {
            render(
                <>
                    <BadgeCategory title="Category 1">
                        <BadgeItem name="Badge 1" description="Desc 1" rarity="COMMON" />
                    </BadgeCategory>
                    <BadgeCategory title="Category 2">
                        <BadgeItem name="Badge 2" description="Desc 2" rarity="RARE" />
                    </BadgeCategory>
                </>
            );

            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Badge 2')).toBeInTheDocument();
        });

        it('should combine Badge and RarityBadge components', () => {
            render(
                <div>
                    <Badge>Standard Badge</Badge>
                    <RarityBadge color="purple">Rare Badge</RarityBadge>
                </div>
            );

            expect(screen.getByText('Standard Badge')).toBeInTheDocument();
            expect(screen.getByText('Rare Badge')).toBeInTheDocument();
        });

        it('should handle deeply nested component structure', () => {
            render(
                <BadgeCategory title="Nested">
                    <div>
                        <Badge>
                            <RarityBadge color="red">Legendary</RarityBadge>
                        </Badge>
                    </div>
                </BadgeCategory>
            );

            expect(screen.getByText('Nested')).toBeInTheDocument();
            expect(screen.getByText('Legendary')).toBeInTheDocument();
        });
    });

    describe('Accessibility and Semantic HTML', () => {
        it('should use appropriate semantic HTML elements', () => {
            const { container } = render(
                <BadgeCategory title="Accessibility Test">
                    <BadgeItem name="Test" description="Desc" rarity="COMMON" />
                </BadgeCategory>
            );

            const heading = container.querySelector('h4');
            expect(heading).toBeInTheDocument();
            expect(heading?.textContent).toBe('Accessibility Test');
        });

        it('should maintain proper DOM structure', () => {
            const { container } = render(
                <BadgeCategory title="Structure">
                    <Badge>Test</Badge>
                </BadgeCategory>
            );

            const categoryDiv = container.querySelector('.bg-black\\/30');
            expect(categoryDiv).toBeInTheDocument();
            const heading = categoryDiv?.querySelector('h4');
            expect(heading).toBeInTheDocument();
            const childrenDiv = categoryDiv?.querySelector('.space-y-2');
            expect(childrenDiv).toBeInTheDocument();
        });
    });

    describe('Performance and Stress Tests', () => {
        it('should render many badges efficiently', () => {
            const badges = Array.from({ length: 100 }, (_, i) => (
                <Badge key={i}>Badge {i}</Badge>
            ));

            const { container } = render(<div>{badges}</div>);
            expect(container.querySelectorAll('span')).toHaveLength(100);
        });

        it('should render many badge items efficiently', () => {
            const items = Array.from({ length: 100 }, (_, i) => (
                <BadgeItem
                    key={i}
                    name={`Badge ${i}`}
                    description={`Description ${i}`}
                    rarity={['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'][i % 5] as any}
                />
            ));

            render(<div>{items}</div>);
            expect(screen.getByText('Badge 0')).toBeInTheDocument();
            expect(screen.getByText('Badge 99')).toBeInTheDocument();
        });

        it('should handle rapid re-renders', () => {
            const { rerender } = render(<Badge>Initial</Badge>);

            for (let i = 0; i < 100; i++) {
                rerender(<Badge>Updated {i}</Badge>);
            }

            expect(screen.getByText('Updated 99')).toBeInTheDocument();
        });
    });
});
