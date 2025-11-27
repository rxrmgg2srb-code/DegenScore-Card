import { SpyModeContent } from '@/components/SpyModeContent';

// Force dynamic rendering - uses Solana wallet hooks
export const dynamic = 'force-dynamic';

export default function SpyModePage() {
  return <SpyModeContent />;
}
