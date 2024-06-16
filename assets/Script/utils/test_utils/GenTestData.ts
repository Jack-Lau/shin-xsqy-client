import { QuestRecord } from "../../net/Protocol";

export default class GenTestData {
    genBool = () => Math.random() > 0.5
    /**
     * [from, to)
     */
    genFloat = from => to => () => Math.random() * (to - from) + from

    genInt = from => to => () => Math.floor(this.genFloat(from)(to)())

    chars = 'qwertyuiopasdfghjklzxcvbnm'

    genChar = () => R.prop(this.genInt(0)(26)(), this.chars)

    genStr = n => this.genArr(this.genChar)(n).join()

    genArr = f => len => this.repeatN(f, len, [])

    genObjByName = name => {
        let atr = this.getAttributes(name);
        for (let key in atr) {
            let type = atr[key];
            atr[key] = this.genValueByName(type)();
        }
        return atr
    }

    genValueByName = name => () => {
        switch (name) {
            case 'number': return this.genInt(0)(100)();
            case 'string': return this.genStr(6);
            case 'Date': return (new Date()).getTime();
            case 'boolean': return this.genBool()
            case 'array': return this.genArr(this.genValueByName(name.split('.')))
            default: {
                return this.genObjByName(name);
            }
        }
    }

    getAttributes = name => { return {} }

    repeatN = (f: (() => any), n: number, result: Array<any>): Array<any> => {
        if (n <= 0) {
            return result
        } else {
            result.push(f())
            return this.repeatN(f, n - 1, result)
        }
    }

    test() {
        let t = {} as  QuestRecord;
        for (let key in t) {
            
        }
    }
}