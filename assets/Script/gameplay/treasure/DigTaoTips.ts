// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import { Equipment, CurrencyRecord } from "../../net/Protocol";
import ArticleItem from "../bag/ArticleItem";
import BagItem from "../../bag/BagItem";
import PlayerData from "../../data/PlayerData";
import { ItemCategory } from "../../bag/ItemConfig";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import { ShowAward } from "../activity/ActivityData";
import { TreasureAward } from "./TreasureData";
const { ccclass, property } = cc._decorator;

@ccclass
export default class DigTaoTips extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;
    @property(ArticleItem)
    item: ArticleItem = null;
    @property(cc.Label)
    nameLa: cc.Label = null;
    @property(cc.Label)
    numberLa: cc.Label = null;

    @property(cc.Node)
    boxNode: cc.Node = null;
    @property(cc.Node)
    rewardNode: cc.Node = null;
    @property(cc.Animation)
    baoBox1: cc.Animation = null;

    start() {

        this.baoBox1.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showBaoBox.bind(this)));
    }

    async init(itemdata: ShowAward) {
        let bagItem = new BagItem();
        let date = {} as CurrencyRecord;
        date.currencyId = itemdata.id;
        date.amount = itemdata.amount;
        date.accountId = PlayerData.getInstance().accountId;
        bagItem.category = ItemCategory.Currency;
        bagItem.data = date;
        this.item.init(bagItem, false);
        this.nameLa.string = itemdata.name;
        this.numberLa.string = itemdata.amount + '个';
    }

    async showBaoBox() {
        this.baoBox1.play();
        await CommonUtils.wait(0.5);
        this.baoBox1.stop();
        this.boxNode.active = false;
        await CommonUtils.wait(0.5);
        this.showReward();
    }

    async showReward() {
        this.rewardNode.active = true;
        let state = this.rewardNode.getComponent(cc.Animation).getAnimationState('reward_dig');
        await CommonUtils.wait(state.duration);
        this.bg.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
