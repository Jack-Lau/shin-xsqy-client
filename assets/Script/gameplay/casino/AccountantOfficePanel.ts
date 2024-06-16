import ItemWithEffect from "../../base/ItemWithEffect";
import PagingControl from "../../base/PagingControl";
import AccountantRecordItem from "./AccountantRecordItem";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { ChanglefangOverall, ChanglefangLog } from "../../net/Protocol";
import { TipsManager } from "../../base/TipsManager";
import { CasinoData } from "./CasinoData";
import { updatable } from "../../cocosExtend/Updatable";
import { CurrencyId } from "../../config/CurrencyId";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class AccountantOfficePanel extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;

    // 兑换
    @property(cc.Node)
    exchangeNode: cc.Node = null;
    @property(cc.Label)
    rateLabel: cc.Label = null;
    @property(ItemWithEffect)
    fjItem: ItemWithEffect = null;
    @property(ItemWithEffect)
    kbItem: ItemWithEffect = null;
    @property(cc.Button)
    minusBtn: cc.Button = null;
    @property(cc.Button)
    plusBtn: cc.Button = null;
    @property(cc.Button)
    maxBtn: cc.Button = null;
    @property(cc.EditBox)
    input: cc.EditBox = null;
    @property(cc.Button)
    exchangeBtn: cc.Button = null;
    @property(cc.Label)
    fjAmountLabel: cc.Label = null;
    
    maxAmount: number = 1;
    
    // 记录
    @property(cc.Node)
    recordNode: cc.Node = null;
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property([AccountantRecordItem])
    recordItems: Array<AccountantRecordItem> = [];
    @property(cc.Node)
    emptyNode: cc.Node = null;
    
    inputAmount = updatable<number>(0);
    records: Array<ChanglefangLog> = [];
    from: cc.Node = null;
    readonly PAGE_SIZE = 5;
    
    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchToExchange.bind(this));
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchToRecord.bind(this));
        this.minusBtn.node.on(cc.Node.EventType.TOUCH_END, this.minus.bind(this));
        this.plusBtn.node.on(cc.Node.EventType.TOUCH_END, this.plus.bind(this));
        this.maxBtn.node.on(cc.Node.EventType.TOUCH_END, this.max.bind(this));
        this.exchangeBtn.node.on(cc.Node.EventType.TOUCH_END, this.exchange.bind(this));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.rateLabel.string = '1000:1';
        this.initMaxAmount();
        this.center();
        this.fjItem.initWithCurrency({currencyId: CurrencyId.坊金, amount: 0});
        this.kbItem.initWithCurrency({currencyId: CurrencyId.仙石, amount: 0});
    }
    
    async initMaxAmount () {
        let amount = await CommonUtils.getCurrencyAmount(CurrencyId.坊金);
        this.fjAmountLabel.string = `拥有坊金 ${amount}`;
        this.maxAmount = Math.floor(amount / 1000);
    }
    
    render(amount: number) {
        this.kbItem.descLabel.string = CommonUtils.formatCurrencyAmount(amount);
        this.fjItem.descLabel.string = CommonUtils.formatCurrencyAmount(amount * 1000);
    }
    
    async initRecords () {
        let logs = await NetUtils.get<Array<ChanglefangLog>>('/changlefang/log', []);
        if (logs.isRight) {
            this.records = logs.getOrElse([]).filter(x => x.type != "BUY" && x.gainValue > 0);
            let max = Math.max(Math.ceil(this.records.length / this.PAGE_SIZE), 1);
            this.pageControl.init(max, this.renderRecord.bind(this))
        }  
    }
    
    renderRecord (page: number) {
        this.pageControl.setPage(page);
        let data = R.slice(this.PAGE_SIZE * (page - 1), this.PAGE_SIZE * page, this.records);
        let length = data.length;
        this.emptyNode.active = length == 0;
        this.recordItems.forEach((item, index) => {
            let show = index < length && data[index] && data[index].gainValue > 0;
            item.node.opacity = show ? 255 : 0;
            if (show) {
                item.init(data[index]);
            }
        })
    }
    
    /******* start events *******/
    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }
    
    switchToExchange () {
        this.exchangeNode.active = true;
        this.recordNode.active = false;
    }
    
    switchToRecord () {
        this.exchangeNode.active = false;
        this.recordNode.active = true;
        this.initRecords();
    }
    
    minus() {
        let amount = this.inputAmount.data;
        amount = Math.max(0, amount - 1);
        if (amount != this.inputAmount.data) {
            this.inputAmount.setData(amount);
            this.input.string = amount + '';
        }
    }
    
    plus() {
        let amount = this.inputAmount.data;
        amount = Math.min(this.maxAmount, amount + 1);
        if (amount != this.inputAmount.data) {
            this.inputAmount.setData(amount);
            this.input.string = amount + '';
        }
    }
    
    max() {
        if (this.maxAmount != this.inputAmount.data) {
            this.inputAmount.setData(this.maxAmount);
            this.input.string = this.maxAmount + '';
        }
    }
    
    async exchange() {
        let amount = parseInt(this.input.string);
        if (isNaN(amount) || amount == 0) {
            TipsManager.showMessage('请输入一个大于0的整数');
            return;
        }
        if (amount > this.maxAmount) {
            TipsManager.showMessage('坊金不足1000, 无法兑换');
            return;
        }
        let overall = await NetUtils.post<ChanglefangOverall>('/changlefang/exchange_kc', [amount]);
        if (overall.isRight) {
            TipsManager.showMessage('兑换成功');
            CasinoData.info.setData(overall.right)
            await this.initMaxAmount();
            return;
        }
    }
    
    center() {
        let amount = parseInt(this.input.string);
        if (!isNaN(amount)) {
            this.inputAmount.setData(amount);
        }
        CommonUtils.editBoxCenter(this.input);
    }
    
    /******** end events ********/
    
    update () {
        if (this.inputAmount.changed()) {
            this.render(this.inputAmount.data);
        }
    }
}