export class SimpleBehaviorSubject<T> {
  private current!: T;
  private listeners: {[key: string]: {
    onChange: (t: T) => void;
    onClose: (() => void) | null;
  }} = {}
  
  public constructor(initialData: T) {
    this.current = initialData
  }

  subscribe(onChange: (t: T) => void, onClose: (() => void) | null = null) {
    const key = String(Date.now())
    this.listeners[key] = {
      onChange,
      onClose
    }
    const _this = this
    onChange(this.current)
    return {
      close() {
        _this.listeners[key] = null as any
        delete _this.listeners[key]
      }
    }
  }

  add(t: T): void {
    this.current = t
    for (let key in this.listeners) {
      this.listeners[key].onChange(this.current)
    }
  }

  done(): void {
    for (let key in this.listeners) {
      const onClose = this.listeners[key].onClose
      if (onClose != null) {
        onClose()
      }
    }
    this.listeners = {}
  }

  get value() {
    return this.current
  }
}

function testSimpleBehaviorSubject() {
  let bs = new SimpleBehaviorSubject(1)
  const sub1 = bs.subscribe(v => console.log(`v1: ${v}`), () => console.log("done"))
  bs.subscribe(v => console.log(`v2: ${v+1}`), () => console.log("done v2"))
  bs.add(2)
  sub1.close()
  bs.add(3)
  bs.done()
}


testSimpleBehaviorSubject()