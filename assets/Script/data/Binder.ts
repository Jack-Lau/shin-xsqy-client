export module Binder {
    export function genProcedure(x, listeners = []) {
        return function (type: string, newVal: any = null) {
            if ("get" === type) {
                return x;
            } else if ("getListeners" === type) {
                return listeners;
            } else if ("set" === type) {
                for (let listener of listeners) {
                    listener(newVal);
                }
                return genProcedure(newVal, listeners);
            } else {
                return Error(type);
            }
        }
    }
    
    export function addListener(procedureOld, listener) {
        let value = procedureOld("get")
        let listeners = procedureOld("getListeners");
        listeners.push(listener);
        return genProcedure(value, listeners);
    }

    export class BindableObject {
        private _value: any = null;
        private _listeners = [];

        constructor(value: any, listeners: Array<any>) {
            this._value = value;
            this._listeners = listeners;
        }  
        
        getValue() {
            return this._value;
        }

        setValue(newVal: any) {
            for (let listener of this._listeners) {
                listener(newVal);
            }
            this._value = newVal;
        }

        addListener(func) {
            this._listeners.push(func);
        }
    }
}