export class Completer<T> {
  private _promise: Promise<T> ;
  private starter: Function;

  public constructor(f: Function) {
    this.starter = f;
    this._promise = new Promise<T>((resolve, reject) => {
      this.complete = resolve;
      this.completeError = reject;
    })
  }

  public start() {
    this.starter();
  }

  public complete(value: T | PromiseLike<T>) {

  }

  public completeError(errorMsg: string) {

  }

  public toPromise(): Promise<T> {
    return this._promise;
  }
}

async function testCompleter() {
  let g: (...args: any[]) => void;
  const h = () => setTimeout(g, 200, Math.random() > 0.5);
  const f = () => h();
  const completer = new Completer<string>(f);
  g = (success: boolean) => {
    if (success) {
      completer.complete("success: !!!");
    } else {
      completer.completeError("error: ~~~");
    }
  }
  completer.start();
  try {
    const value = await completer.toPromise()
    console.log(value)
  } catch (e) {
    console.log(e);
  }
}

testCompleter();