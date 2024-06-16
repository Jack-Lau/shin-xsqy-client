export type Fn<T, U> = (x: T) => U;

interface Updateable<T> {
    changed: () => boolean;
    data: T;
    setData: Fn<T, void>;
    _changed: boolean;
}

export function updatable<T>(initial: T): Updateable<T> {
    return {
        data: initial,
        _changed: false,
        changed: function() {
            return this._changed && !(this._changed = false);
        },
        setData(data: T) {
            this.data = data;
            this._changed = true;
        }
    }
}