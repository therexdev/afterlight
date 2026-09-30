"use strict";
/* eslint-disable no-undef */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messenger = void 0;
function getError(e) {
    if (typeof e !== "object")
        return e;
    if (e.message)
        return e.message;
    // console.debug("unknown kondor error");
    // console.debug(e);
    return "unknown kondor error";
}
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
class Messenger {
    constructor(opts) {
        this.listeners = [];
        this.onExtensionRequest = () => Promise.resolve();
        this.onDomRequest = () => Promise.resolve();
        if (!opts)
            return;
        if (opts.onExtensionRequest) {
            this.onExtensionRequest = opts.onExtensionRequest;
            const listener = async (data, sender, res) => {
                res();
                const { id, command } = data;
                // check if it is a MessageRequest
                if (!command)
                    return;
                const message = { id };
                // console.debug("incoming request", id, ":", command);
                // console.debug((data as MessageRequest).args);
                try {
                    const result = await this.onExtensionRequest(data, id, sender);
                    // check if other process will send the response
                    if (typeof result === "object" &&
                        result !== null &&
                        result._derived) {
                        // console.debug("response", id, "derived");
                        return;
                    }
                    message.result = result;
                }
                catch (error) {
                    message.error = error.message;
                }
                if (typeof message.result === "undefined" && !message.error)
                    return;
                this.sendResponse("extension", message, sender);
            };
            this.listeners.push({ type: "extension", id: "onRequest", listener });
            chrome.runtime.onMessage.addListener(listener);
        }
        if (opts.onDomRequest) {
            this.onDomRequest = opts.onDomRequest;
            const listener = async (event) => {
                const { id, command } = event.data;
                // check if it is a MessageRequest
                if (!command)
                    return;
                const message = { id };
                // console.debug("incoming request", id, ":", command);
                // console.debug((event.data as MessageRequest).args);
                try {
                    const result = await this.onDomRequest(event, id);
                    // check if other process will send the response
                    if (typeof result === "object" &&
                        result !== null &&
                        result._derived) {
                        // console.debug("response", id, "derived");
                        return;
                    }
                    message.result = result;
                }
                catch (error) {
                    message.error = error.message;
                }
                if (typeof message.result === "undefined" && !message.error)
                    return;
                this.sendResponse("dom", message);
            };
            this.listeners.push({ type: "dom", id: "onRequest", listener });
            window.addEventListener("message", listener);
        }
    }
    sendResponse(type, message, sender) {
        // console.debug("outgoing response", message.id, ":");
        // console.debug(message);
        if (type === "dom")
            window.postMessage(message, "*");
        else {
            if (sender && sender.tab)
                chrome.tabs.sendMessage(sender.tab.id, message);
            else
                chrome.runtime.sendMessage(message);
        }
    }
    async sendDomMessage(to, command, args) {
        const reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (event) => {
                // ignore requests
                if (event.data.command)
                    return;
                const { id, result, error } = event.data;
                // ignore different ids
                if (id !== reqId)
                    return;
                // send response
                if (error) {
                    // console.debug("error received", id, ":");
                    // console.debug(getError(error));
                    reject(new Error(getError(error)));
                }
                else {
                    // console.debug("response received", id, ":");
                    // console.debug(result);
                    resolve(result);
                }
                this.removeListener(reqId);
            };
            // listen
            this.listeners.push({ type: "dom", id: reqId, listener });
            window.addEventListener("message", listener);
            // send request
            window.postMessage({
                id: reqId,
                command,
                args: args ? JSON.parse(JSON.stringify(args)) : args,
                to,
            }, "*");
            // console.debug("sending message", reqId, command, "to dom");
            // console.debug(args);
        });
    }
    async sendExtensionMessage(to, command, args, opts) {
        const reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (data, _sender, res) => {
                res();
                // ignore requests
                if (data.command)
                    return;
                const { id, result, error } = data;
                // ignore different ids
                if (id !== reqId)
                    return;
                // send response
                if (error) {
                    // console.debug("error received", id, ":");
                    // console.debug(getError(error));
                    reject(new Error(getError(error)));
                }
                else {
                    // console.debug("response received", id, ":");
                    // console.debug(result);
                    resolve(result);
                }
                this.removeListener(reqId);
            };
            // listen
            this.listeners.push({ type: "extension", id: reqId, listener });
            chrome.runtime.onMessage.addListener(listener);
            // send request
            const sendMessage = () => {
                if (["popup", "background"].includes(to)) {
                    chrome.runtime.sendMessage({
                        id: reqId,
                        command,
                        args: args ? JSON.parse(JSON.stringify(args)) : args,
                        to,
                    });
                }
                else {
                    // 'to' is tab.id
                    chrome.tabs.sendMessage(to, {
                        id: reqId,
                        command,
                        args: args ? JSON.parse(JSON.stringify(args)) : args,
                        to,
                    });
                }
                // console.debug("sending message", reqId, command, "to", to);
                // console.debug(args);
            };
            sendMessage();
            // define timeout
            if (opts && opts.timeout) {
                setTimeout(() => {
                    reject(new Error("Connection lost"));
                    this.removeListener(reqId);
                }, opts.timeout);
            }
            // ping
            if (opts && opts.ping) {
                (async () => {
                    let retries = (opts === null || opts === void 0 ? void 0 : opts.retries) || 0;
                    await sleep(1000);
                    while (this.listeners.find((l) => l.id === reqId)) {
                        try {
                            await this.sendExtensionMessage(to, "ping", { id: reqId, to }, { timeout: (opts === null || opts === void 0 ? void 0 : opts.pingTimeout) || 80 });
                            await sleep(1000);
                        }
                        catch (error) {
                            if (retries <= 0) {
                                reject(error);
                                this.removeListener(reqId);
                                break;
                            }
                            retries -= 1;
                            console.log(`retrying ${reqId}. remaining retries: ${retries}`);
                            sendMessage();
                            await sleep(100);
                        }
                    }
                })()
                    .then(() => { })
                    .catch((e) => {
                    console.log("ping error:");
                    console.log(e);
                });
            }
        });
    }
    removeListener(id) {
        const index = this.listeners.findIndex((l) => l.id === id);
        if (index < 0)
            return;
        const removed = this.listeners.splice(index, 1);
        const { listener, type } = removed[0];
        if (type === "dom") {
            window.removeEventListener("message", listener);
        }
        else {
            chrome.runtime.onMessage.removeListener(listener);
        }
    }
    removeListeners() {
        this.listeners.forEach((l) => {
            const { type, listener } = l;
            if (type === "dom") {
                window.removeEventListener("message", listener);
            }
            else {
                chrome.runtime.onMessage.removeListener(listener);
            }
        });
        this.listeners = [];
    }
}
exports.default = Messenger;
exports.Messenger = Messenger;
//# sourceMappingURL=Messenger.js.map