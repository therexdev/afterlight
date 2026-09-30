export interface Sender {
    tab?: {
        id: number;
    };
}
interface MessageRequest {
    id: string;
    command: string;
    to: string | number;
    args: unknown;
}
interface MessageResponse {
    id: string;
    result?: unknown;
    error?: string;
}
declare type Message = MessageRequest | MessageResponse;
interface Event<T = Message> {
    data: T;
    source: {
        postMessage: (data: unknown, target: string) => void;
    };
    origin: string;
}
declare type OnExtensionRequest = (message: MessageRequest, id: string, sender?: Sender) => Promise<unknown | {
    _derived: boolean;
}>;
declare type OnDomRequest = (event: Event<MessageRequest>, id: string) => Promise<unknown | {
    derived: boolean;
}>;
export default class Messenger {
    onExtensionRequest: OnExtensionRequest;
    onDomRequest: OnDomRequest;
    listeners: {
        type: "extension" | "dom";
        id: string | "onRequest";
        listener: unknown;
    }[];
    constructor(opts?: {
        onDomRequest?: OnDomRequest;
        onExtensionRequest?: OnExtensionRequest;
    });
    sendResponse(type: "dom" | "extension", message: MessageResponse, sender?: Sender): void;
    sendDomMessage<T = unknown>(to: number | string, command: string, args?: unknown): Promise<T>;
    sendExtensionMessage<T = unknown>(to: number | string, command: string, args?: unknown, opts?: {
        timeout?: number;
        ping?: boolean;
        pingTimeout?: number;
        retries?: number;
    }): Promise<T>;
    removeListener(id: string): void;
    removeListeners(): void;
}
export { Messenger };
