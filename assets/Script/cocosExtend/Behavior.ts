import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import TradingBuyTips from "../gameplay/trading/TradingBuyTips";

class Behavior<T> {
    subscribers: Array<(T) => void> = [];
    update: () => T;
    eventName: string;
    currentValue: T;

    constructor (eventName: string, update: () => T) {
        this.eventName = eventName;
        this.update = update;
        EventDispatcher.on(eventName, this._update);
    }

    private _update = function () {
        let value = this.update();
        this.currentValue = value;
        this.subscribers.forEach(cb => cb(value));
    }.bind(this);

    subscribe (callback: (T) => void) {
        this.subscribers.push(callback);
    }

    unsubscribe (callback) {
        
    }

    destroy() {
        this.subscribers = [];
        EventDispatcher.off(this.eventName, this._update);
    }

    // transform
    map<U>(f: (x: T) => U): Behavior<U> {
        return new Behavior(this.eventName, () => f(this.update()));
    }
} 

class sth {
    data: Behavior<number>;
    
    constructor () {
        this.data = new Behavior<number>(Notify.REFRESH_ONLINE_STATUS_MYSELF, this.updateData.bind(this));
        this.data.subscribe(this.onDataChange.bind(this));
    }  

    // 如何更新数据
    updateData (): number {
        return 1;
    }

    // 如何根据更新的数据显示
    onDataChange(v: number) {

    }

    kcAmount: Behavior<number>;

}

/**
 * 
 */