import { getTierConfig, getLevelPhrase, formatNumber, getFOMOPhrase } from '../components/leaderboard/utils';

describe('Leaderboard Utils - Extreme Test Suite', () => {
    describe('getTierConfig - Boundary Conditions', () => {
        // LEGENDARY tier tests (>= 90)
        describe('LEGENDARY tier', () => {
            it('should return LEGENDARY for exact boundary 90', () => {
                const tier = getTierConfig(90);
                expect(tier.name).toBe('LEGENDARY');
                expect(tier.emoji).toBe('👑');
                expect(tier.shine).toBe(true);
            });

            it('should return LEGENDARY for 90.00001', () => {
                const tier = getTierConfig(90.00001);
                expect(tier.name).toBe('LEGENDARY');
            });

            it('should return LEGENDARY for extremely high scores', () => {
                expect(getTierConfig(100)).toMatchObject({ name: 'LEGENDARY' });
                expect(getTierConfig(999)).toMatchObject({ name: 'LEGENDARY' });
                expect(getTierConfig(1000000)).toMatchObject({ name: 'LEGENDARY' });
            });

            it('should return LEGENDARY for edge case 99.999999', () => {
                const tier = getTierConfig(99.999999);
                expect(tier.name).toBe('LEGENDARY');
            });
        });

        // MASTER tier tests (>= 80 && < 90)
        describe('MASTER tier', () => {
            it('should return MASTER for exact boundary 80', () => {
                const tier = getTierConfig(80);
                expect(tier.name).toBe('MASTER');
                expect(tier.emoji).toBe('💎');
                expect(tier.shine).toBe(true);
            });

            it('should return MASTER for 89.999999', () => {
                const tier = getTierConfig(89.999999);
                expect(tier.name).toBe('MASTER');
            });

            it('should NOT return MASTER for 90', () => {
                const tier = getTierConfig(90);
                expect(tier.name).not.toBe('MASTER');
                expect(tier.name).toBe('LEGENDARY');
            });

            it('should return MASTER for 85.5', () => {
                const tier = getTierConfig(85.5);
                expect(tier.name).toBe('MASTER');
            });
        });

        // DIAMOND tier tests (>= 70 && < 80)
        describe('DIAMOND tier', () => {
            it('should return DIAMOND for exact boundary 70', () => {
                const tier = getTierConfig(70);
                expect(tier.name).toBe('DIAMOND');
                expect(tier.emoji).toBe('💠');
                expect(tier.shine).toBe(true);
            });

            it('should return DIAMOND for 79.999999', () => {
                const tier = getTierConfig(79.999999);
                expect(tier.name).toBe('DIAMOND');
            });

            it('should NOT return DIAMOND for 80', () => {
                const tier = getTierConfig(80);
                expect(tier.name).not.toBe('DIAMOND');
            });
        });

        // PLATINUM tier tests (>= 60 && < 70)
        describe('PLATINUM tier', () => {
            it('should return PLATINUM for exact boundary 60', () => {
                const tier = getTierConfig(60);
                expect(tier.name).toBe('PLATINUM');
                expect(tier.emoji).toBe('⚡');
                expect(tier.shine).toBe(false);
            });

            it('should return PLATINUM for 69.999999', () => {
                const tier = getTierConfig(69.999999);
                expect(tier.name).toBe('PLATINUM');
            });

            it('should NOT return PLATINUM for 70', () => {
                const tier = getTierConfig(70);
                expect(tier.name).not.toBe('PLATINUM');
            });
        });

        // GOLD tier tests (>= 50 && < 60)
        describe('GOLD tier', () => {
            it('should return GOLD for exact boundary 50', () => {
                const tier = getTierConfig(50);
                expect(tier.name).toBe('GOLD');
                expect(tier.emoji).toBe('🌟');
                expect(tier.shine).toBe(false);
            });

            it('should return GOLD for 59.999999', () => {
                const tier = getTierConfig(59.999999);
                expect(tier.name).toBe('GOLD');
            });

            it('should NOT return GOLD for 60', () => {
                const tier = getTierConfig(60);
                expect(tier.name).not.toBe('GOLD');
            });
        });

        // DEGEN tier tests (< 50)
        describe('DEGEN tier', () => {
            it('should return DEGEN for 49.999999', () => {
                const tier = getTierConfig(49.999999);
                expect(tier.name).toBe('DEGEN');
                expect(tier.emoji).toBe('🎮');
                expect(tier.shine).toBe(false);
            });

            it('should return DEGEN for 0', () => {
                const tier = getTierConfig(0);
                expect(tier.name).toBe('DEGEN');
            });

            it('should return DEGEN for negative scores', () => {
                expect(getTierConfig(-1)).toMatchObject({ name: 'DEGEN' });
                expect(getTierConfig(-100)).toMatchObject({ name: 'DEGEN' });
                expect(getTierConfig(-999999)).toMatchObject({ name: 'DEGEN' });
            });

            it('should return DEGEN for very small positive numbers', () => {
                expect(getTierConfig(0.0001)).toMatchObject({ name: 'DEGEN' });
                expect(getTierConfig(1)).toMatchObject({ name: 'DEGEN' });
                expect(getTierConfig(25)).toMatchObject({ name: 'DEGEN' });
            });
        });

        // Edge cases and special values
        describe('Edge cases', () => {
            it('should handle decimal precision correctly', () => {
                expect(getTierConfig(89.9)).toMatchObject({ name: 'MASTER' });
                expect(getTierConfig(90.1)).toMatchObject({ name: 'LEGENDARY' });
                expect(getTierConfig(79.99999999999)).toMatchObject({ name: 'DIAMOND' });
            });

            it('should handle NaN gracefully', () => {
                const tier = getTierConfig(NaN);
                // NaN comparisons are always false, so should return DEGEN
                expect(tier.name).toBe('DEGEN');
            });

            it('should handle Infinity', () => {
                const tier = getTierConfig(Infinity);
                expect(tier.name).toBe('LEGENDARY');
            });

            it('should handle -Infinity', () => {
                const tier = getTierConfig(-Infinity);
                expect(tier.name).toBe('DEGEN');
            });

            it('should return consistent tier config structure', () => {
                const tier = getTierConfig(75);
                expect(tier).toHaveProperty('name');
                expect(tier).toHaveProperty('emoji');
                expect(tier).toHaveProperty('gradient');
                expect(tier).toHaveProperty('border');
                expect(tier).toHaveProperty('glow');
                expect(tier).toHaveProperty('bgPattern');
                expect(tier).toHaveProperty('textColor');
                expect(tier).toHaveProperty('badgeGradient');
                expect(tier).toHaveProperty('shine');
            });
        });
    });

    describe('getLevelPhrase - All Ranges', () => {
        it('should return correct phrase for level >= 50', () => {
            expect(getLevelPhrase(50)).toBe('🔥 Absolute Gigachad');
            expect(getLevelPhrase(100)).toBe('🔥 Absolute Gigachad');
            expect(getLevelPhrase(999)).toBe('🔥 Absolute Gigachad');
        });

        it('should return correct phrase for level >= 40 and < 50', () => {
            expect(getLevelPhrase(40)).toBe('💪 Degen Overlord');
            expect(getLevelPhrase(45)).toBe('💪 Degen Overlord');
            expect(getLevelPhrase(49)).toBe('💪 Degen Overlord');
            expect(getLevelPhrase(49.999)).toBe('💪 Degen Overlord');
        });

        it('should return correct phrase for level >= 30 and < 40', () => {
            expect(getLevelPhrase(30)).toBe('🚀 Moon Mission Commander');
            expect(getLevelPhrase(35)).toBe('🚀 Moon Mission Commander');
            expect(getLevelPhrase(39)).toBe('🚀 Moon Mission Commander');
        });

        it('should return correct phrase for level >= 20 and < 30', () => {
            expect(getLevelPhrase(20)).toBe('💎 Diamond Handed Legend');
            expect(getLevelPhrase(25)).toBe('💎 Diamond Handed Legend');
            expect(getLevelPhrase(29)).toBe('💎 Diamond Handed Legend');
        });

        it('should return correct phrase for level >= 15 and < 20', () => {
            expect(getLevelPhrase(15)).toBe('⚡ Certified Degen');
            expect(getLevelPhrase(17)).toBe('⚡ Certified Degen');
            expect(getLevelPhrase(19)).toBe('⚡ Certified Degen');
        });

        it('should return correct phrase for level >= 10 and < 15', () => {
            expect(getLevelPhrase(10)).toBe('🎯 Getting There');
            expect(getLevelPhrase(12)).toBe('🎯 Getting There');
            expect(getLevelPhrase(14)).toBe('🎯 Getting There');
        });

        it('should return correct phrase for level >= 5 and < 10', () => {
            expect(getLevelPhrase(5)).toBe('🐣 Baby Degen');
            expect(getLevelPhrase(6)).toBe('🐣 Baby Degen');
            expect(getLevelPhrase(9)).toBe('🐣 Baby Degen');
        });

        it('should return correct phrase for level < 5', () => {
            expect(getLevelPhrase(0)).toBe('😅 Just Started');
            expect(getLevelPhrase(1)).toBe('😅 Just Started');
            expect(getLevelPhrase(4)).toBe('😅 Just Started');
        });

        // Boundary tests
        it('should handle exact boundaries correctly', () => {
            expect(getLevelPhrase(49.999)).toBe('💪 Degen Overlord');
            expect(getLevelPhrase(50)).toBe('🔥 Absolute Gigachad');
            expect(getLevelPhrase(39.999)).toBe('🚀 Moon Mission Commander');
            expect(getLevelPhrase(40)).toBe('💪 Degen Overlord');
        });

        // Edge cases
        it('should handle negative levels', () => {
            expect(getLevelPhrase(-1)).toBe('😅 Just Started');
            expect(getLevelPhrase(-100)).toBe('😅 Just Started');
        });

        it('should handle decimal levels', () => {
            expect(getLevelPhrase(15.5)).toBe('⚡ Certified Degen');
            expect(getLevelPhrase(4.999)).toBe('😅 Just Started');
        });

        it('should handle very large levels', () => {
            expect(getLevelPhrase(10000)).toBe('🔥 Absolute Gigachad');
        });

        it('should handle NaN', () => {
            expect(getLevelPhrase(NaN)).toBe('😅 Just Started');
        });

        it('should handle Infinity', () => {
            expect(getLevelPhrase(Infinity)).toBe('🔥 Absolute Gigachad');
        });
    });

    describe('formatNumber - Comprehensive Tests', () => {
        describe('Billions formatting', () => {
            it('should format billions correctly', () => {
                expect(formatNumber(1000000000)).toBe('1.00B');
                expect(formatNumber(1500000000)).toBe('1.50B');
                expect(formatNumber(9999999999)).toBe('10.00B');
            });

            it('should handle decimal billions', () => {
                expect(formatNumber(1234567890)).toBe('1.23B');
                expect(formatNumber(5678912345)).toBe('5.68B');
            });

            it('should handle very large billions', () => {
                expect(formatNumber(999999999999)).toBe('1000.00B');
                expect(formatNumber(1e15)).toBe('1000000.00B');
            });
        });

        describe('Millions formatting', () => {
            it('should format millions correctly', () => {
                expect(formatNumber(1000000)).toBe('1.00M');
                expect(formatNumber(1500000)).toBe('1.50M');
                expect(formatNumber(999999999)).toBe('1000.00M');
            });

            it('should handle decimal millions', () => {
                expect(formatNumber(1234567)).toBe('1.23M');
                expect(formatNumber(9876543)).toBe('9.88M');
            });
        });

        describe('Thousands formatting', () => {
            it('should format thousands correctly', () => {
                expect(formatNumber(1000)).toBe('1.00K');
                expect(formatNumber(1500)).toBe('1.50K');
                expect(formatNumber(999999)).toBe('1000.00K');
            });

            it('should handle decimal thousands', () => {
                expect(formatNumber(1234)).toBe('1.23K');
                expect(formatNumber(9876)).toBe('9.88K');
            });

            it('should handle edge case 999', () => {
                expect(formatNumber(999)).toBe('999.00');
            });
        });

        describe('Small numbers formatting', () => {
            it('should format small numbers with default 2 decimals', () => {
                expect(formatNumber(100)).toBe('100.00');
                expect(formatNumber(50.5)).toBe('50.50');
                expect(formatNumber(1)).toBe('1.00');
            });

            it('should format zero', () => {
                expect(formatNumber(0)).toBe('0.00');
            });

            it('should handle very small numbers', () => {
                expect(formatNumber(0.001)).toBe('0.00');
                expect(formatNumber(0.999)).toBe('1.00');
            });
        });

        describe('Custom decimals parameter', () => {
            it('should respect custom decimal places', () => {
                expect(formatNumber(1234567, 0)).toBe('1M');
                expect(formatNumber(1234567, 1)).toBe('1.2M');
                expect(formatNumber(1234567, 3)).toBe('1.235M');
                expect(formatNumber(1234567, 4)).toBe('1.2346M');
            });

            it('should work for all number ranges with custom decimals', () => {
                expect(formatNumber(1500000000, 1)).toBe('1.5B');
                expect(formatNumber(1500000, 0)).toBe('2M');
                expect(formatNumber(1500, 3)).toBe('1.500K');
                expect(formatNumber(100, 0)).toBe('100');
            });

            it('should handle negative decimal values gracefully', () => {
                // toFixed with negative values throws RangeError
                expect(() => formatNumber(1000, -1)).toThrow(RangeError);
            });
        });

        describe('Negative numbers', () => {
            it('should handle negative billions (absolute value used)', () => {
                // formatNumber doesn't handle negatives specially, uses absolute comparison
                // This documents current behavior
                expect(formatNumber(-1500000000)).toBe('-1500000000.00');
            });

            it('should handle negative millions', () => {
                expect(formatNumber(-1500000)).toBe('-1500000.00');
            });

            it('should handle negative thousands', () => {
                expect(formatNumber(-1500)).toBe('-1500.00');
            });

            it('should handle negative small numbers', () => {
                expect(formatNumber(-100)).toBe('-100.00');
                expect(formatNumber(-0.5)).toBe('-0.50');
            });
        });

        describe('Special values', () => {
            it('should handle null and undefined', () => {
                expect(formatNumber(null as any)).toBe('N/A');
                expect(formatNumber(undefined as any)).toBe('N/A');
            });

            it('should handle NaN', () => {
                expect(formatNumber(NaN)).toBe('NaN');
            });

            it('should handle Infinity', () => {
                // Infinity >= 1e9 is true, so it formats as B
                expect(formatNumber(Infinity)).toBe('InfinityB');
                // -Infinity < 1e9 returns as-is
                expect(formatNumber(-Infinity)).toBe('-Infinity');
            });
        });

        describe('Boundary precision tests', () => {
            it('should handle exact boundaries', () => {
                expect(formatNumber(999.999)).toBe('1000.00');
                expect(formatNumber(1000.001)).toBe('1.00K');
                expect(formatNumber(999999.999)).toBe('1000.00K');
                expect(formatNumber(1000000.001)).toBe('1.00M');
                expect(formatNumber(999999999.999)).toBe('1000.00M');
                expect(formatNumber(1000000000.001)).toBe('1.00B');
            });

            it('should handle floating point precision', () => {
                expect(formatNumber(1e3)).toBe('1.00K');
                expect(formatNumber(1e6)).toBe('1.00M');
                expect(formatNumber(1e9)).toBe('1.00B');
            });
        });

        describe('Real-world examples', () => {
            it('should format realistic trading volumes', () => {
                expect(formatNumber(45678.90)).toBe('45.68K');
                expect(formatNumber(1234567.89)).toBe('1.23M');
                expect(formatNumber(9876543210.12)).toBe('9.88B');
            });

            it('should format realistic P&L values', () => {
                expect(formatNumber(-456.78)).toBe('-456.78');
                expect(formatNumber(123.45)).toBe('123.45');
                // Negative numbers don't get formatted - this documents current behavior
                expect(formatNumber(-1234567)).toBe('-1234567.00');
            });
        });

        describe('Stress tests', () => {
            it('should handle extremely large numbers', () => {
                expect(formatNumber(Number.MAX_SAFE_INTEGER)).toContain('B');
                expect(formatNumber(1e20)).toBe('100000000000.00B');
            });

            it('should handle extremely small positive numbers', () => {
                expect(formatNumber(Number.MIN_VALUE)).toBe('0.00');
                expect(formatNumber(1e-10)).toBe('0.00');
            });

            it('should handle rapid calls with different values', () => {
                const values = [0, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];
                values.forEach(val => {
                    expect(formatNumber(val)).toBeDefined();
                    expect(typeof formatNumber(val)).toBe('string');
                });
            });
        });
    });

    describe('getFOMOPhrase - Complete Coverage', () => {
        it('should return correct phrase for score >= 95', () => {
            expect(getFOMOPhrase(95)).toBe('🔥 GOD MODE - They Bow to You');
            expect(getFOMOPhrase(100)).toBe('🔥 GOD MODE - They Bow to You');
            expect(getFOMOPhrase(999)).toBe('🔥 GOD MODE - They Bow to You');
        });

        it('should return correct phrase for 90 <= score < 95', () => {
            expect(getFOMOPhrase(90)).toBe('👑 APEX PREDATOR - Pure Domination');
            expect(getFOMOPhrase(92)).toBe('👑 APEX PREDATOR - Pure Domination');
            expect(getFOMOPhrase(94.999)).toBe('👑 APEX PREDATOR - Pure Domination');
        });

        it('should return correct phrase for 85 <= score < 90', () => {
            expect(getFOMOPhrase(85)).toBe('💎 GENERATIONAL WEALTH - GG EZ');
            expect(getFOMOPhrase(87)).toBe('💎 GENERATIONAL WEALTH - GG EZ');
            expect(getFOMOPhrase(89.999)).toBe('💎 GENERATIONAL WEALTH - GG EZ');
        });

        it('should return correct phrase for 80 <= score < 85', () => {
            expect(getFOMOPhrase(80)).toBe('⚡ MAIN CHARACTER - Eating Good');
            expect(getFOMOPhrase(82)).toBe('⚡ MAIN CHARACTER - Eating Good');
            expect(getFOMOPhrase(84.999)).toBe('⚡ MAIN CHARACTER - Eating Good');
        });

        it('should return correct phrase for 75 <= score < 80', () => {
            expect(getFOMOPhrase(75)).toBe('🚀 MOON MISSION - Keep Stacking');
        });

        it('should return correct phrase for 70 <= score < 75', () => {
            expect(getFOMOPhrase(70)).toBe('🔥 KILLING IT - Above Average Chad');
        });

        it('should return correct phrase for 65 <= score < 70', () => {
            expect(getFOMOPhrase(65)).toBe('💪 SOLID - You\'ll Make It Anon');
        });

        it('should return correct phrase for 60 <= score < 65', () => {
            expect(getFOMOPhrase(60)).toBe('📈 MID CURVE - Touch Grass King');
        });

        it('should return correct phrase for 55 <= score < 60', () => {
            expect(getFOMOPhrase(55)).toBe('🎯 SLIGHTLY MID - Do Better');
        });

        it('should return correct phrase for 50 <= score < 55', () => {
            expect(getFOMOPhrase(50)).toBe('😬 NGMI VIBES - Yikes');
        });

        it('should return correct phrase for 40 <= score < 50', () => {
            expect(getFOMOPhrase(40)).toBe('📉 EXIT LIQUIDITY - That\'s You');
        });

        it('should return correct phrase for 30 <= score < 40', () => {
            expect(getFOMOPhrase(30)).toBe('💀 ABSOLUTELY COOKED - RIP');
        });

        it('should return correct phrase for 20 <= score < 30', () => {
            expect(getFOMOPhrase(20)).toBe('🤡 CIRCUS CLOWN - Everyone\'s Laughing');
        });

        it('should return correct phrase for 10 <= score < 20', () => {
            expect(getFOMOPhrase(10)).toBe('⚰️ DELETE APP - Uninstall Now');
        });

        it('should return correct phrase for score < 10', () => {
            expect(getFOMOPhrase(5)).toBe('🪦 QUIT FOREVER - It\'s Over Bro');
            expect(getFOMOPhrase(0)).toBe('🪦 QUIT FOREVER - It\'s Over Bro');
            expect(getFOMOPhrase(-100)).toBe('🪦 QUIT FOREVER - It\'s Over Bro');
        });

        // Boundary tests
        it('should handle exact boundaries correctly', () => {
            expect(getFOMOPhrase(94.999)).toBe('👑 APEX PREDATOR - Pure Domination');
            expect(getFOMOPhrase(95)).toBe('🔥 GOD MODE - They Bow to You');
            expect(getFOMOPhrase(89.999)).toBe('💎 GENERATIONAL WEALTH - GG EZ');
            expect(getFOMOPhrase(90)).toBe('👑 APEX PREDATOR - Pure Domination');
        });

        // Edge cases
        it('should handle special numeric values', () => {
            expect(getFOMOPhrase(NaN)).toBe('🪦 QUIT FOREVER - It\'s Over Bro');
            expect(getFOMOPhrase(Infinity)).toBe('🔥 GOD MODE - They Bow to You');
            expect(getFOMOPhrase(-Infinity)).toBe('🪦 QUIT FOREVER - It\'s Over Bro');
        });

        it('should handle decimal scores', () => {
            expect(getFOMOPhrase(95.5)).toBe('🔥 GOD MODE - They Bow to You');
            expect(getFOMOPhrase(89.1)).toBe('💎 GENERATIONAL WEALTH - GG EZ');
            expect(getFOMOPhrase(50.001)).toBe('😬 NGMI VIBES - Yikes');
        });

        it('should return strings with correct format', () => {
            const phrase = getFOMOPhrase(75);
            expect(typeof phrase).toBe('string');
            expect(phrase.length).toBeGreaterThan(0);
            expect(phrase).toContain(' - ');
        });

        // All boundary edges
        it('should test all critical boundaries', () => {
            const boundaries = [
                { score: 95, expectedPhrase: '🔥 GOD MODE - They Bow to You' },
                { score: 94.999, expectedPhrase: '👑 APEX PREDATOR - Pure Domination' },
                { score: 90, expectedPhrase: '👑 APEX PREDATOR - Pure Domination' },
                { score: 89.999, expectedPhrase: '💎 GENERATIONAL WEALTH - GG EZ' },
                { score: 85, expectedPhrase: '💎 GENERATIONAL WEALTH - GG EZ' },
                { score: 84.999, expectedPhrase: '⚡ MAIN CHARACTER - Eating Good' },
            ];

            boundaries.forEach(({ score, expectedPhrase }) => {
                expect(getFOMOPhrase(score)).toBe(expectedPhrase);
            });
        });
    });

    describe('Integration and Cross-function Tests', () => {
        it('should provide consistent tier and FOMO messaging', () => {
            const score = 92;
            const tier = getTierConfig(score);
            const fomo = getFOMOPhrase(score);

            expect(tier.name).toBe('LEGENDARY');
            expect(fomo).toBe('👑 APEX PREDATOR - Pure Domination');
        });

        it('should handle complete user profile formatting', () => {
            const score = 75;
            const level = 25;
            const volume = 1234567.89;
            const pnl = -5432.10;

            expect(getTierConfig(score).name).toBe('DIAMOND');
            expect(getLevelPhrase(level)).toBe('💎 Diamond Handed Legend');
            expect(formatNumber(volume)).toBe('1.23M');
            // Negative values don't get K/M/B formatting
            expect(formatNumber(pnl)).toBe('-5432.10');
            expect(getFOMOPhrase(score)).toBe('🚀 MOON MISSION - Keep Stacking');
        });

        it('should handle edge case profiles', () => {
            // Beginner profile
            expect(getTierConfig(10).name).toBe('DEGEN');
            expect(getLevelPhrase(1)).toBe('😅 Just Started');
            expect(formatNumber(100)).toBe('100.00');

            // Expert profile
            expect(getTierConfig(95).name).toBe('LEGENDARY');
            expect(getLevelPhrase(50)).toBe('🔥 Absolute Gigachad');
            expect(formatNumber(1e9)).toBe('1.00B');
        });
    });

    describe('Performance and Stress Tests', () => {
        it('should handle rapid successive calls', () => {
            const iterations = 10000;
            const start = Date.now();

            for (let i = 0; i < iterations; i++) {
                getTierConfig(Math.random() * 100);
                getLevelPhrase(Math.random() * 50);
                formatNumber(Math.random() * 1e9);
                getFOMOPhrase(Math.random() * 100);
            }

            const duration = Date.now() - start;
            expect(duration).toBeLessThan(1000); // Should complete in under 1 second
        });

        it('should maintain consistency across multiple calls with same input', () => {
            const score = 75.5;
            const results = Array.from({ length: 100 }, () => getTierConfig(score));

            results.forEach(result => {
                expect(result).toEqual(results[0]);
            });
        });

        it('should be deterministic for same inputs', () => {
            const testCases = [
                { fn: getTierConfig, input: 85 },
                { fn: getLevelPhrase, input: 25 },
                { fn: formatNumber, input: 1500000 },
                { fn: getFOMOPhrase, input: 70 },
            ];

            testCases.forEach(({ fn, input }) => {
                const result1 = (fn as any)(input);
                const result2 = (fn as any)(input);
                expect(result1).toEqual(result2);
            });
        });
    });
});
