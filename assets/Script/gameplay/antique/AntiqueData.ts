import { ConfigUtils } from "../../utils/ConfigUtil";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";
import AntiqueRewardTips from "./AntiqueRewardTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ShowAward } from "../activity/ActivityData";
import { AntiqueOverall } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";

export interface WesternMerchantInfo {
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

export default class AntiqueData {

    private configWesterns: WesternMerchantInfo[] = [];

    async init() {
        let configInfo = (await ConfigUtils.getConfigJson('WesternMerchantInfo')) as Array<WesternMerchantInfo>;
        this.configWesterns = [];
        for (let key in configInfo) {
            let value = R.prop(key, configInfo);
            this.configWesterns.push(value);
        }
    }

    getAllConfigWesterns() {
        return this.configWesterns;
    }

    getConfigWesternsById(id: number) {
        return new Optional<WesternMerchantInfo>(R.find(R.propEq('id', id))(this.configWesterns));
    }

    async getAntiqueOverall() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/antique/get', []) as any;
        let antiqueOverall: AntiqueOverall = null;
        if (response.status === 0) {
            antiqueOverall = response.content;
        }
        return new Optional<AntiqueOverall>(antiqueOverall);
    }

    async openRewardTips(datas: AntiqueOverall, isFailure: boolean = false, textString: string) {
        let panel = await CommonUtils.getPanel('gameplay/antique/AntiqueRewardTips', AntiqueRewardTips) as AntiqueRewardTips;
        panel.init(datas, isFailure, textString);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

}