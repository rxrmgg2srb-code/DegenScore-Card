import { SpyModeContent } from '@/components/SpyModeContent';

export default function SpyModePage() {
  return <SpyModeContent />;
}

// Force SSR instead of static generation
export async function getServerSideProps() {
  return {
    props: {},
  };
}
