import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { TOKEN_CONFIG } from "./config.js";

export async function waitForBalance(
  connection: Connection,
  address: PublicKey
): Promise<void> {
  let balance = await connection.getBalance(address);
  while (balance < 1 * LAMPORTS_PER_SOL) {
    console.log(
      "Waiting for SOL deposit... Current balance:",
      balance / LAMPORTS_PER_SOL,
      "SOL"
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    balance = await connection.getBalance(address);
  }
}

export async function createTokenMint(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    TOKEN_CONFIG.decimals
  );

  console.log("Token mint created:", mint.toString());
  return mint;
}

export async function setupMetadata(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey
): Promise<void> {
  const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

  const { nft } = await metaplex.nfts().create({
    uri: TOKEN_CONFIG.uri,
    name: TOKEN_CONFIG.name,
    symbol: TOKEN_CONFIG.symbol,
    sellerFeeBasisPoints: 0, // Fee in basis points (0.00% here)
    mintAuthority: payer,
    updateAuthority: payer,
    isMutable: true,
  });

  console.log("Token metadata created:", nft);
}

export async function mintInitialSupply(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey
): Promise<void> {
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log("Minting initial supply...");
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    TOKEN_CONFIG.initialSupply * Math.pow(10, TOKEN_CONFIG.decimals)
  );

  console.log(`Minted ${TOKEN_CONFIG.initialSupply.toLocaleString()} tokens`);
}
