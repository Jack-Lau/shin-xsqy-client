export default class DataObject {
    private value: any;
    private listeners: {[key: string] : Function} = {};
    [k:string] : any;

    constructor(value) {
        this.value  = value;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
        for (let key in this.listeners) {
            this.listeners[key](value);
        }
    }

    addListener(key: string, func: Function) {
        this.listeners[key] = func;
    }

    removeListener(key: string) {
        this.listeners[key] = null;
        delete this.listeners[key];
    }
}