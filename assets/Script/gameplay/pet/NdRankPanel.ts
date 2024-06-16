import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { PetGachaRankingAwardRecord } from "../../net/Protocol";
import NdRankItem from "./NdRankItem";
import { TipsManager } from "../../base/TipsManager";
import PetExhibitPanel from "./PetExhibitPanel";
import { PetData } from "./PetData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NdRankPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;

    @property(cc.Button)
    gainAwardBtn: cc.Button = null;

    from: cc.Node = null;

    start() {
        this.init();
        this.initEvents()
    }

    async init() {
        let timeInfo = CommonUtils.getTimeInfo(Date.now() - 86400000);
        this.timeLabel.string = `${timeInfo.month}月${timeInfo.day}日前10名具体名单如上，请尽快领奖`
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/gachaRankingAward', []) as any;
        if (response.status == 0) {
            let data = response.content;
            this.initItems(data);
            this.emptyNode.active = data.length == 0;
        }
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.gainAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.gainAward.bind(this));
    }

    async initItems(data: Array<PetGachaRankingAwardRecord>) {
        let ids = data.map(x => x.accountId).join(',');
        let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [ids]);
        if (response3.status === 0) {
            data.forEach((ele, index) => {
                let itemNode = cc.instantiate(this.itemPrefab);
                itemNode.parent = this.scrollView.content;
                let item = itemNode.getComponent(NdRankItem);
                item.init(ele, response3.content[index]);
            });   
        }
    }

    closePanel() {
        if (this.from != null) { 
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }

    async gainAward () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/obtainRankingAward', []);
        if (response.status === 0) {
            TipsManager.showMessage('领取成功!');
            if (response.content.pet) {
                let panel = await CommonUtils.getPanel('gameplay/pet/petExhibitPanel', PetExhibitPanel) as PetExhibitPanel;
                panel.init({pet: response.content.pet, parameters: []});
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                PetData.updatePetIds();
            } else {
                TipsManager.showGainCurrency(response.content.currencyStack);
            }
        }
    }
}
