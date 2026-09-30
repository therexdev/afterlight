# AFTERLIGHT architecture

The collection consists of 100 distinct AI-generated sculptural artworks. Each has an image under 200,000 bytes, a title, a story about the old world and its decentralized successor, and metadata. The six approved originals are preserved byte-for-byte in their existing optimized WebP format.

## Permanent archive

`Archive.ts` stores 100 image records and a self-contained HTML recovery reader as record 101. Images are uploaded in 16 KiB chunks. The declaration commits the exact name, MIME type, length, SHA-256, and metadata. Finalization reconstructs the complete file and checks its digest. Finalized records cannot be modified. Sealing requires all 101 records and ends all uploads.

The archive deployment sets `authorizes_upload_contract=true`, with its `authorize` implementation returning false. Its upload authority cannot subsequently replace the contract. The other authority override flags remain false so the archive account can sign initial content uploads normally. The deployment verifier checks the flags in the confirmed deployment operation.

## Collection and marketplace

`Afterlight.ts` is deployed to another account with all authority overrides false. Its contract account can upgrade it by signing a normal contract upload. This is intentionally administrator-controlled, not immutable ownership logic. Keep its key offline after launch. Future upgrades must preserve the protobuf field numbers and storage space IDs documented in the source.

The current implementation has a hard cap of 100 tokens, sequential minting, ownership balances, single-token approval, operator approval, transfer events, metadata access, and paginated reads. Ownership/approval entry points and wire fields follow the KCS-2 collection interface. `token_uri` returns a data URI containing the on-chain metadata. The metadata's image field is a `koinos://` archive reference; third-party viewers need an adapter to reconstruct its bytes. Do not promise universal marketplace display support.

Opening sales requires all 100 tokens and the sealed archive. Primary inventory belongs to the collection contract, cannot be extracted by its ordinary transfer/approval methods, and is listed at exactly 50,000,000,000 base units (500 KOIN). Primary proceeds go directly to the treasury configured at initialization.

Owners list without depositing their NFT into escrow. A resale stores owner, price, expiry and revision. Repricing, cancellation, or transfer invalidates old quotes. Purchases specify the expected seller, exact price, revision and a short deadline. The owner changes and KOIN transfers in the same transaction; any failure rolls back the transaction. The market holds no KOIN escrow and charges no marketplace fee or resale royalty. A reentrancy lock protects the payment call and all ownership mutations.

Pausing prevents purchases and new listings. Owners can still transfer and cancel existing listings. There is no ordinary administrative seizure, burn, or metadata editing function. A future authorized code upgrade can change ownership rules; the independent immutable archive is unaffected.

## Website

`dist/` is a complete static website. It includes the immersive landing page, collection sales page, resale marketplace, wallet collection management, network details, and two recovery readers. There is no indexer, database, IPFS dependency, hosted signing service, or embedded private key. Four bounded contract reads enumerate the 100 ownership records and their listings.

Kondor handles wallet selection and signing. The site compares the signed transaction's ID, entire header and operations against the prepared intent before broadcast. Unknown submission outcomes are recorded by transaction ID in browser storage and block duplicate submissions until reconciled. This record contains no key or signature. Buying requires available KOIN for payment and available Mana for the transaction.

Public image files are efficient website mirrors. The optional verification action reconstructs the immutable archive bytes and compares the digest with the manifest. `recovery.html` includes the reader code and minimal styling, with no external script, font, image or application dependency; it still needs a reachable Koinos node.

## Source references

- Koinos AssemblyScript SDK 1.5.1 (`@koinos/sdk-as`), including the native token wrapper and authority helpers.
- Koilib 9.4.0 for protobuf serialization, transactions and Kondor integration.
- Kollection reference collection: https://github.com/kollection-nft/collection-base
- Koinos system contracts: https://github.com/koinos/koinos-contracts-as

The tests exercise the compiled AssemblyScript contract logic in Koinos MockVM. They do not substitute for a funded testnet rehearsal or an independent security review of the final launch build.
