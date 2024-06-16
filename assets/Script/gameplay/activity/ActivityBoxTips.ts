import { Equipment, CurrencyRecord } from "../../net/Protocol";
import { ShowAward } from "./ActivityData";
import ArticleItem from "../bag/ArticleItem";
import BagItem from "../../bag/BagItem";
import PlayerData from "../../data/PlayerData";
import { ItemCategory } from "../../bag/ItemConfig";
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

export interface JustShow {
    iconId: number;
    modelId: number;
    amount: number;
    accountId: number;
    name: string;
}

@ccclass
export default class ActivityBoxTips extends cc.Component {

    @property(cc.Node)
    box: cc.Node = null;
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    list: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;

    event: cc.Event.EventTouch;

    isRight = true;

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.node.opacity = 0;
    }

    async init(itemdata: Array<ShowAward>, event: cc.Event.EventTouch, title: string = '活动奖励') {
        this.event = event;
        let items = itemdata as Array<ShowAward>;
        this.titleLabel.string = title;
        items.forEach((ele) => {
            let node = cc.instantiate(this.itemPrefab);
            node.parent = this.list;
            let item = node.getComponent(ArticleItem);
            let bagItem = new BagItem();
            let date = {} as CurrencyRecord;
            date.currencyId = ele.id;
            date.amount = ele.amount;
            date.accountId = PlayerData.getInstance().accountId;
            bagItem.data = date;
            bagItem.category = ItemCategory.Currency;
            item.init(bagItem, false);
            item.setIsUse(false);

        });
        await CommonUtils.wait(0.1);
        this.setBox();
    }

    async initJustShow(itemdata: Array<JustShow>, event: cc.Event.EventTouch, title: string = '活动奖励') {
        this.event = event;
        let items = itemdata as Array<JustShow>;
        this.titleLabel.string = title;
        items.forEach((ele) => {
            let node = cc.instantiate(this.itemPrefab);
            node.parent = this.list;
            let item = node.getComponent(ArticleItem);
            let bagItem = new BagItem();
            bagItem.data = ele;
            bagItem.category = ItemCategory.JustShow;
            item.init(bagItem, false);
            item.setIsUse(false);

        });
        await CommonUtils.wait(0.1);
        this.setBox();
    }

    setBox() {
        if (this.list.width < 250) {
            this.list.width = 250;
        }
        this.bg.width = this.list.width;
        if (this.isRight) {
            let location = this.event.getLocationInView();
            let func = R.compose(
                R.min(768 / 2 - this.box.width / 2),
                R.max(this.box.width / 2 - 768 / 2)
            );
            this.box.x = func((location.x) - 768 / 2) + 70;
            this.box.y = cc.winSize.height / 2 - (location.y) + 1366 - cc.winSize.height + 20;
        } else {
            let location = this.event.getLocationInView();
            let func = R.compose(
                R.min(768 / 2 - this.box.width / 2),
                R.max(this.box.width / 2 - 768 / 2)
            );
            this.box.x = func((location.x) - 768 / 2) - 70;
            this.box.y = cc.winSize.height / 2 - (location.y) + 1366 - cc.winSize.height + 50;
        }
        this.node.opacity = 255;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
