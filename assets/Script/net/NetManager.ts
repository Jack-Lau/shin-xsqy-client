import { NetUtils } from "./NetUtils";
import PlayerData from "../data/PlayerData";
import { WebsocketHandler } from "./WebsocketHandler";
import { CommonUtils } from "../utils/CommonUtils";
import { GameConfig } from "../config/GameConfig";

export default class NetManager {
    private static _instance: NetManager = null;
    private _ws: WebSocket = null;
    private _stompClient: stomp.Client;
    private _subscribeList: { [key: string]: stomp.StompSubscription } = {};
    private isDebug = true;

    public constructor() {

    }

    public static getInstance(): NetManager {
        if (!this._instance) {
            this._instance = new NetManager();
        }
        return this._instance;
    }

    public initConnection() {
        // if (this._ws) {
        //     this._ws = null;
        // }
        // this._ws = new WebSocket(NetUtils.wsRoute);
        
        // this._ws.onopen = function (event) {
        //     console.log('on open??')
        //     NetManager.getInstance().connect();
        // };
        
        this._stompClient = stomp.client(NetUtils.getWsRoute());
        this._stompClient.ws.onclose = function(event) {
            console.log('onclose')
            NetManager.getInstance().tryToReconnect(2);
        }
        this._stompClient.ws.onerror = function(event) {
            console.log('onerror')
            NetManager.getInstance().tryToReconnect(2);
        }
        NetManager.getInstance().connect();

        // 第二种 用法
        // this._stompClient = stomp.StompProxy.client(url);

        this._subscribeList = {};
        if (GameConfig.is138) {
            this._stompClient.debug = console.log;
        } else {
            this._stompClient.debug = null;
        }
    }

    public async connect(headers: stomp.StompHeaders = {'heart-beat': '10000,10000', "accept-version": "1.2"}) {
        this._stompClient.connect(headers,
            this.onConnectSuccessCallback.bind(this),
            this.onConnectErrorCallback.bind(this));
        // this._stompClient._transmit('CONNECT', headers);
        // this._stompClient.transmit("CONNECT", {});
    }

    public disconnect(): void {
        if (this.isConnected()) {
            this._stompClient.disconnect( () => {
                console.log('disconnect successfully.')
            });
        }
    }

    reconnect() {
        if (this.isConnected()) {
            this._stompClient.disconnect( function () {
                this.initConnection();
                console.log('重新连接websocket成功！');
            }.bind(this));
        }
    }

    // 断线时使用
    trying: boolean = false;
    async tryToReconnect(waitSeconds: number) {
        if (this.trying) return;
        this.trying = true;
        if (!NetManager.getInstance().isConnected()) {
            this.initConnection();
        }
        await CommonUtils.wait(waitSeconds);
        this.trying = false;
        if (this.isConnected()) {
            console.log('$> reconnect successfully!');
            return;
        } else {
            console.log('$> reconnect... [', Math.floor(waitSeconds), ']');
            this.tryToReconnect(waitSeconds * 1.5);
        }
    }

    // connect success callback
    private onConnectSuccessCallback(frame: stomp.StompFrame): void {
        // subscribe the '/' to receive the message
        console.log('subcribe')
        this.subscribe("/user/queue/*/*", WebsocketHandler.handler, { id: "WebsocketHandler" });
        this.subscribe("/topic/*/*", WebsocketHandler.handler, { id: "WebsocketHandler" });
        this.subscribe("/user/queue/*/*/*", WebsocketHandler.handler, { id: "WebsocketHandler" });
        PlayerData.getInstance().inGame = true;
    }

    private onConnectErrorCallback() {
        console.log('onConnectErrorCallback')
        NetManager.getInstance().tryToReconnect(2);
    }

    // 订阅：收到服务器返回消息后回调callback,
    // headers在订阅的时候 添加{id:message-id}, 此message-id 是服务器返回消息对应的id
    public subscribe(destination: string, callback: any, headers?: stomp.StompHeaders): void {
        let ret: stomp.StompSubscription = this._stompClient.subscribe(destination, callback, headers);
        this._subscribeList[ret.id] = ret;
    }

    // 取消订阅
    public unsubscribe(destination: string): void {
        this._stompClient.unsubscribe(destination);
    }

    // 获取网络状态
    public isConnected(): boolean {
        return this._stompClient.connected;
    }
}