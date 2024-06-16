import Optional from "./Optional";

export default class Either<L, R> {
    private _val: L | R = null;
    private _isLeft: boolean = false;
    private _isRight: boolean = false;

    private constructor(x: L | R, isLeft: boolean) {
        this._isLeft = isLeft;
        this._isRight = !isLeft;
        this._val = x;
    }

    static Left<L, R>(x: L): Either<L, R> {
        let either = new Either<L, R>(x, true);
        return either;
    }

    static Right<L, R>(x: R): Either<L, R> {
        let either = new Either<L, R>(x, false);
        return either;
    }

    fmap<T>(f: (x: R) => T): Either<L, T> {
        if (this.isLeft) {
            return new Either<L, T>(<L>this.val, true);
        } else {
            return new Either<L, T>(f(<R>this.val), false);
        }
    }

    monadBind<T>(f: (x: R) => Either<L, T>): Either<L, T> {
        if (this.isLeft) {
            return new Either<L, T>(<L>this.val, true);
        } else {
            return f(<R>this.val);
        }
    }

    getOrElse(value: R): R {
        if (this.isRight) {
            return this.right;
        } else {
            return value;
        }
    }

    toOptional() : Optional<R> {
        if (this.isRight) {
            return Optional.Just<R>(this.right);
        } else {
            return Optional.Nothing<R>();
        }
    }

    get isLeft(): boolean {
        return this._isLeft;
    }

    get isRight(): boolean {
        return this._isRight;
    }

    get right (): R {
        return this._val as R;
    }

    get left (): L {
        return this._val as L;
    }

    get val(): L | R {
        return this._val;
    }
}
