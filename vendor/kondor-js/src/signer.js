"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSigner = exports.KondorSigner = void 0;
const Messenger_1 = require("./Messenger");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const messenger = new Messenger_1.Messenger({});
class KondorSigner {
    constructor(c) {
        this.provider = c.provider;
        this.address = c.address;
        this.sendOptions = {
            broadcast: true,
            ...c.sendOptions,
        };
    }
    getAddress() {
        return this.address;
    }
    signHash(hash) {
        return messenger.sendDomMessage("popup", "signer:signHash", {
            signerAddress: this.address,
            hash,
            kondorVersion: constants_1.kondorVersion,
        });
    }
    async signMessage(message) {
        const signatureBase64url = await messenger.sendDomMessage("popup", "signer:signMessage", {
            signerAddress: this.address,
            message,
            kondorVersion: constants_1.kondorVersion,
        });
        return (0, utils_1.decodeBase64url)(signatureBase64url);
    }
    async signTransaction(transaction, abis) {
        const tx = await messenger.sendDomMessage("popup", "signer:signTransaction", {
            signerAddress: this.address,
            transaction,
            abis,
            kondorVersion: constants_1.kondorVersion,
        });
        transaction.id = tx.id;
        transaction.header = tx.header;
        transaction.operations = tx.operations;
        transaction.signatures = tx.signatures;
        return transaction;
    }
    async sendTransaction(transaction, options) {
        const opts = {
            ...this.sendOptions,
            ...options,
        };
        if (opts === null || opts === void 0 ? void 0 : opts.beforeSend) {
            throw new Error("beforeSend option is not supported in kondor");
        }
        const response = await messenger.sendDomMessage("popup", "signer:sendTransaction", {
            signerAddress: this.address,
            transaction,
            optsSend: opts,
            kondorVersion: constants_1.kondorVersion,
        });
        transaction.id = response.transaction.id;
        transaction.header = response.transaction.header;
        transaction.operations = response.transaction.operations;
        transaction.signatures = response.transaction.signatures;
        if (opts.broadcast) {
            transaction.wait = async (type = "byTransactionId", timeout = 15000) => {
                if (opts.provider)
                    return opts.provider.wait(transaction.id, type, timeout);
                if (this.provider)
                    return this.provider.wait(transaction.id, type, timeout);
                throw new Error("provider is undefined");
            };
        }
        return {
            transaction: transaction,
            receipt: response.receipt,
        };
    }
    async prepareBlock() {
        throw new Error("prepareBlock is not available");
    }
    async signBlock() {
        throw new Error("signBlock is not available");
    }
}
exports.KondorSigner = KondorSigner;
function getSigner(signerAddress, options) {
    if (!signerAddress)
        throw new Error("no signerAddress defined");
    return new KondorSigner({
        provider: options === null || options === void 0 ? void 0 : options.provider,
        address: signerAddress,
        sendOptions: options === null || options === void 0 ? void 0 : options.sendOptions,
    });
}
exports.getSigner = getSigner;
//# sourceMappingURL=signer.js.map