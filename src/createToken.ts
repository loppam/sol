import { 
  clusterApiUrl, 
  Connection, 
  Keypair, 
  LAMPORTS_PER_SOL,
  PublicKey
} from '@solana/web3.js';
import { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import dotenv from 'dotenv';

dotenv.config();

async function createToken() {
  try {
    // Connect to Solana mainnet
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    // Generate a new wallet keypair
    const payer = Keypair.generate();

    console.log('⚠️ IMPORTANT: Send SOL to this address to create the token:');
    console.log(payer.publicKey.toString());
    console.log('You need approximately 0.5 SOL to cover the creation fees on mainnet');
    
    // Wait for balance check
    let balance = await connection.getBalance(payer.publicKey);
    while (balance < 0.5 * LAMPORTS_PER_SOL) {
      console.log('Waiting for SOL deposit...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      balance = await connection.getBalance(payer.publicKey);
    }

    // Create new token mint
    console.log('Creating $TMCGA token mint...');
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      9 // 9 decimals like most tokens
    );

    console.log('Token mint created:', mint.toString());

    // Create associated token account
    console.log('Creating token account...');
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    // Mint initial supply
    console.log('Minting initial supply...');
    const initialSupply = 1000000; // 1 million tokens
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer,
      initialSupply * Math.pow(10, 9) // Account for 9 decimals
    );

    console.log('✅ $TMCGA token created successfully on mainnet!');
    console.log('Mint address:', mint.toString());
    console.log('Token account:', tokenAccount.address.toString());
    console.log('Owner wallet:', payer.publicKey.toString());
    console.log('\nSave these addresses for future reference!');
  } catch (error) {
    console.error('Error creating token:', error);
    process.exit(1);
  }
}

createToken();