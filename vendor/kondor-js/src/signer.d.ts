import type { SignerInterface, Provider, ProviderInterface, BlockJson, SendTransactionOptions, TransactionJson, TransactionJsonWait, TransactionReceipt } from "koilib";
export declare class KondorSigner implements SignerInterface {
    address: string;
    provider?: ProviderInterface;
    sendOptions?: SendTransactionOptions;
    constructor(c: {
        provider?: ProviderInterface;
        address: string;
        sendOptions?: SendTransactionOptions;
    });
    getAddress(): string;
    signHash(hash: Uint8Array): Promise<Uint8Array>;
    signMessage(message: string | Uint8Array): Promise<Uint8Array>;
    signTransaction(transaction: TransactionJson, abis?: SendTransactionOptions["abis"]): Promise<TransactionJson>;
    sendTransaction(transaction: TransactionJson, options?: SendTransactionOptions): Promise<{
        transaction: TransactionJsonWait;
        receipt: TransactionReceipt;
    }>;
    prepareBlock(): Promise<BlockJson>;
    signBlock(): Promise<BlockJson>;
}
export declare function getSigner(signerAddress: string, options?: {
    provider?: Provider;
    sendOptions?: SendTransactionOptions;
}): SignerInterface;
