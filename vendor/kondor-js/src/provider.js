"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = exports.getProvider = void 0;
const Messenger_1 = require("./Messenger");
const constants_1 = require("./constants");
const messenger = new Messenger_1.Messenger({});
function getProvider(network) {
    return {
        async call(method, params) {
            return messenger.sendDomMessage("background", "provider:call", {
                network,
                method,
                params,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getNonce(account) {
            return messenger.sendDomMessage("background", "provider:getNonce", {
                network,
                account,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getNextNonce(account) {
            return messenger.sendDomMessage("background", "provider:getNextNonce", {
                network,
                account,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getAccountRc(account) {
            return messenger.sendDomMessage("background", "provider:getAccountRc", {
                network,
                account,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getTransactionsById(transactionIds) {
            return messenger.sendDomMessage("background", "provider:getTransactionsById", {
                network,
                transactionIds,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getBlocksById(blockIds, opts) {
            return messenger.sendDomMessage("background", "provider:getBlocksById", {
                network,
                blockIds,
                opts,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getHeadInfo() {
            return messenger.sendDomMessage("background", "provider:getHeadInfo", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getChainId() {
            return messenger.sendDomMessage("background", "provider:getChainId", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getBlocks(height, numBlocks, idRef, opts) {
            return messenger.sendDomMessage("background", "provider:getBlocks", {
                network,
                height,
                numBlocks,
                idRef,
                opts,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        getBlock(height, opts) {
            return messenger.sendDomMessage("background", "provider:getBlock", {
                network,
                height,
                opts,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async wait(txId, type, timeout) {
            return messenger.sendDomMessage("background", "provider:wait", {
                network,
                txId,
                type,
                timeout,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async sendTransaction(transaction, broadcast) {
            const response = await messenger.sendDomMessage("background", "provider:sendTransaction", {
                network,
                transaction,
                broadcast,
                kondorVersion: constants_1.kondorVersion,
            });
            transaction.id = response.transaction.id;
            transaction.header = response.transaction.header;
            transaction.operations = response.transaction.operations;
            transaction.signatures = response.transaction.signatures;
            transaction.wait = async (type = "byBlock", timeout = 60000) => {
                return messenger.sendDomMessage("background", "provider:wait", {
                    network,
                    txId: transaction.id,
                    type,
                    timeout,
                    kondorVersion: constants_1.kondorVersion,
                });
            };
            return {
                transaction: transaction,
                receipt: response.receipt,
            };
        },
        async submitBlock(block) {
            return messenger.sendDomMessage("background", "provider:submitBlock", {
                network,
                block,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async readContract(operation) {
            return messenger.sendDomMessage("background", "provider:readContract", {
                network,
                operation,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getForkHeads() {
            return messenger.sendDomMessage("background", "provider:getForkHeads", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getResourceLimits() {
            return messenger.sendDomMessage("background", "provider:getResourceLimits", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async invokeSystemCall(serializer, nameOrId, args, callerData) {
            return messenger.sendDomMessage("background", "provider:invokeSystemCall", {
                network,
                serializer,
                nameOrId,
                args,
                callerData,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async invokeGetContractMetadata(contractId) {
            return messenger.sendDomMessage("background", "provider:getResourceLimits", {
                network,
                contractId,
                kondorVersion: constants_1.kondorVersion,
            });
        },
    };
}
exports.getProvider = getProvider;
exports.provider = getProvider();
exports.default = exports.provider;
//# sourceMappingURL=provider.js.map