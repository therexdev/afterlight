# Funding and launch

Nothing in this repository has been deployed to mainnet. The checked-in website is a prelaunch preview. Build and test before creating launch accounts.

Use Linux, macOS, or WSL on Windows, with Node.js 22 or later. The contract compiler uses a small POSIX `protoc` wrapper. The final website itself is plain HTML/CSS/JavaScript and can be hosted on any static web host.

For a ready-to-deploy Windows testnet package, use [TESTNET-WINDOWS.md](TESTNET-WINDOWS.md). It uses the included compiled contracts and does not require WSL.

## Build the exact release

```sh
npm ci
npm run build
npm run test:contract
npm test
npm run verify:assets
npm run launch:plan
```

All 100 final WebP files are included. Image generation is not part of the build and needs no API key. The prose and generation briefs are in `collection/art-prompts.json` and `collection/mainnet-preview.json`.

## Prepare the wallet locally

For a rehearsal, use `--network testnet`. For the eventual launch:

```sh
npm run prepare:wallet -- --network mainnet
```

This creates three local keypairs: a funding account, an archive account, and a collection account. Only the funding account needs to be funded; it pays Mana while the appropriate contract key co-signs deployment and administration operations. The command prints the public addresses and saves the keys to `.secrets/launch-wallets.json` with restricted file permissions. Back that file up offline before sending funds. It is gitignored and never belongs in `dist/`, GitHub, chat, or your web host.

The default sales treasury is the funding address. To send proceeds to another wallet you control, add `--treasury YOUR_KOINOS_ADDRESS` to the prepare command. You can instead supply an existing funding wallet through the local `AFTERLIGHT_FUNDING_WIF` environment variable. Do not put a private key in a shell command that will be shared or in a committed environment file.

Preparing is offline; it does not deploy or spend KOIN. It refuses to overwrite existing launch keys. Mainnet and testnet use separate working copies and key backups. Do not repurpose mainnet launch accounts for a rehearsal.

## Fund the printed payer

Send KOIN to the exact `fundThisWallet` address printed by prepare. Testnet uses testnet KOIN. Mainnet requires actual KOIN. The price of an NFT is separate from the Mana needed to store the collection. The full initial asking value is 50,000 KOIN, but that is not a deployment funding requirement.

Mana consumption depends on current resource prices. The uploader simulates each transaction and adds a bounded buffer. It stops before a transaction if the payer lacks enough available Mana. Fund it further or wait for regeneration, then resume the same command with the same files and accounts. Do not generate a replacement wallet or change artwork after uploading has begun.

## Upload and verify, with sales closed

```sh
npm run launch:upload -- --confirm-mainnet
npm run launch:verify
```

On testnet, omit `--confirm-mainnet`. The default collection URI points to `koinos://CHAIN-ID/ARCHIVE-ID/artifacts`; no website URL is needed. You may override it with `--base-uri https://YOUR-SITE/metadata` during initialization for legacy metadata mirror integrations (512 UTF-8 bytes maximum). Individual token metadata and the recovery reader work independently of this override. `AFTERLIGHT_RPC` can select another node, but its returned chain ID must match the prepared network. On managed/proxied hosts, `AFTERLIGHT_USE_CURL=1` enables the repository's bounded curl RPC transport.

The uploader deploys both contracts with their complete, corrected ABIs, resolves the native KOIN contract, initializes the treasury and archive references, uploads files in small batches, checks each file by reading all its bytes back, mints 100 tokens into the initial sale pool, and seals the archive. It does **not** open sales.

Progress is recorded in `collection/launch-state.json`. The exact signed transaction is persisted in `.secrets/pending-launch.json` before broadcast. If a submission is uncertain, the next run attempts to confirm that exact ID before constructing another transaction. Do not delete the pending file merely to retry. Resolve its receipt and nonce with the node first. A reverted or definitively expired pending submission requires manual reconciliation before removal.

`launch:verify` re-reads all 101 archived files and all 100 NFT owners. Its report records hashes, supply, sealing, publication Mana and whether the upload transactions have become irreversible.

Before mainnet, complete a funded testnet rehearsal of initial purchase, seller listing, another wallet's resale purchase, cancellation, direct transfer, wrong-network rejection and independent recovery. The automated tests in this repository cover these contract rules locally; they do not claim a public testnet transaction has happened.

## Open sales intentionally

After reviewing the funded rehearsal and verification report:

```sh
npm run launch:open -- --confirm-mainnet --open-sales
```

The command repeats file/ownership verification and waits for upload irreversibility before it will open sales. It requires two explicit mainnet flags, signs the separate opening transaction, checks the resulting state, and changes `dist/network-config.json` to enable live wallet actions. It does not upload files to your web host.

Publish the complete `dist/` directory to your chosen domain, or update its `network-config.json` if the rest of the site is already hosted. The web root must contain `index.html`, `collect.html`, `marketplace.html`, `wallet.html`, `world-art/`, `abi/`, and the other files directly. No server process is required. Never upload `.secrets/` or the repository root wholesale.

## Updates after launch

Keep the finalized image bytes, metadata, archived reader and original deployment receipts unchanged. UI changes can be deployed independently. Contract upgrades must be explicitly prepared, tested, reviewed and signed with the collection key, preserving existing storage and users' ownership. Archive replacement is deliberately impossible. Mainnet signing is always a separate operator action; GitHub Actions only builds and tests.
