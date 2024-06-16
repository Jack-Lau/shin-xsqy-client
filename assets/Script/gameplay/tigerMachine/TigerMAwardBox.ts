import ItemFrame from "../../base/ItemFrame";
import { ItemQuality } from "../../bag/ItemConfig";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { CommonUtils } from "../../utils/CommonUtils";
import TigerMachineTips from "./TigerMachineTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

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

export interface SlotMachineAward {
    currencyId: number;
    amount: number;
    awardName: string;
    condition: string;
}

@ccclass
export default class TigerMAwardBox extends cc.Component {

    @property(ItemFrame)
    item: ItemFrame = null;

    @property
    index: string = '0';

    reward: SlotMachineAward = null;
    @property(cc.SpriteFrame)
    boxSpriteFrame: cc.SpriteFrame = null;
    // onLoad () {}

    async start() {
        if (this.item != null) {
            this.item.init(ItemQuality.Orange, true);
        }
        let configInfo = (await ConfigUtils.getConfigJson('SlotMachineAward'));
        for (let key in configInfo) {
            if (key === this.index) {
                this.reward = R.prop(key, configInfo);
                break;
            }
        }
        
        this.node.on(cc.Node.EventType.TOUCH_END, this.openTips.bind(this));
    }

    async openTips(event: cc.Event.EventTouch) {

        let panel = await CommonUtils.getPanel('gameplay/tigerMachine/TigerMachineTips', TigerMachineTips) as TigerMachineTips;
        panel.init(this.reward, this.boxSpriteFrame, parseInt(this.index) > 4);
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
