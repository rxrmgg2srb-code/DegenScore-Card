import Script from 'next/script';

/**
 * Umami Analytics Component
 * 100% FREE, privacy-focused analytics
 * Self-hosted en Vercel
 */
export function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;

  // Solo cargar si está configurado
  if (!websiteId || !umamiUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Umami not configured. Add NEXT_PUBLIC_UMAMI_WEBSITE_ID and NEXT_PUBLIC_UMAMI_URL to .env.local');
    }
    return null;
  }

  return (
    <Script
      async
      src={`${umamiUrl}/script.js`}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}

/**
 * Hook para trackear eventos personalizados
 *
 * @example
 * import { useUmami } from '@/components/UmamiAnalytics';
 *
 * function MyComponent() {
 *   const { track } = useUmami();
 *
 *   const handleClick = () => {
 *     track('button_clicked', { button: 'generate_card' });
 *   };
 * }
 */
export function useUmami() {
  const track = (eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track(eventName, data);
    }
  };

  return { track };
}

// TypeScript declaration
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, any>) => void;
    };
  }
}
