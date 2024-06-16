export default class StateData {
    private _changed: boolean = false;
    private _value: any = null;

    constructor(data = null) {
        this._value = data;
    }

    set value (newValue: any) {
        this._value = newValue;
        this._changed = true;
    }

    get value () : any {
        return this._value;
    }

    get changed () : boolean {
        return this._changed;
    }

    reset() {
        this._changed = false;
    }
}