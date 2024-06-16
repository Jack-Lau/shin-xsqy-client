import { MineArenaComplex, PitDetail, CurrencyStack } from "../../net/Protocol";

export module YqsData {
	
    export let myInfo: MineArenaComplex = null;
    export let candidates: Array<PitDetail> = [];
    export let logs = null;
    export let resovleTime = Date.now();
    export let currentReward: Array<CurrencyStack> = [];
    export let challenging: any = null;

    export function getRewardById (cid) {
        for (let reward of currentReward) {
            if (reward.currencyId == cid) {
                if (cid == 151) {
                    return reward.amount / 1000;
                } else {
                    return reward.amount;
                }
            }
        }
        return 0;
    }

    export function getYestedayYb () {
        for (let reward of myInfo.mineArenaRecord.resolvedRewardStacks) {
            if (reward.currencyId == 150) {
                return reward.amount;
            }
        }
        return 0;
    }

}