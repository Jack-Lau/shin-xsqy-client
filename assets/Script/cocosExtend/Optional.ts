export default class Optional<T> {
    private _isValid: boolean = null;
    private _value: T = null;

    static Just<T>(v: T) {
        return new Optional<T>(v);
    }

    static Nothing<T>() {
        return new Optional<T>();
    }
    
    constructor (v: T = null) {
        if (v != null) {
            this._isValid = true;
            this._value = v;
        } else {
            this._isValid = false;
        }
    }

    getValue() {
        return this._value;
    }

    get val() {
        return this._value;
    }

    get valid() {
        return this._isValid;
    }

    isValid() {
        return this._isValid;
    }

    // Functor f => (a -> b) -> f a -> f b
    fmap<U>(func: (x: T) => U) : Optional<U> {
        if (this.isValid()) {
            return new Optional<U>(func(this.getValue()));
        } else {
            return new Optional<U>();
        }
    }

    async asyncFmap<U>(func: (x: T) => Promise<U>) {
        if (this.isValid()) {
            let u = await func(this.val)
            return new Optional<U>(u);
        } else {
            return new Optional<U>();
        }
    }
    
    // Monad m => (a -> m b) -> m a -> m b
    monadBind<U>(func: (x: T) => Optional<U>) : Optional<U> {
        if (this.isValid()) {
            return func(this.getValue());
        } else {
            return new Optional<U>();
        }
    }

    getOrElse (x: T): T {
        return this.valid ? this.val : x;
    }

    lift2<U,V>(func: (x: T, y: U) => V, ou: Optional<U>) : Optional<V> {
        if (this.valid && ou.valid) {
            return new Optional<V>(func(this.val, ou.val));
        } else {
            return new Optional<V>();
        }
    }

    fold<A>(ifNone: () => A, ifSome: (_: T) => A): A {
        return this.valid ? ifSome(this.val) : ifNone()
    }
}
