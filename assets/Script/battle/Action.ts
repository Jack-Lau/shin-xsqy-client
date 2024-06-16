export module Action {
    export class BaseAction {
        time: any = null;
        run = null;
        constructor(func, time, ...args: any[]) {
            this.time = time;
            this.run = () => {
                func(...args);
            }
        }
    }

    export class CompondAction {
        actionArr: any[] = [];
        time: any = null;
        constructor(actionArr, time) {
            this.actionArr = actionArr;
            this.time = time;
        }
    }

    export function excute(action: BaseAction | CompondAction) {
        if (action instanceof BaseAction) {
            setTimeout(action.run, action.time);
        } else if (action instanceof CompondAction) {
            let func = function() {
                action.actionArr.map(action => {
                    excute(action);
                })
            }
            setTimeout(func, action.time);
        }
    }
}