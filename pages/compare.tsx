import dynamic from 'next/dynamic';
import Head from 'next/head';

const CompareContent = dynamic(() => import('../components/CompareContent').then(mod => mod.default), { ssr: false, loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div></div> });
export default function Compare() {
  return (
    <>
      <Head><title>⚖️ Compare - DegenScore Card</title></Head>
      <CompareContent />
    </>
  );
}
