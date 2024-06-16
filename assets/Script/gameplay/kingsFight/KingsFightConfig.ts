import { ConfigUtils } from "../../utils/ConfigUtil";

export module KingsFightConfig {
    export let dailyAwardConfig = {};
    export let seasonConfig = {};
    export const MAX_GRADE = 86;
    export const RANK_ID = 4430009;


    let initial: boolean = false;
    export async function initConfig() {
        if (initial) {
            return;
        }
        dailyAwardConfig = await ConfigUtils.getConfigJson('KingBattleEverydayAward');
        seasonConfig = await ConfigUtils.getConfigJson('KingBattleRank');
        initial = true;
    }

    export function getDailyAwardConfig (awardId: number) {
        return R.prop(awardId, dailyAwardConfig);
    }

    export function getSeasonConfig (rankId: number) {
        return R.prop(rankId, seasonConfig);
    }


}
