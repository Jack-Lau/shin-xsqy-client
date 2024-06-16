import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { BaccaratOverall, BaccaratConstants_Status } from "../../net/Protocol";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

export module HlttData {
    type Arr4 = Array<number>;
    type Arr6<T> = Array<T>;
    let overall: BaccaratOverall = null;

    export function getOverall (): BaccaratOverall {
        return overall;
    }

    export function getStatus(): BaccaratConstants_Status {
        return overall ? overall.status : "WAIT";
    }

    export function getBetAmount(): number {
        if (overall && overall.baccaratBet) {
            let data = overall.baccaratBet;
            return [   R.prop('bet_0', data), R.prop('bet_2', data), R.prop('bet_1', data), 
            R.prop('bet_3', data), R.prop('bet_4', data), R.prop('bet_5', data)
            ].reduce((x, y) => x + y, 0)
        } else {
            return 0;
        }
    }

    export async function getResult(): Promise<Arr4> {
        await CommonUtils.wait(0.2);
        let r = () => CommonUtils.randomInt(0, 10);
        return repeat(r, 4);
    }
    type BetInfo = {
        myBetAmount: number,
        allBetAmount: number,
    }

    function gen(): BetInfo {
        return {
            myBetAmount: 0,
            allBetAmount: CommonUtils.randomInt(1000, 6000000)
        }
    }

    function repeat<T>(f: () => T, n: number): Array<T> {
        let result = [];
        let i = n;
        while (i > 0) {
            result.push(f());
            --i;
        }
        return result;
    }

    export const amountInfo = [40, 200, 1000, 5000]
    const selectedIndexToBetIndex = [0, 2, 1, 3, 4,  5]
    export async function bet(selectedIndex: number, amountIndex: number) {
        let overall = await NetUtils.post<BaccaratOverall>('/baccarat/bet', [selectedIndexToBetIndex[selectedIndex], CommonUtils.toSKb(amountInfo[amountIndex])]);
        if (overall.isRight) {
            setOverall(overall.right)
        }
    }

    export async function unbet(selectedIndex: number) {
        let overall = await NetUtils.post<BaccaratOverall>('/baccarat/unBet', [selectedIndexToBetIndex[selectedIndex]]);
        if (overall.isRight) {
            setOverall(overall.right)
        }
    }

    export async function fetchOverall() {
        let overall = await NetUtils.get<BaccaratOverall>('/baccarat/overall', []);
        if (overall.isRight) {
            setOverall(overall.right)
        }
    }

    export function setOverall(_overall: BaccaratOverall) {
        overall = _overall; 
        EventDispatcher.dispatch(Notify.HLTT_OVERALL_UPDATE, {});
    }
    
    export function getMahjongPoint(index: number): number {
        if (!overall || !overall.baccaratGame || index >=4 ) { return 1; }
        switch (index) {
            case 0: return overall.baccaratGame.redPoint_1;
            case 1: return overall.baccaratGame.redPoint_2;
            case 2: return overall.baccaratGame.bluePoint_1;
            case 3: return overall.baccaratGame.bluePoint_2;
        }
    }

    export function getWinIndexes() {
        let result = [];
        if (!overall || !overall.baccaratGame) {
            return result;
        }
        let r1 = Math.min(overall.baccaratGame.redPoint_1, 10);
        let r2 = Math.min(overall.baccaratGame.redPoint_2, 10);
        let b1 = Math.min(overall.baccaratGame.bluePoint_1, 10);
        let b2 = Math.min(overall.baccaratGame.bluePoint_2, 10);

        let t1 = CommonUtils.divide((r1 + r2), 10).remain;
        let t2 = CommonUtils.divide((b1 + b2), 10).remain;
        if (t1 > t2) {
            result.push(0);
        } else if (t1 == t2) {
            result.push(1);
        } else {
            result.push(2);
        }

        if (r1 == r2 && r1 < 10) {
            result.push(3);
        }

        if (b1 == b2 && b1 < 10) {
            result.push(4)
        }

        if (r1 == r2 && r2 == b1 && b1 == b2 && b2 >= 10) {
            result.push(5);
        }
        return result;
    }

}