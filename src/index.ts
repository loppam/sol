import { 
  clusterApiUrl, 
  Connection, 
  Keypair,
} from '@solana/web3.js';
import { waitForBalance, createTokenMint, setupMetadata, mintInitialSupply } from './tokenUtils.js';
import { TOKEN_CONFIG } from './config.js';

async function createTradeableToken() {
  try {
    // Connect to Solana mainnet
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    // Generate a new wallet keypair
    const payer = Keypair.generate();

    console.log('\n🚀 Creating Tradeable $LOPAM Token');
    console.log('=====================================');
    console.log('⚠️ IMPORTANT: Send at least 1 SOL to this address:');
    console.log(payer.publicKey.toString());
    console.log('This will cover creation fees and initial liquidity on mainnet');
    
    // Wait for SOL deposit
    await waitForBalance(connection, payer.publicKey);

    // Create the token mint
    const mint = await createTokenMint(connection, payer);

    // Setup token metadata
    await setupMetadata(connection, payer, mint);

    // Mint initial supply
    await mintInitialSupply(connection, payer, mint);

    console.log('\n✅ $TMCGA token created successfully on mainnet!');
    console.log('=============================================');
    console.log('Token Details:');
    console.log('- Name:', TOKEN_CONFIG.name);
    console.log('- Total Supply:', TOKEN_CONFIG.initialSupply.toLocaleString());
    console.log('- Decimals:', TOKEN_CONFIG.decimals);
    console.log('\nImportant Addresses:');
    console.log('- Mint Address:', mint.toString());
    console.log('- Owner Wallet:', payer.publicKey.toString());
    console.log('\n🔥 Next Steps:');
    console.log('1. Add liquidity to a DEX (Raydium, Orca, etc.)');
    console.log('2. Create social media presence and community');
    console.log('3. List on token trackers (Solscan, etc.)');
    
  } catch (error) {
    console.error('Error creating token:', error);
    process.exit(1);
  }
}

createTradeableToken();