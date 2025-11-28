import Head from 'next/head';

interface MetaHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://degenscore.com';

export default function MetaHead({
    title = "DegenScore - Analyze Your Solana Trading History",
    description = "Discover your Degen Score based on your on-chain activity. Are you a Legend or a Degen? Find out now!",
    image = `${SITE_URL}/og-image.png`,
    url = SITE_URL
}: MetaHeadProps) {
    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="utf-8" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
}
