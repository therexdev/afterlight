# Validation record

Local validation completed on 2026-09-30. This repository remains a prelaunch build.

| Check | Result |
| --- | --- |
| Full contract, collection and website build | Passed |
| Compiled AssemblyScript contract tests in Koinos MockVM | 54 / 54 passed |
| Node tests: reader, ABI, amounts, launch preparation, transaction intent, deployment CLI and shipped WASM | 31 / 31 passed |
| Unique final artworks | 100 images / 100 distinct hashes |
| Largest final image | 196,036 bytes, below the 200,000-byte limit |
| Total final image data | 13,763,010 bytes |
| Metadata and image fingerprint validation | Passed for all 100 |
| Self-contained recovery reader | 7,839 bytes before binding launch addresses |
| Offline upload plan | 890 chunks, including the archived reader |
| Production wallets / mainnet broadcasts / open sales | None |

The contract suite covers initialization, authorization, immutable archive rules, SHA-256 checks, ordered chunks, the 100-token cap, launch completeness, approvals and transfers, exact sale prices, seller payment, stale quote rejection, listing cancellation and expiry, pausing, reentrancy, and failed-payment rollback of ownership and listings.

The offline wallet-preparation test uses disposable local keys in a temporary directory. It verifies separate account roles, restricted key-file permissions, absence of keys in command output, metadata/reader address binding, and refusal to overwrite existing keys. It removes the fixture afterward and does not contact a blockchain.

The deployment CLI regression test reproduces the reported `signer not found` failure with the original launcher. With the fix, it executes the actual launcher and Koilib deployment/serialization/signing code through both deployments and collection initialization against an offline RPC fixture. It checks both recovered transaction signers, bytecode, archive authority flags, simulation and adjusted Mana limits, confirmed receipt journaling, resume without redeployment or key changes, and verification without a wallet file. The fixture intentionally stops before artwork upload. It also exercises the legacy node's successful empty protobuf response for an unused contract address; transport errors still abort. This is not a funded testnet rehearsal.

Initialization in that CLI fixture now executes the actual shipped collection WASM, reproducing the second reported failure (`invalid base URI`) before the script fix. Empty strings are omitted by ABI serialization and decode as null in the deployed contract. The uploader now supplies an on-chain archive URI by default and checks the 512-byte limit before any deployments.

A separate integration test executes the unchanged release WASM through its exported entry points with Koilib-encoded arguments. It initializes the collection, stores all 100 actual artwork files and the reader, verifies each reconstructed SHA-256, mints all 100 NFTs, checks their metadata data URIs, seals the archive, and opens the 500-KOIN listings. Cross-contract calls execute the other release WASM. The harness uses MockVM system calls with in-memory storage and explicit test authority; it does not model node resource costs, consensus, or real payment transfers.

Browser review covered the full 100-work catalog, search, artwork detail, prelaunch sales state, owner marketplace empty state, wallet empty state, and recovery-reader configuration. The artwork was visually reviewed through four contact sheets. Preview images are in `docs/previews/`.

A funded public testnet rehearsal has begun: the archive and collection deployments are confirmed, and read-only RPC checks matched both deployed code hashes to the release WASM. Initialization stopped before artwork upload because of the empty URI default, now corrected in the launcher without changing either deployed contract. Completion of the upload, real Kondor signing, live KOIN payments, total resource requirements, and mainnet deployment remain unverified on a public chain. Complete the funded testnet steps in `LAUNCH.md` before opening mainnet sales.

These checks are local engineering validation, not an independent security audit.

The funded-wallet setup was also checked against the Foundation testnet RPC on 2026-09-30 UTC. Native token resolution through its name-service contract, token balance, and account Mana reads succeeded. The legacy-node path verifies deployed code hashes and authority flags using the archive’s read-only `get_contract_info` method, because that node does not expose `chain.invoke_system_call`. The user signed the two deployments locally; assistant-side RPC checks were read-only and did not access the funded wallet key.
