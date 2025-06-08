// Script to check if all required environment variables are set
const requiredEnvVars = [
  // Essential RPC URLs
  { name: 'BASE_RPC_URL', required: false, default: 'https://mainnet.base.org' },
  { name: 'OPTIMISM_RPC_URL', required: false, default: 'https://mainnet.optimism.io' },
  { name: 'ETHEREUM_RPC_URL', required: false, default: 'https://ethereum.publicnode.com' },
  
  // API Keys (optional but recommended)
  { name: 'DEXSCREENER_API_KEY', required: false },
  { name: 'ETHERSCAN_API_KEY', required: false },
  { name: 'BASESCAN_API_KEY', required: false },
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

requiredEnvVars.forEach(({ name, required, default: defaultValue }) => {
  const value = process.env[name];
  
  if (!value && required) {
    console.error(`❌ ${name} - Missing (REQUIRED)`);
    hasErrors = true;
  } else if (!value && !required) {
    console.warn(`⚠️  ${name} - Missing (optional, using default: ${defaultValue || 'none'})`);
  } else {
    console.log(`✅ ${name} - Set`);
  }
});

if (hasErrors) {
  console.error('\n❌ Some required environment variables are missing!');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are properly configured!');
}
