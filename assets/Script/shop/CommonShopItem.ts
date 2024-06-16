import ItemWithEffect from "../base/ItemWithEffect";
import { ShopUtils } from "./ShopUtils";
import { ResUtils } from "../utils/ResUtils";
import { CommonUtils } from "../utils/CommonUtils";
import ItemConfig from "../bag/ItemConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonShopItem extends cc.Component {
    @property(cc.Sprite)
    selectedSp: cc.Sprite = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    remainLabel: cc.Label = null;
    @property(cc.Label)
    originalPriceLabel: cc.Label = null;

    @property(cc.Sprite)
    currencyIconSp1: cc.Sprite = null;
    @property(cc.Sprite)
    currencyIconSp2: cc.Sprite = null;

    @property(cc.Node)
    redline: cc.Node = null;

    start () {
        
    }

    async init(config: ShopUtils.ShopCommodity, data: any) {
        this.item.initWithCurrency({currencyId: config.currencyId, amount: 0});
        this.nameLabel.string = config.currencyName;
        let parse = x => config.purchaseCurrencyId == 151 ? Math.ceil(x / 1000) : Math.ceil(x);
        this.priceLabel.string = String(parse(data.currentPrice));
        this.remainLabel.string = `剩${data.remainCount}个`;
        let display = ItemConfig.getInstance().getItemDisplayById(config.purchaseCurrencyId, null);
        let iconId = display.fmap(x => x.iconId).getOrElse(0);
        this.currencyIconSp1.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(iconId);
		//
		if (config.rawPrice > 0) {
			this.originalPriceLabel.node.active = this.redline.active = true;
			this.currencyIconSp2.node.active = true;
			this.currencyIconSp2.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(iconId);
			this.originalPriceLabel.string = String(parse(config.rawPrice));
		} else {
			this.originalPriceLabel.node.active = this.redline.active = false;
			this.currencyIconSp2.node.active = false;
		}
		//
        this.item.node.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            CommonUtils.showCurrencyTips({currencyId: config.currencyId, amount: data.remainCount})(e);
        });
    }

    public get selected() : boolean {
        return this.selectedSp.node.active;
    }

    public set selected(v : boolean) {
        this.selectedSp.node.active = v;
    }
    
    
}
