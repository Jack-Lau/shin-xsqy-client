import { CommonUtils } from "./CommonUtils";

export namespace TimerUtils {
    let cache = {};
    export function getTimestamp(key: string) {
        return R.prop(key, cache);
    }

    export function setTimestamp(key: string, timestamp: number) {
        cache[key] = timestamp;
    }

    /**
     * 开启一个定时器
     * @param step 步长
     * @param total 总次数
     * @param timerCallback 每达到间隔值，触发的回调函数
     * @param completeCallback 完成定时任务的回调
     */
    export function startTimer(step, total, timerCallback, completeCallback) {
        let count = 0;
        let interval = null;
        let func = () => {
            if (count === total) {
                clearInterval(interval);
                CommonUtils.ifExec(completeCallback, completeCallback);
                return;
            } else {
                CommonUtils.ifExec(timerCallback, timerCallback, total - count);
            }
            count += 1;
        }
        interval = setInterval(func, step);
        return interval;
    }

    // 获取当前时间戳
    export function now() {
        return (new Date()).getTime();
    }

    let timerInt = (delta, step) => {
        return Math.floor(delta / step);
    }
    
    export function countDownOnOpen(key, timeRange, step, timerCb, completeCb): boolean {
        let timestamp = getTimestamp(key);
        if (!timestamp) { return null; }
        let delta = timestamp + timeRange * 1000 - TimerUtils.now();
        if (delta <= 0) { return null; }
        timerCb(timerInt(delta, step));
        return TimerUtils.startTimer(step, timerInt(delta, step) - 1, timerCb, completeCb);
    }

    export function countDownOnClick(key, timeRange, step, timerCb, completeCb) {
        setTimestamp(key, now());
        return TimerUtils.startTimer(step, timeRange - 1, timerCb, completeCb);
    }
}