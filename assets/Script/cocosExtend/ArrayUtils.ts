import Optional from "./Optional";

export module ArrayUtils {
    // monadBind :: (a -> [a]) -> [a] -> [a]
    export function flatMap<T>(f: (T) => Array<T>) {
        return (arr : Array<T>): Array<T> => {
            return R.reduce((x: Array<T>, y: Array<T>) => x.concat(y), [], arr.map(f));
        }
    }

    export function getNextOne<T>(arr: Array<T>, v: T): Optional<T> {
        if (!arr || !(arr instanceof Array)) {
            return Optional.Nothing<T>();
        }
        let index = arr.indexOf(v);
        if (index == -1) {
            return Optional.Nothing<T>();
        } else {
            let length = arr.length
            return Optional.Just<T>(arr[(index + 1 + length) % length]);
        }
    }

    export function getPreviousOne<T>(arr: Array<T>, v: T): Optional<T> {
        if (!arr || !(arr instanceof Array)) {
            return Optional.Nothing<T>();
        }
        let index = arr.indexOf(v);
        if (index == -1) {
            return Optional.Nothing<T>();
        } else {
            let length = arr.length
            return Optional.Just<T>(arr[(index - 1 + length) % length]);
        }
    }
}