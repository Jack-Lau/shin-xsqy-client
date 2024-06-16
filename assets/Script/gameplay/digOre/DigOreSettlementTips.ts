import ArticleItem from "../bag/ArticleItem";
import PagingControl from "../../base/PagingControl";
import { CommonUtils } from "../../utils/CommonUtils";
import { MineExplorationOverall, MineExplorationGrid, CurrencyRecord } from "../../net/Protocol";
import BagItem from "../../bag/BagItem";
import PlayerData from "../../data/PlayerData";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import DigOreConfirmTips from "./DigOreConfirmTips";
import DigOrePanel from "./DigOrePanel";
import DigOreFriendTips from "./DigOreFriendTips";
import { ResUtils } from "../../utils/ResUtils";
import DigOreNotFTips from "./DigOreNotFTips";

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
export default class DigOreSettlementTips extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    //一般收获
    @property(ArticleItem)
    generalItems: ArticleItem[] = [];
    @property(cc.Label)
    generaLabels: cc.Label[] = [];
    @property(PagingControl)
    page: PagingControl = null;

    //宝藏
    @property(ArticleItem)
    treasureItems: ArticleItem[] = [];
    @property(cc.Label)
    treasureLabels: cc.Label[] = [];
    @property(cc.Label)
    outLabels: cc.Label[] = [];
    
    @property(cc.RichText)
    costLabel: cc.RichText = null;
    
    @property(cc.Label)
    currencyLabel: cc.Label = null;
    
    @property(cc.Button)
    numberBtn: cc.Button = null;
    @property(cc.Button)
    getBtn: cc.Button = null;
    @property(cc.Node)
    empty: cc.Node = null;
    
    price = 0;
    overall: MineExplorationOverall = null;
    ordinaryGrids: MineExplorationGrid[] = [];
    aGrids: MineExplorationGrid[] = [];
    bGrids: MineExplorationGrid[] = [];
    
    from: DigOrePanel = null;
    readonly Page_Size = 3;
    
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.numberBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onNumberBtn.bind(this)));
        this.getBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onGetBtn.bind(this)));
    }
    
    async init(overall: MineExplorationOverall, config) {
        this.overall = overall;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let data = overall.map[i][j];
                if (data.type == 1) {
                    this.aGrids.push(data);
                } else if (data.type == 2) {
                    this.bGrids.push(data);
                } else if (data.type == 3 || data.type == 4) {
                    this.ordinaryGrids.push(data);
                }
            }
        }
    
        this.page.init(Math.ceil(this.ordinaryGrids.length / this.Page_Size), this.updatePage.bind(this));
        this.setMyCurrency();
    
        let bagItemA = new BagItem();
        let date = {} as CurrencyRecord;
        date.currencyId = overall.bigAwardA.currencyId;
        if (date.currencyId == 151) {
            date.amount = CommonUtils.toCKb(overall.bigAwardA.amount);
        } else {
            date.amount = overall.bigAwardA.amount;
        }
        date.accountId = PlayerData.getInstance().accountId;
        bagItemA.category = ItemCategory.Currency;
        bagItemA.data = date;
    
        await this.treasureItems[0].init(bagItemA, false);
        this.treasureItems[0].setIsUse(false);
        this.treasureLabels[0].string = ItemConfig.getInstance().getCurrencyInfo(overall.bigAwardA.currencyId).fmap(x => x.name).getOrElse('');
    
        let bagItemB = new BagItem();
        let dateB = {} as CurrencyRecord;
        dateB.currencyId = overall.bigAwardB.currencyId;
        if (dateB.currencyId == 151) {
            dateB.amount = CommonUtils.toCKb(overall.bigAwardB.amount);
        } else {
            dateB.amount = overall.bigAwardB.amount;
        }
        dateB.accountId = PlayerData.getInstance().accountId;
    
        bagItemB.category = ItemCategory.Currency;
        bagItemB.data = dateB;
        await this.treasureItems[1].init(bagItemB, false);
        this.treasureItems[1].setIsUse(false);
        this.treasureLabels[1].string = ItemConfig.getInstance().getCurrencyInfo(overall.bigAwardB.currencyId).fmap(x => x.name).getOrElse('');
        this.price = R.prop('price', config);
        if (this.price > 0) {
            this.costLabel.string = `消耗<color=#20650e>${this.price}</color>仙石可以购买<color=#20650e>${R.prop('amount', config)}</color>次额外机会，继续挖宝`;
        } else {
            this.costLabel.string = '已经全部挖出！';
        }
        if (this.aGrids.length >= 4) {
            this.treasureItems[0].frame.init(this.treasureItems[0].article.getItemDisplay().val.quality, true);
        }
        if (this.bGrids.length >= 4) {
            this.treasureItems[1].frame.init(this.treasureItems[1].article.getItemDisplay().val.quality, true);
        }
        this.outLabels[0].string = this.aGrids.length < 4 ? `碎片 ${this.aGrids.length}/4` : '已挖出';
        this.outLabels[1].string = this.bGrids.length < 4 ? `碎片 ${this.bGrids.length}/4` : '已挖出';
    
    }
    
    updatePage(pageNumber: number) {
        let data = R.slice(this.Page_Size * (pageNumber - 1), this.Page_Size * pageNumber, this.ordinaryGrids) as MineExplorationGrid[];
        if (data.length > 0) {
            this.empty.active = false;
        } else {
            this.empty.active = true;
        }
        this.generalItems.forEach((item, index) => {
            if (index < data.length) {
                item.node.active = true;
                let bagItemA = new BagItem();
                let date = {} as CurrencyRecord;
                date.currencyId = data[index].currencyId;
                date.amount = data[index].amount;
                date.accountId = PlayerData.getInstance().accountId;
    
                bagItemA.category = ItemCategory.Currency;
                bagItemA.data = date;
                item.init(bagItemA, false);
                item.setIsUse(false);
                this.generaLabels[index].node.active = true;
                this.generaLabels[index].string = ItemConfig.getInstance().getCurrencyInfo(data[index].currencyId).fmap(x => x.name).getOrElse('');
            } else {
                item.node.active = false;
                this.generaLabels[index].node.active = false;
            }
    
        });
        this.page.setPage(pageNumber);
    }


    async setMyCurrency() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${151}`, []) as any;
        if (response.status === 0) {
            this.currencyLabel.string = CommonUtils.toCKb(R.prop('amount', response.content));
        }
    }


    async onNumberBtn() {
        if (this.price > 0) {
            if (parseInt(this.currencyLabel.string) < this.price) {
                TipsManager.showMsgFromConfig(1021);
                return;
            }
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/add', []) as any;
            if (response.status === 0) {
                this.from.overall = response.content;
                this.from.digOre = [];
                this.from.updateShow();
                TipsManager.showMsgFromConfig(1217);
            }
            this.closePanel();
        }else{
            TipsManager.showMsgFromConfig(1201);
        }
       
    }
    
    async onGetBtn() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/award', []) as any;
        if (response.status === 0) {
            let data = response.content as MineExplorationOverall;
            if (data.coupons.length > 0) {
                if (data.coupons[0].receiverId == null || data.coupons[0].receiverId == 0) {
                    let panel = await CommonUtils.getPanel('gameplay/digOre/DigOreNotFTips', DigOreNotFTips) as DigOreNotFTips;
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                } else {
                    let panel = await CommonUtils.getPanel('gameplay/digOre/DigOreFriendTips', DigOreFriendTips) as DigOreFriendTips;
                    panel.init(data.coupons);
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                }
            }
            this.ordinaryGrids.forEach((grid, index) => {
                if (grid.currencyId != 173) {
                    TipsManager.showGainCurrency({ currencyId: grid.currencyId, amount: grid.amount });
                }
            });
            if (this.aGrids.length == 4) {
                if (this.overall.bigAwardA.currencyId != 151) {
                    TipsManager.showGainCurrency({ currencyId: this.overall.bigAwardA.currencyId, amount: this.overall.bigAwardA.amount });
                } else {
                    TipsManager.showGainCurrency({ currencyId: this.overall.bigAwardA.currencyId, amount: CommonUtils.toCKb(this.overall.bigAwardA.amount) });
                }
    
            }
            if (this.bGrids.length == 4) {
                if (this.overall.bigAwardB.currencyId != 151){
                    TipsManager.showGainCurrency({ currencyId: this.overall.bigAwardB.currencyId, amount: this.overall.bigAwardB.amount });
                }else{
                    TipsManager.showGainCurrency({ currencyId: this.overall.bigAwardB.currencyId, amount: CommonUtils.toCKb(this.overall.bigAwardB.amount) });
                }
                
            }
            this.from.onAward();
        }
        this.closePanel();
    }


    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
    // update (dt) {}
}
