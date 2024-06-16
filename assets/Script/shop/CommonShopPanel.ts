import AmountWidget from "../base/AmountWidget";
import { CommonUtils } from "../utils/CommonUtils";
import CommonPanel from "../base/CommonPanel";
import { NetUtils } from "../net/NetUtils";
import { ShopUtils } from "./ShopUtils";
import CommonShopItem from "./CommonShopItem";
import { TipsManager } from "../base/TipsManager";
import ItemConfig from "../bag/ItemConfig";
import { ResUtils } from "../utils/ResUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonShopPanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(AmountWidget)
    amountWidget: AmountWidget = null;

    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Sprite)
    iconSp1: cc.Sprite = null;
    @property(cc.Sprite)
    iconSp2: cc.Sprite = null;

    @property(cc.Button)
    buyBtn: cc.Button = null;

    @property(cc.Node)
    blockNode: cc.Node = null;

    @property(cc.Prefab)
    item: cc.Prefab = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    iconAtlas: cc.SpriteAtlas = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    config = null;
    shopId = 0;

    start() {
        this.initEvents();
    }

    async init(shopId: number) {
        this.titleSp.spriteFrame = this.atlas.getSpriteFrame(String(shopId));
        this.shopId = shopId;
        this.config = await ShopUtils.getConfig();
        let result = await NetUtils.post<Array<any>>('/shop/getShop', [shopId]);
        if (result.isRight) {
            this._data.value = result.right;
        }
        this.amountWidget.init(0, 1, this.amountOnChange.bind(this));
        this._state.value = 0;
    }

    initEvents() {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.buyBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.buy.bind(this)));
    }

    itemOnClick(index: number) {
        let _this = this;
        return () => {
            _this._state.value = index;
        }
    }

    refreshData() {
        let data = this._data.value;
        this.scroll.content.removeAllChildren();
        data.forEach((record, index) => {
            let info = R.prop(R.prop('commodityId', record), this.config);
            let item = cc.instantiate(this.item).getComponent(CommonShopItem);
            item.init(info, record);
            item.node.parent = this.scroll.content;
            item.node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(index))
        });
        super.refreshData();
    }

    async refreshState() {
        this.scroll.content.children.forEach((node, index) => {
            node.getComponent(CommonShopItem).selected = index == this._state.value;
        })
		//
        let commodity = R.prop(this._state.value, this._data.value);
        if (commodity) {
            this.initBottom(commodity);
			//
			let config = await ShopUtils.getConfigById(commodity.commodityId)
			let currencyId = config.fmap(x => x.purchaseCurrencyId).getOrElse(150);
			let parseDown = (x, id) => id == 151 ? CommonUtils.toCKb(x) : Math.floor(x);
			let parseUp = (x, id) => id == 151 ? CommonUtils.toCKb(x) : Math.ceil(x);
			let currentCurrencyAmount = parseDown(await CommonUtils.getCurrencyAmount(currencyId), currencyId);
			let maxBuyAmount = Math.max(Math.min(commodity.remainCount, parseDown(currentCurrencyAmount / parseUp(commodity.currentPrice, currencyId), 0)), 1);
			//
			this.amountWidget.setMax(maxBuyAmount);
			this.amountWidget.setAmount(1);
			this.amountWidget.editboxCenter();
        }
        super.refreshState();
    }

    async initBottom(commodity: any) {
        let config = await ShopUtils.getConfigById(commodity.commodityId)
        let currencyId = config.fmap(x => x.purchaseCurrencyId).getOrElse(150);
        let parseDown = (x, id) => id == 151 ? CommonUtils.toCKb(x) : Math.floor(x);
        let parseUp = (x, id) => id == 151 ? CommonUtils.toCKb(x) : Math.ceil(x);
        this.costLabel.string = '' + parseUp(commodity.currentPrice * this.amountWidget.getCurrentAmount(), currencyId);
        this.ownLabel.string = '' + parseDown(await CommonUtils.getCurrencyAmount(currencyId), currencyId);
        // this.ownLabel.node.color = cc.hexToColor(parseInt(this.ownLabel.string) < parseInt(this.costLabel.string) ? '#ff0000' : '#0C6D08');
        this.ownLabel.node.color = cc.Color.fromHEX(this.ownLabel.node.color, parseInt(this.ownLabel.string) < parseInt(this.costLabel.string) ? '#ff0000' : '#0C6D08')
		//
        let display = ItemConfig.getInstance().getItemDisplayById(currencyId, null);
        let iconId = display.fmap(x => x.iconId).getOrElse(0);
        this.iconSp1.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(iconId);
        this.iconSp2.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(iconId);
    }

    async buy() {
        if (parseInt(this.ownLabel.string) < parseInt(this.costLabel.string)) {
            TipsManager.showMessage('持有的该种类货币数量不足');
            return;
        }
        let commodity = R.prop(this._state.value, this._data.value);
        let amount = this.amountWidget.getCurrentAmount();
        if (amount == 0) {
            TipsManager.showMessage('购买数不能为0');
            return; 
        }
        let price = commodity.currentPrice;
        let result = await NetUtils.post<any>('/shop/buy', [this.shopId, commodity.commodityId, amount, price])
        if (result.isRight) {
            TipsManager.showMessage('购买成功！');
            this._data.value = result.right;
        } else {
            let result = await NetUtils.post<Array<any>>('/shop/getShop', [this.shopId]);
            if (result.isRight) {
                this._data.value = result.right;
            }
        }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }

    amountOnChange() {
        let commodity = R.prop(this._state.value, this._data.value);
        if (commodity) {
            this.initBottom(commodity);
        }
    }
}
