import { CommonUtils } from "../../utils/CommonUtils";
import MysteryStoreItem from "./MysteryStoreItem";
import ItemWithEffect from "../../base/ItemWithEffect";
import { NetUtils } from "../../net/NetUtils";
import { SecretShopOverall, CurrencyStack, SecretShopPrizeGrantingStats } from "../../net/Protocol";
import { CurrencyId } from "../../config/CurrencyId";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { TipsManager } from "../../base/TipsManager";
import DigTaoTips from "../treasure/DigTaoTips";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import Optional from "../../cocosExtend/Optional";


/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MysteryStorePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;

    @property(cc.Node)
    exchangeNode: cc.Node = null;
    @property(cc.Node)
    drawNode: cc.Node = null;
    
    // draw
    @property([MysteryStoreItem])
    items: Array<MysteryStoreItem> = [];
    @property(cc.Button)
    drawBuyBtn: cc.Button = null;
    @property(cc.Label)
    drawOwnLabel: cc.Label = null;
    @property(cc.Label)
    drawCostLabel: cc.Label = null;
    
    // exchange
    @property(cc.Button)
    exchangeBtn: cc.Button = null;
    @property(ItemWithEffect)
    item1: ItemWithEffect = null;
    @property(cc.Label)
    amount1Label: cc.Label = null;
    @property(cc.Label)
    name1Label: cc.Label = null;
    @property(ItemWithEffect)
    item2: ItemWithEffect = null;
    @property(cc.Label)
    amount2Label: cc.Label = null;
    @property(cc.Label)
    name2Label: cc.Label = null;
    @property(cc.Label)
    exchangeOwnLabel: cc.Label = null;
    @property(cc.Label)
    remainLabel: cc.Label = null;
    
    @property(cc.Node)
    blockBg: cc.Node = null;
    @property(cc.Node)
    blockBg2: cc.Node = null;


    jadeStack: CurrencyStack = null;
    kcStack: CurrencyStack = { currencyId: CurrencyId.克己之玉, amount: 1 };
    overall: SecretShopOverall = null;
    currentIndex: number = 0;


    start() {
        this.init();
        this.initEvents();
    }
    
    async init() {
        await this.initExchange();
        await this.checkUntake();
        await this.initDraw();
    }
    
    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 21));
        this.exchangeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onExchange.bind(this)));
        this.drawBuyBtn.node.on(cc.Node.EventType.TOUCH_END, this.onDraw.bind(this));
        let _this = this;
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, () => {
            _this.drawNode.active = false;
            _this.exchangeNode.active = true;
        });
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, () => {
            _this.drawNode.active = true;
            _this.exchangeNode.active = false;
        });
    
        this.blockBg.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.blockBg2.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.item1.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            if (!this.jadeStack) {
                return;
            }
            CommonUtils.showCurrencyTips(this.jadeStack)(e);
        });
        this.item2.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            CommonUtils.showCurrencyTips(this.kcStack)(e);
        });
    }
    
    async checkUntake() {
        if (this.overall && this.overall.secretShopRecord.notTakePrizes.length > 0) {
            let result = await NetUtils.get<SecretShopOverall>('/secretShop/take', []);
            if (result.isRight) {
                this.overall = result.right;
                await this.checkUntake();
            }
        }
    }
    
    async initExchange() {
        this.name1Label.string = '经验'
        this.name2Label.string = '克己之玉'
        this.amount2Label.string = '1'
        this.item2.initWithCurrency({ currencyId: CurrencyId.克己之玉, amount: 1 });
        this.item1.initWithCurrency({ currencyId: CurrencyId.经验, amount: 1 });
        let jadeAmount = await CommonUtils.getCurrencyAmount(CurrencyId.经验);
        this.jadeStack = { currencyId: CurrencyId.经验, amount: jadeAmount };
        this.exchangeOwnLabel.string = CommonUtils.formatCurrencyAmount(jadeAmount);
        let result = await NetUtils.get<SecretShopOverall>('/secretShop/get', []);
        if (result.isRight) {
            this.overall = result.right;
            this.remainLabel.string = `剩${this.overall.secretShopSharedRecord.kcPackRemainCount}个`
            this.amount1Label.string = String(result.right.prices[0]);
        }
    }
    
    async initDraw() {
        if (!this.overall) {
            return;
        }
        let drawPrice = this.overall.prices[1];
        this.drawCostLabel.string = `/${CommonUtils.formatCurrencyAmount(drawPrice)}`;
        this.drawOwnLabel.string = this.jadeStack.amount + '';
        // this.drawOwnLabel.node.color = cc.hexToColor(this.jadeStack.amount < drawPrice ? '#ff0000' : '#0C6D08');
        this.drawOwnLabel.node.color = cc.Color.fromHEX(this.drawOwnLabel.node.color, this.jadeStack.amount < drawPrice ? '#ff0000' : '#0C6D08')
        let bigAwardStates = (await NetUtils.get<Array<SecretShopPrizeGrantingStats>>('/secretShop/getGrantingStats', [])).getOrElse([]);
        let config = await ConfigUtils.getConfigJson('SecretShopJackpot');
        for (let index in config) {
            let info = config[index];
            if (info.serialNumber != 0) {
                let stats = R.find(R.propEq('id', info.id), bigAwardStates);
                let limit = Optional.Nothing<number>();
                if (info.limit) {
                    limit = Optional.Just<number>(stats == undefined ? info.limit : (info.limit - stats.grantedCount));
                }
                const currencyId = R.prop('currencyId', info)
                const postProcess = currencyId === 151 ? R.divide(R.__, 1000) : R.identity
                this.items[info.serialNumber - 1].init(
                    { currencyId, amount: postProcess(R.prop('currencyAmount', info)) },
                    R.prop('name', info),
                    limit
                );
            }
            
        }
    }
    
    async onExchange() {
        if (!this.overall) {
            return;
        }
        if (this.jadeStack && this.jadeStack.amount < this.overall.prices[0]) {
            TipsManager.showMsgFromConfig(1102);
            return;
        }
        let result = await NetUtils.post<SecretShopOverall>('/secretShop/exchange', []);
        if (result.isRight) {
            TipsManager.showMessage('兑换成功');
            this.overall = result.right;
            await this.initExchange()
            await this.initDraw();
        } else {
            this.init();
        }
    }
    
    async getSerialdId(id: number) {
        let config = await ConfigUtils.getConfigJson('SecretShopJackpot');
        for (let index in config) {
            let info = config[index];
            if (info.id == id) {
                return info.serialNumber;
            }
        }
        return 1;
    }
    
    async onDraw() {
        if (!this.overall) {
            return;
        }
        if (this.jadeStack && this.jadeStack.amount < this.overall.prices[1]) {
            TipsManager.showMsgFromConfig(1102);
            return;
        }
        let result = await NetUtils.post<SecretShopOverall>('/secretShop/draw', [this.overall.prices[1], false]);
        if (result.isRight) {
            let award = result.right.secretShopRecord.notTakePrizes[0];
            if (!award) return;
            let serialId  = await this.getSerialdId(award.jackpotId);
            let awardIndex = serialId - 1;
            let awardStack = { currencyId: award.currencyId, amount: award.currencyId == 151 ? award.currencyAmount / 1000 : award.currencyAmount };
            let count = this.currentIndex;
            this.currentIndex = awardIndex;
            if (count >= awardIndex) {
                awardIndex += 10;
            } else {
                awardIndex += 20;
            }
            this.blockBg2.active = true;
            await this.showTween(awardIndex, count);
            this.blockBg2.active = false;
            let result2 = await NetUtils.post<SecretShopOverall>('/secretShop/take', []);
            if (result2.isRight) {
                this.overall = result.right;
                this.showAward(awardStack);
            }
            await this.initExchange()
            await this.initDraw();
        } else {
            await this.init();
        }
    }
    
    async showAward(stack: CurrencyStack) {
        let panel = await CommonUtils.getPanel('gameplay/treasure/digTaoJiangliTips', DigTaoTips) as DigTaoTips;
        let data = {
            id: stack.currencyId,
            amount: stack.amount,
            name: ""
        }
    
        let config = ItemConfig.getInstance().getItemDisplayById(data.id, PlayerData.getInstance().prefabId);
        if (config.isValid()) {
            data.name = config.getValue().name;
        }
        await panel.init(data);
        panel.showBaoBox();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    async showTween(index: number, count: number) {
        this.items[(count - 1 + 10) % 10].selected = false;
        let item = this.items[(count % 10)];
        item.selected = true;
        item.selectedNode.opacity = 0;
        item.selectedNode.runAction(cc.fadeTo(0.05, 255));
        await CommonUtils.wait(0.1);
        if (count >= index) {
            return;
        } else {
            await this.showTween(index, count + 1);
        }
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}

