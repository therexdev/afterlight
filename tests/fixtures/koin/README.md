KOIN payment integration fixture
================================

Unmodified upstream KOIN implementation and storage schemas from:
https://github.com/koinos/koinos-contracts-as/tree/4fc33bbe0520a77a89619da1e9e6efe98e7c423c/contracts/koin/assembly

Upstream Koin.ts is MIT licensed (copyright header retained).
The local entry.ts exposes the payment methods for tests only. BUILD_FOR_TESTING=1
uses the official tKOIN storage zone. Tests execute this code together with the
shipped AFTERLIGHT WASM; the VM models callers, normal-account authorization and
transaction-wide rollback. Signatures, Mana accounting, consensus and Kondor UI
are not simulated. No fixture is deployed or packaged in the website.
