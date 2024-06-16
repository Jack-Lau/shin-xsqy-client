import { ConfigUtils } from "../../utils/ConfigUtil";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ShowAward } from "../activity/ActivityData";
import { AntiqueOverall } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import AntiqueRewardTips from "../antique/AntiqueRewardTips";
import MysteriousRewardPanel from "./MysteriousRewardPanel";
import PlayerData from "../../data/PlayerData";

export interface SecretShopJackpot {
    id: number;
    successRate: number;
    lowerPercent: number;
    upperPercent: number;
    repairPrice: number;
    sellKCShow: number;
    sellAward: number;
    failAward: number;
    refreshServerAward: number;
    sellBroadcast: number;
    description: string;
}

export default class MysteriousData {

    private configMysterious: SecretShopJackpot[] = [];

    async init() {
        let configInfo = (await ConfigUtils.getConfigJson('SecretShopJackpot')) as Array<SecretShopJackpot>;
        this.configMysterious = [];
        for (let key in configInfo) {
            let value = R.prop(key, configInfo);
            this.configMysterious.push(value);
        }
    }

    getAllConfigMysterious() {
        let datas: Optional<SecretShopJackpot>[] = [];
        this.configMysterious.forEach((ele) => {
            datas.push(new Optional<SecretShopJackpot>(ele));
        })
        return datas;
    }

    getConfigMysteriousById(id: number) {
        return new Optional<SecretShopJackpot>(R.find(R.propEq('id', id))(this.configMysterious));
    }

    async getServerAll() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/antique/get', []) as any;
        let antiqueOverall: AntiqueOverall = null;
        if (response.status === 0) {
            antiqueOverall = response.content;
        }
        return new Optional<AntiqueOverall>(antiqueOverall);
    }

    async getJadeCurrency() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${158}`, []) as any;
        if (response.status === 0) {
            return R.prop('amount', response.content) as number;
        }
        return 0;
    }

    /**兑换 服务器申请
     * @returns 1.成功 约束的数据类型
     * 2、失败 null 
    */
    async toServerExchange() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/antique/get', []) as any;
        let antiqueOverall: AntiqueOverall = null;
        if (response.status === 0) {
            antiqueOverall = response.content;
            return antiqueOverall;
        }
        return null;
    }

    /**抽奖 服务器申请
        * @returns 1.成功 约束的数据类型
        * 2、失败 null 
       */
    async toServerLuckyDraw() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/antique/get', []) as any;
        let antiqueOverall: AntiqueOverall = null;
        if (response.status === 0) {
            antiqueOverall = response.content;
            return antiqueOverall;
        }
        return null;
    }


    async openReward(datas: AntiqueOverall, isFailure: boolean = false, textString: string) {
        let panel = await CommonUtils.getPanel('gameplay/mysterious/MysteriousRewardPanel', MysteriousRewardPanel) as MysteriousRewardPanel;
        panel.init(datas);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

}