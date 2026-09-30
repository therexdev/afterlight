"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccounts = void 0;
const Messenger_1 = require("./Messenger");
const constants_1 = require("./constants");
const messenger = new Messenger_1.Messenger();
async function getAccounts() {
    return messenger.sendDomMessage("popup", "getAccounts", { kondorVersion: constants_1.kondorVersion });
}
exports.getAccounts = getAccounts;
exports.default = getAccounts;
//# sourceMappingURL=account.js.map