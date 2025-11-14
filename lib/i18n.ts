/**
 * Internationalization configuration and translations
 */

export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Header
    title: 'DegenScore',
    subtitle: 'Track your trading mastery',
    viewLeaderboard: '🏆 View Leaderboard',

    // Payment
    connectWallet: 'Connect your wallet to mint this card',
    mintCard: '🎴 Mint Card for',
    price: 'Price',
    processingPayment: 'Processing Payment...',

    // Tiers
    plankton: 'Plankton',
    fish: 'Fish',
    dolphin: 'Dolphin',
    shark: 'Shark',
    whale: 'Whale',

    // Stats
    totalUsers: 'Total Users',
    premiumUsers: 'Premium Users',
    totalVolume: 'Total Volume',

    // Buttons
    generateCard: 'Generate Card',
    shareCard: 'Share Card',
    downloadCard: 'Download Card',
    compareCards: 'Compare Cards',
    documentation: 'Documentation',

    // Messages
    walletConnected: 'Wallet connected successfully',
    cardGenerated: 'Card generated successfully',
    error: 'An error occurred',

    // Compare
    compareTitle: 'Compare Cards',
    compareDescription: 'Compare two DegenScore cards side by side',
    enterWallet1: 'Enter first wallet address',
    enterWallet2: 'Enter second wallet address',
    compare: 'Compare',

    // Documentation
    docsTitle: 'Documentation',
    docsDescription: 'Learn how to use DegenScore',
    gettingStarted: 'Getting Started',
    features: 'Features',
    faq: 'FAQ',
  },
  es: {
    // Header
    title: 'DegenScore',
    subtitle: 'Rastrea tu maestría en trading',
    viewLeaderboard: '🏆 Ver Clasificación',

    // Payment
    connectWallet: 'Conecta tu billetera para mintear esta tarjeta',
    mintCard: '🎴 Mintear Tarjeta por',
    price: 'Precio',
    processingPayment: 'Procesando Pago...',

    // Tiers
    plankton: 'Plancton',
    fish: 'Pez',
    dolphin: 'Delfín',
    shark: 'Tiburón',
    whale: 'Ballena',

    // Stats
    totalUsers: 'Usuarios Totales',
    premiumUsers: 'Usuarios Premium',
    totalVolume: 'Volumen Total',

    // Buttons
    generateCard: 'Generar Tarjeta',
    shareCard: 'Compartir Tarjeta',
    downloadCard: 'Descargar Tarjeta',
    compareCards: 'Comparar Tarjetas',
    documentation: 'Documentación',

    // Messages
    walletConnected: 'Billetera conectada exitosamente',
    cardGenerated: 'Tarjeta generada exitosamente',
    error: 'Ocurrió un error',

    // Compare
    compareTitle: 'Comparar Tarjetas',
    compareDescription: 'Compara dos tarjetas DegenScore lado a lado',
    enterWallet1: 'Ingresa la primera dirección de billetera',
    enterWallet2: 'Ingresa la segunda dirección de billetera',
    compare: 'Comparar',

    // Documentation
    docsTitle: 'Documentación',
    docsDescription: 'Aprende cómo usar DegenScore',
    gettingStarted: 'Comenzando',
    features: 'Características',
    faq: 'Preguntas Frecuentes',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
