export module PromiseUtils {
    export async function flatMap<T, U>(f: (x:T) => Promise<U>, v: Promise<T>): Promise<U> {
        let t = await v ;
        return f(t);
    }
}