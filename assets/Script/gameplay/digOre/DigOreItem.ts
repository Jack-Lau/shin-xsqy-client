import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import { MineExplorationGrid } from "../../net/Protocol";
import ItemTips from "../bag/ItemTips";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
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

@ccclass
export default class DigOreItem extends cc.Component {

    @property(cc.Node)
    surface: cc.Node = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Sprite)
    debris: cc.Sprite = null;
    @property(cc.Label)
    numberLabel: cc.Label = null;
    @property(cc.Node)
    maskNode: cc.Node = null;
    @property(cc.Animation)
    anim: cc.Animation = null;

    canMining = true;
    data: MineExplorationGrid = null;

    start() {
        this.icon.node.on(cc.Node.EventType.TOUCH_END, this.openTips.bind(this));
    }

    init(data: MineExplorationGrid) {
        this.data = data;
        this.maskNode.active = false;
        this.onShow();
        this.canMining = true;
    }

    async toAnim() {
        if (this.canMining) {
            this.canMining = false;
            await CommonUtils.wait(this.anim.play().duration);
            let action = cc.fadeOut(0.3);
            this.surface.runAction(action);
            await CommonUtils.wait(0.3);
        }
    }

    toMask() {
        this.maskNode.active = true;
        this.canMining = false;
    }

    async onShow() {
        let iconId = ItemConfig.getInstance().getItemDisplayById(this.data.currencyId, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(150);
        switch (this.data.type) {
            case -1:
                this.surface.active = true;
                let action = cc.fadeIn(0.1);
                this.surface.runAction(action);
                this.icon.node.active = false;
                this.debris.node.active = false;
                this.numberLabel.node.active = false;
                break;
            case 1:
            case 2:
                this.surface.active = false;
                this.icon.node.active = true;
                this.debris.node.active = true;
                this.numberLabel.node.active = true;
                this.icon.spriteFrame = await ResUtils.getCurrencyIconbyId(iconId);
                break;

            case 3:
            case 4:
                this.surface.active = false;
                this.icon.node.active = true;
                this.debris.node.active = false;
                this.numberLabel.node.active = true;
                this.icon.spriteFrame = await ResUtils.getCurrencyIconbyId(iconId);
                break;
            case 5:
                this.surface.active = false;
                this.icon.node.active = false;
                this.debris.node.active = false;
                this.numberLabel.node.active = false;
                break;
        }
        if (this.data.currencyId != null) {
            if (this.data.currencyId == 151) {
                this.numberLabel.string = CommonUtils.formatCurrencyAmount(CommonUtils.toCKb(this.data.amount));
            } else {
                this.numberLabel.string = CommonUtils.formatCurrencyAmount(this.data.amount);
            }
        }

    }

    async openTips(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
        panel.init(ItemConfig.getInstance().getItemDisplayById(this.data.currencyId, PlayerData.getInstance().prefabId), parseInt(this.numberLabel.string), false);
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
