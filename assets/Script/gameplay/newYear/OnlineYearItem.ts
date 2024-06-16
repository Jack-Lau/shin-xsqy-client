import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import OnlineYearPanel from "./OnlineYearPanel";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import ItemTips from "../bag/ItemTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { NetUtils } from "../../net/NetUtils";
import { AwardResult } from "../../net/Protocol";
import { TipsManager } from "../../base/TipsManager";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class OnlineYearItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    timeNode: cc.Node = null;
    @property(cc.Button)
    receiveBtn: cc.Button = null;
    @property(cc.Button)
    haveBtn: cc.Button = null;

    from: OnlineYearPanel = null;
    currencyId = 0;
    index = 0;
    start() {
        this.receiveBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onReceiveBtn.bind(this)));
        this.icon.node.on(cc.Node.EventType.TOUCH_END, this.openTips.bind(this));
    }

    async init(data, isTime: boolean, isReceive: boolean) {
        this.timeNode.active = true;
        if (isTime) {
            this.timeNode.active = false;
            this.receiveBtn.node.active = !isReceive;
            this.haveBtn.node.active = isReceive;
        }
        this.currencyId = R.path(['currency','Id'], data);
        let iconId = ItemConfig.getInstance().getItemDisplayById(this.currencyId, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(150);
        this.icon.spriteFrame = await ResUtils.getCurrencyIconbyId(iconId);
        this.label.string =R.path(['currency','amount'], data);
    }

    async onReceiveBtn() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/zxjl/obtainAward', [this.index]) as any;
        if (response.status === 0) {
            let data = (response.content as AwardResult).currencyStacks;
            this.haveBtn.node.active = true;
            this.receiveBtn.node.active = false;
            this.timeNode.active = false;
            /*
            data.forEach((ele) => {
                if(ele.amount >0){
                    let iconId = ItemConfig.getInstance().getItemDisplayById(ele.currencyId, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(150);
                    TipsManager.showGainCurrency({ currencyId: iconId, amount: ele.amount });
                }              
            });
            */
        }
    }


    async openTips(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
        panel.init(ItemConfig.getInstance().getItemDisplayById(this.currencyId, PlayerData.getInstance().prefabId), parseInt(this.label.string), false);
        let location = event.getLocationInView();
        let func = R.compose(
            R.min(768 / 2 - panel.tipNode.width / 2),
            R.max(panel.tipNode.width / 2 - 768 / 2)
        );
        panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
        panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    // update (dt) {}
}
