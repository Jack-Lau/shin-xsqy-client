
/**
 * stomp module 
 */

declare module stomp {
    
    export class Byte {
        public static LF: string;
        public static NULL: string;
    }

    export interface unmarshallRet {
        frames:Array<any>;
        partial:string
    }

    export interface Heartbeat {
        outgoing:number,
        incoming:number
    }

    export interface StompSubscriptions {
        id:string,
        unsubscribe:()=>void
    }

    export interface Transaction {
        id:string;
        commit:() => void;
        abort: () => void
    }

    export class Frame {
        private command:string;
        private headers: Object;
        private body: Object;

        constructor(command:string, headers?:any, body?: any);

        public toString(): string;

        public static sizeOfUTF8(s:string):number;
        public static unmarshallSingle(data:any):Frame;
        public static unmarshall(datas:any): unmarshallRet;
        public static marshall(command:string, headers?:any, body?:any):Frame;
    }

    export interface StompFrame {
        command: string;
        headers: StompHeaders;
        body?: string;
        ack(headers:any):any;
        nack(header:any):any;
  }

    export type StompHeaders = { [key: string ]: any;};
    export type StompFrameCallback = (frame:StompFrame) => void;

    export interface StompSubscription {
        id: any;
        unsubscribe: () => void;
    }

    export type WebSocketType = WebSocket|any; // any == sydg.GameWebSocket

    export class Client {
        public ws:WebSocketType;
        private count:number;
        public connected:boolean;
        public heartbeat: Heartbeat;
        private maxWebSocketFrameSize:number;
        private subscriptions:Object;
        private partialData:string;

        constructor(ws:WebSocketType);

        public _transmit(command:string, headers?:any, body?:any):void ;
        private parseConnect():any;
        private cleanUp():any;
        private ack(messageId:string, subscribe:any, headers?:any): void;
        private nack(messageId:string, subscribe:any, headers?:any): void;

        public debug(message):void;
        public setupHeartbeat(headers?:any): void; //surpport v1.1 & v1.2
        public connect(login: string, passcode: string, connectCallback?: () => void, errorCallback?: () => void, host?: string);
        public connect(headers: StompHeaders, connectCallback?: StompFrameCallback, errorCallback?: StompFrameCallback);
        public disconnect(disconnectCallback:()=>void, header?:any): any;
        public send(destination:string, header?:any, body?:any):void;
        public subscribe(destination:string, callback:Function, header?:any):StompSubscriptions;
        public unsubscribe(id:string): void;
        public begin(transaction:string): Transaction;
        public commit(transaction:string): void;
        public abort(transaction:string): void;

        
    
        public static now():string;
    }

    export function client(url:string, protocols?:any):Client;
    export function over(ws:WebSocketType): Client;

    export interface VERSIONS {
        supportedVersions: () => string;
        supportedProtocols: () => string
    }

}