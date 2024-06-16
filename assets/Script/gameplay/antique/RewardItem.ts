import ArticleItem from "../bag/ArticleItem";
import { AwardResult, CurrencyRecord, CurrencyStack } from "../../net/Protocol";
import BagItem from "../../bag/BagItem";
import ItemConfig, { ItemQuality, ItemCategory } from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";

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
export default class RewardItem extends cc.Component {

    @property(ArticleItem)
    item: ArticleItem = null;
    @property(cc.Label)
    nameLa: cc.Label = null;
    @property(cc.Label)
    numberLa: cc.Label = null;



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    async init(itemdata: CurrencyStack) {

        let bagItem = new BagItem();
        let date = {} as CurrencyRecord;
        date.currencyId = itemdata.currencyId;
        if (date.currencyId == 151) {
            date.amount = CommonUtils.toCKb(itemdata.amount);
        } else {
            date.amount = itemdata.amount;
        }

        date.accountId = PlayerData.getInstance().accountId;
        bagItem.category = ItemCategory.Currency;
        bagItem.data = date;
        this.item.init(bagItem, false);
        let config = ItemConfig.getInstance().getItemDisplayById(date.currencyId, PlayerData.getInstance().prefabId);
        if (config.isValid()) {
            this.nameLa.string = config.getValue().name;
        }
        switch (itemdata.currencyId) {
            case 151:
                this.numberLa.string = CommonUtils.toCKb(itemdata.amount) + '个';
                break;
            default:
                this.numberLa.string = itemdata.amount + '个';
                break;
        }
    }

    // update (dt) {}
}
