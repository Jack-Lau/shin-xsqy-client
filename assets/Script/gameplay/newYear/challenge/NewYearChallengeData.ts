import { ConfigUtils } from "../../../utils/ConfigUtil";
import { CommonUtils } from "../../../utils/CommonUtils";

export module NewYearChallengeData {
    const startTime = 1548345600000;
    export interface LuckStarDisplay {
        id: number,
        name: string,
        prefabId: number,
        starLevel: number,
        description: string
    }

    let initial = false;
    let luckStarInfo: {[key: string]: LuckStarDisplay} = {}; 
    let luckStarAwardInfo = {}
    async function init () {
        if (initial) {
            return;
        }
        luckStarInfo = (await ConfigUtils.getConfigJson('LuckyStarShowInfo')) as any;
        luckStarAwardInfo = await ConfigUtils.getConfigJson('LuckyStarAwardInfo');
    }

    export async function getDisplayByQuestId(questId): Promise<LuckStarDisplay> {
        await init();
        return luckStarInfo[questId];
    }

    export async function getTodayAward(todayLuckyInfoId: number) {
        await init();
        return luckStarAwardInfo[todayLuckyInfoId];
    }
}