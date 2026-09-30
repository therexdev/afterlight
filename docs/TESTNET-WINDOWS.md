# Deploy AFTERLIGHT from Windows

This guide uses your existing funded testnet wallet. It never opens mainnet sales. The final website is static HTML/CSS/JavaScript. Node.js 22 or newer is needed only on your computer for deployment; no WSL or contract compilation is needed for this release.

## 1. Open the deployment kit

Extract `Afterlight-Testnet-Deploy.zip` into a new folder on your computer. Open that folder, click File Explorer's address bar, type `powershell`, and press Enter. The terminal must open in the folder containing `package.json`.

Run:

```powershell
node --version
npm.cmd ci
```

The Node version must be 22 or newer. If installation reports an error, stop and keep the error text. Do not run the next step until installation succeeds.

## 2. Import the funded wallet locally

```powershell
node scripts/prepare-testnet.mjs --funding-address 1F8s7vYxRPpMKTmb8Meamsx2FV6uzrafag
```

The script checks the live testnet balance, then asks for the wallet's **WIF private key** at a hidden local prompt. Paste it there and press Enter. Do not paste it into chat, a website, or a shell command. A recovery phrase is not a WIF key. If your wallet does not offer a WIF export, stop here and tell us which wallet you use; do not send its secret.

The setup verifies that the key derives the exact funded address. It creates separate archive and collection keys locally. This same funded wallet pays deployment Mana and receives initial test-sale proceeds. No transfer to another funding wallet is required.

**Back up `.secrets/launch-wallets.json` offline now.** The file contains all three private keys, including the imported funding key. It must never be uploaded to your website or GitHub. Keep the entire local deployment folder so the upload can resume.

## 3. Upload the collection

```powershell
npm.cmd run launch:upload
```

Leave the terminal open. This deploys both contracts and uploads all 100 images and metadata plus the independent reader. It mints the collection and seals the archive, with sales still closed. It sends many small transactions and reads the files back to verify them.

If it stops for insufficient available Mana, keep these same files and keys. Wait for regeneration or add tKOIN to the same funded wallet, then run the same upload command again. The script checks existing progress. Do not prepare new wallets or edit artwork to restart. Ten thousand tKOIN is a starting balance, not a guarantee of enough Mana for the entire upload.

An uncertain submission is saved for confirmation before another transaction is created. Do not delete `.secrets/pending-launch.json` to force a retry. Share the public error text if confirmation cannot be resolved.

## 4. Verify and open test sales

After the uploader prints `Upload complete. Sales remain CLOSED.`, run:

```powershell
npm.cmd run launch:verify
```

Wait until verification reports `allUploadsIrreversible: true`. If it is false, wait and run verification again. Then:

```powershell
npm.cmd run launch:open -- --open-sales
```

This opens **testnet** purchases at 500 **tKOIN**, and enables the website's wallet actions. No `--confirm-mainnet` flag is used anywhere in this guide.

## 5. Create the configured website ZIP

After sales open successfully:

```powershell
Compress-Archive -Path .\dist\* -DestinationPath .\Afterlight-Testnet-Website.zip -Force
```

Upload that ZIP to your website's public folder and extract it there. `index.html`, `collect.html`, `marketplace.html`, `wallet.html`, and `network-config.json` must be directly in the public folder, not nested inside a `dist` folder. On Hostinger static hosting, this folder is usually `public_html`. The website needs HTTPS for normal wallet use. No Node server is required on the web host.

The separate website ZIP supplied in chat can be uploaded immediately as a **prelaunch preview**. It has no deployed contract IDs and cannot make purchases yet. Replace it with the locally generated ZIP after this deployment succeeds. Do not manually flip `enabled` to true before the opening command succeeds.

Upload only the website ZIP or `dist` contents. The deployment kit, `.secrets`, and the repository root stay on your computer.

## 6. Test the complete flow

Use Kondor configured for this Koinos Foundation Testnet and endpoint `https://testnet.koinosfoundation.org/jsonrpc`, with chain ID `EiAIKVvm6-V2qmsmUvPJy09vCCLbtn9lHFpwrJbcTIEWRQ==`.

Use separate test wallets for realistic purchases: buy a work for 500 tKOIN, list it at a different price, buy it from another wallet, cancel a listing, transfer an NFT, and recover the image through the independent reader. Buyer wallets need enough tKOIN plus available Mana. Preserve deployment funding while uploads are running. Your funding/treasury wallet should not be the only buyer in the rehearsal.

Share the public site URL and terminal completion output after upload. Never share the wallet backup. Mainnet remains a later deployment with separate accounts and real KOIN.
