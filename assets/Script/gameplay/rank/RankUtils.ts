import { ConfigUtils } from '../../utils/ConfigUtil'

export module RankUtils {
    export let totalKb = 0;
    
    export interface RankAwardModel {
        parameter1: number,
        parameter2: number,
        currency1: number,
        currency2: number,
        way: number, // 标识 p1 p2 是具体值，还是千分比
        id: number,
    }

    export async function getAwardModel(rankId: number, rank: number): Promise<RankAwardModel> {
        let config = await ConfigUtils.getConfigJson('GenericRankingInfo');
        let modelId = R.path([rankId, 'awardModel'], config);
        return await _getAwardModelById(modelId, rank);
    }

    async function _getAwardModelById(modelId: number, rank: number) {
        let modelConfig = await ConfigUtils.getConfigJson('GenericRankingAward');
        return R.find(x => x.Id == modelId, modelConfig[rank + '']['model']);
    }
}
