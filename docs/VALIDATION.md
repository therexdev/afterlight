# Validation record

Local validation completed on 2026-09-30. This repository remains a prelaunch build.

| Check | Result |
| --- | --- |
| Full contract, collection and website build | Passed |
| Compiled AssemblyScript contract tests in Koinos MockVM | 54 / 54 passed |
| Node tests: reader, ABI, amounts, launch preparation, transaction intent | 28 / 28 passed |
| Unique final artworks | 100 images / 100 distinct hashes |
| Largest final image | 196,036 bytes, below the 200,000-byte limit |
| Total final image data | 13,763,010 bytes |
| Metadata and image fingerprint validation | Passed for all 100 |
| Self-contained recovery reader | 7,839 bytes before binding launch addresses |
| Offline upload plan | 890 chunks, including the archived reader |
| Production wallets / mainnet broadcasts / open sales | None |

The contract suite covers initialization, authorization, immutable archive rules, SHA-256 checks, ordered chunks, the 100-token cap, launch completeness, approvals and transfers, exact sale prices, seller payment, stale quote rejection, listing cancellation and expiry, pausing, reentrancy, and failed-payment rollback of ownership and listings.

The offline wallet-preparation test uses disposable local keys in a temporary directory. It verifies separate account roles, restricted key-file permissions, absence of keys in command output, metadata/reader address binding, and refusal to overwrite existing keys. It removes the fixture afterward and does not contact a blockchain.

Browser review covered the full 100-work catalog, search, artwork detail, prelaunch sales state, owner marketplace empty state, wallet empty state, and recovery-reader configuration. The artwork was visually reviewed through four contact sheets. Preview images are in `docs/previews/`.

No funded public testnet rehearsal of these new contracts has been performed. Real Kondor signing, live KOIN payments, upload resource requirements, and mainnet deployment remain unverified on a public chain. Complete the funded testnet steps in `LAUNCH.md` before opening mainnet sales. The preserved earlier testnet experiment is a different contract and is not evidence that this new release was deployed.

These checks are local engineering validation, not an independent security audit.

The funded-wallet setup was also checked against the Foundation testnet RPC on 2026-09-30 UTC. Native token resolution through its name-service contract, token balance, and account Mana reads succeeded. The legacy-node path verifies deployed code hashes and authority flags using the archive’s read-only `get_contract_info` method, because that node does not expose `chain.invoke_system_call`. No signing key from the funded wallet was accessed and no deployment was broadcast.
