export namespace EventDispatcher {
	
    export class NotifyEvent {
        type: string = "";
        detail: {[key: string]: any} = {};

        constructor(type: string) {
            this.type = type;
        }
    }

    let eventListeners = {};

    export function on(type: string, func) {
        if (!eventListeners[type]) {
            eventListeners[type] = [];
        }
        eventListeners[type].push(func);
    }

    export function off(type: string, func) {
        if (!eventListeners[type]) {
            return;
        }
        let arr = eventListeners[type];
        let index = arr.indexOf(func);
        if (index != -1) {
            arr.splice(index, 1);
        }
    }

    export function dispatch(type: string, detail: any) {
        let event = new NotifyEvent(type);
        event.detail = detail;
        dispatchEvent(event);
    }
    
    export function dispatchEvent(event: NotifyEvent) {
        if (!event || !event.type || !event.detail) {
            return;
        }
        let type = event.type;
        if (eventListeners[type]) {
            for (let listener of eventListeners[type]) {
                listener(event);
            }
        }
    }
}