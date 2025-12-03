// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Now run the TypeScript script
require('child_process').execSync('npx tsx scripts/debug-pnl-30d-v2.ts', {
    stdio: 'inherit',
    env: { ...process.env }
});
