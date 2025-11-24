import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDegenCard } from '@/hooks/useDegenCard';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { logger } from '@/lib/logger';

// Mock dependencies 
jest.mock('@solana/wallet-adapter-react');
jest.mock('@/lib/logger');

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('useDegenCard', () => {
    const mockPublicKey = new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseWallet.mockReturnValue({
            publicKey: mockPublicKey,
            connected: true,
        } as any);
    });

    describe('Initialization', () => {
        it('should initialize with default state', () => {
            const { result } = renderHook(() => useDegenCard());

            expect(result.current.walletAddress).toBe('');
            expect(result.current.cardImage).toBe(null);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
            expect(result.current.hasPaid).toBe(false);
        });

        it('should set mounted state on mount', () => {
            const { result } = renderHook(() => useDegenCard());

            waitFor(() => {
                expect(result.current.mounted).toBe(true);
            });
        });
    });

    describe('generateCard - Connected Wallet', () => {
        const mockAnalysisData = {
            degenScore: 75,
            totalTrades: 100,
            winRate: 0.6,
        };

        beforeEach(() => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAnalysisData,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    blob: async () => new Blob(['image'], { type: 'image/png' }),
                });
        });

        it('should generate card successfully', async () => {
            const { result } = renderHook(() => useDegenCard());

            await act(async () => {
                await result.current.generateCard();
            });

            await waitFor(() => {
                expect(result.current.cardImage).toBe('blob:mock-url');
            });

            expect(result.current.walletAddress).toBe(mockPublicKey.toBase58());
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should show celebration for high score', async () => {
            (global.fetch as jest.Mock).mockClear().mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...mockAnalysisData, degenScore: 92 }),
            }).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            }).mockResolvedValueOnce({
                ok: true,
                blob: async () => new Blob(['img'], { type: 'image/png' }),
            });

            const { result } = renderHook(() => useDegenCard());

            await act(async () => {
                await result.current.generateCard();
            });

            await waitFor(() => {
                expect(result.current.celebrationType).toBe('legendary');
            }, { timeout: 3000 });
        });
    });

    describe('generateCard - Disconnected Wallet', () => {
        it('should show error when wallet not connected', async () => {
            mockUseWallet.mockReturnValue({
                publicKey: null,
                connected: false,
            } as any);

            const { result } = renderHook(() => useDegenCard());

            await act(async () => {
                await result.current.generateCard();
            });

            expect(result.current.error).toBe('Please connect your wallet first');
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('handleUpgrade', () => {
        it('should set hasPaid and trigger celebration', () => {
            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.handleUpgrade();
            });

            expect(result.current.hasPaid).toBe(true);
            expect(result.current.showUpgradeModal).toBe(false);
            expect(result.current.showCelebration).toBe(true);
            expect(result.current.celebrationType).toBe('premium-unlock');
        });

        it('should show profile modal after celebration', async () => {
            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.handleUpgrade();
            });

            await waitFor(() => {
                expect(result.current.showProfileModal).toBe(true);
            }, { timeout: 2000 });
        });
    });

    describe('handleProfileSubmit', () => {
        const mockProfileData = {
            displayName: 'Test User',
            bio: 'Test bio',
            twitter: '@testuser',
        };

        it('should save profile and regenerate card', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    blob: async () => new Blob(['premium-image'], { type: 'image/png' }),
                });

            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.setShowProfileModal(true);
            });

            await act(async () => {
                await result.current.handleProfileSubmit(mockProfileData);
            });

            await waitFor(() => {
                expect(result.current.hasPaid).toBe(true);
            });

            expect(fetch).toHaveBeenCalledWith('/api/update-profile', expect.any(Object));
            expect(fetch).toHaveBeenCalledWith('/api/generate-card?nocache=true', expect.any(Object));
        });

        it('should handle profile save errors', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Profile save failed' }),
            });

            const mockAlert = jest.spyOn(window, 'alert').mockImplementation();

            const { result } = renderHook(() => useDegenCard());

            await act(async () => {
                await result.current.handleProfileSubmit(mockProfileData);
            });

            expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Profile save failed'));
            mockAlert.mockRestore();
        });
    });

    describe('Download Functions', () => {
        it('should download premium card', () => {
            const { result } = renderHook(() => useDegenCard());
            const mockClick = jest.fn();

            jest.spyOn(document.body, 'appendChild').mockImplementation();
            jest.spyOn(document.body, 'removeChild').mockImplementation();
            jest.spyOn(document, 'createElement').mockReturnValue({
                click: mockClick,
                download: '',
                href: '',
            } as any);

            act(() => {
                result.current.downloadPremiumCard();
            });

            expect(mockClick).toHaveBeenCalled();
        });
    });

    describe('Share and Skip Flows', () => {
        it('should handle shared action', () => {
            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.handleShared();
            });

            expect(result.current.showShareModal).toBe(false);
        });

        it('should handle skip share', () => {
            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.handleSkipShare();
            });

            expect(result.current.showShareModal).toBe(false);
        });

        it('should handle skip upgrade and show share modal', async () => {
            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.handleSkip();
            });

            expect(result.current.showUpgradeModal).toBe(false);

            await waitFor(() => {
                expect(result.current.showShareModal).toBe(true);
            }, { timeout: 1000 });
        });
    });

    describe('Promo Code Flow', () => {
        it('should handle promo code users', () => {
            const { result } = renderHook(() => useDegenCard());

            act(() => {
                result.current.setHasPromoCode(true);
                result.current.setPromoCodeApplied('PROMO123');
            });

            expect(result.current.hasPromoCode).toBe(true);
            expect(result.current.promoCodeApplied).toBe('PROMO123');
        });
    });

    describe('Error Handling', () => {
        it('should handle analyze API error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Analysis failed' }),
            });

            const { result } = renderHook(() => useDegenCard());

            await act(async () => {
                await result.current.generateCard();
            });

            expect(result.current.error).toBe('Analysis failed');
            expect(result.current.loading).toBe(false);
        });
    });

    describe('Achievement System', () => {
        it('should trigger first card achievement', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ degenScore: 50 }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    blob: async () => new Blob(['img'], { type: 'image/png' }),
                });

            const { result } = renderHook(() => useDegenCard());

            await act(async () => {
                await result.current.generateCard();
            });

            await waitFor(() => {
                expect(result.current.currentAchievement).toBeTruthy();
            }, { timeout: 3000 });
        });
    });
});
