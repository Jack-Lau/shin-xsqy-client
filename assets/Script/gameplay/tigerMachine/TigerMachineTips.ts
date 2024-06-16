import ItemWithEffect from "../../base/ItemWithEffect";
import { SlotMachineAward } from "./TigerMAwardBox";
import ItemConfig, { ItemQuality } from "../../bag/ItemConfig";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";

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
export default class TigerMachineTips extends cc.Component {

    @property(cc.Node)
    tipNode: cc.Node = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    category: cc.Label = null;
    @property(cc.Label)
    description: cc.Label = null;
    // onLoad () {}
    start() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    async init(data: SlotMachineAward,boxSpriteFrame:cc.SpriteFrame, effect: boolean) {
        this.item.iconImage.spriteFrame = boxSpriteFrame;
        if (effect) {           
            this.item.frame.init(ItemQuality.Orange, true);
        }else{
            this.item.frame.init(ItemQuality.White, false);
        }
        this.icon.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(data.currencyId);
        this.nameLabel.string = data.awardName;
        this.category.string = data.amount.toString();
        this.description.string = data.condition;
    }
    // update (dt) {}

    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
