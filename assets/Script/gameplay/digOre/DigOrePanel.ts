import DigOreItem from "./DigOreItem";
import { CommonUtils } from "../../utils/CommonUtils";
import { MineExplorationOverall, CurrencyRecord } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { ResUtils } from "../../utils/ResUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { TipsManager } from "../../base/TipsManager";
import DigOreFriendPanel from "./DigOreFriendPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import DigOreSettlementTips from "./DigOreSettlementTips";
import DigOreConfirmTips from "./DigOreConfirmTips";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import ItemTips from "../bag/ItemTips";
import ArticleItem from "../bag/ArticleItem";
import BagItem from "../../bag/BagItem";
import { GameConfig } from "../../config/GameConfig";

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
export default class DigOrePanel extends cc.Component {
    @property(cc.Node)
    contentBoxNode: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    friendBtn: cc.Button = null;
    @property(cc.Node)
    friendRed: cc.Node = null;
    @property(ArticleItem)
    bigAwards: ArticleItem[] = [];
    @property(cc.Label)
    debrisLabels: cc.Label[] = [];
    @property(cc.Node)
    gridNode: cc.Node = null;
    oreItems: DigOreItem[] = [];

    @property(cc.Label)
    promptLabel: cc.Label = null;
    @property(cc.Label)
    howManyLabel: cc.Label = null;
    @property(cc.Label)
    kbLabel: cc.Label = null;
    @property(cc.Label)
    vouchersLabel: cc.Label = null;
    
    @property(cc.Toggle)
    setUpToggle: cc.Toggle = null;
    @property(cc.Node)
    setUpGou: cc.Node = null;
    
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Button)
    startDigBtn: cc.Button = null;
    
    @property(cc.Node)
    effFingers: cc.Node = null;
    
    addLifeConfig = null;
    
    overall: MineExplorationOverall = null;
    
    isRuning = false;
    
    digOre: number[] = [];
    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        if (cc.winSize.height / cc.winSize.width < 16 / 9) {
            this.contentBoxNode.scale = cc.winSize.height / 1366;
        }
    
    }
    start() {
        GameConfig.startGambling();
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.oreItems = this.gridNode.getComponentsInChildren(DigOreItem);
        this.init();
    }
    
    initEvents() {
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 31));
        this.friendBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onFriendBtn.bind(this)));
        this.startDigBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onStartDigBtn.bind(this)));
        this.oreItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onItem.bind(this, index)));
        });
    }
    
    async init() {
    
        this.addLifeConfig = await ConfigUtils.getConfigJson('MineExplorationAddLife');
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/get', []) as any;
        if (response.status === 0) {
            this.overall = response.content;
        }
        if (this.overall == null) {
            return;
        }
        await this.updateShow();
    
        if (this.overall.availableDig == 0 && this.overall.inGame) {
            await this.openSettlementTips();
        }
        let isShow = cc.sys.localStorage.getItem('DigOreSetUp');
        if (isShow == 'true') {
            this.setUpToggle.isChecked = true;
        } else {
            this.setUpToggle.isChecked = false;
        }
        this.initEvents();
    }
    
    async updateShow() {
        if (this.overall.bigAwardA == null) {
            this.effFingers.active = true;
        } else {
            this.effFingers.active = false;
        }
        this.isShowFriendRed();
        this.setMyCurrency();
        let debrisA = 0;
        let debrisB = 0;
        if (this.overall.inGame) {
            this.promptLabel.string = '点击矿位探宝,同一宝藏碎片之间必定相邻';
            this.howManyLabel.string = ` (剩余次数 ${this.overall.availableDig}次)`;
            debrisA = 0;
            debrisB = 0;
            let debrisAId = 0;
            let debrisBId = 0;
            for (let index = 0; index < this.oreItems.length; index++) {
                let item = this.oreItems[index];
                let data = this.overall.map[Math.floor(index / 5)][index % 5];
                item.init(data);
                if (data.type != -1) {
                    if (this.digOre.indexOf(index) == -1) {
                        this.digOre.push(index);
                    }
                }
                if (data.type == 1) {
                    debrisA += 1;
                    debrisAId = data.currencyId;
                } else if (data.type == 2) {
                    debrisB += 1;
                    debrisBId = data.currencyId;
                }
    
            }
    
        } else {
            this.promptLabel.string = '本轮已结束，点击下方“再来一轮”开启';
            this.howManyLabel.string = '';
            if (this.overall.bigAwardA != null) {
    
                debrisA = 0;
                debrisB = 0;
                for (let index = 0; index < this.oreItems.length; index++) {
                    let item = this.oreItems[index];
                    let data = this.overall.map[Math.floor(index / 5)][index % 5];
                    if (data != null) {
                        item.init(data);
                        if (!data.isOpen) {
                            item.toMask();
                        } else {
                            if (data.type == 1) {
                                debrisA += 1;
                            } else if (data.type == 2) {
                                debrisB += 1;
                            }
                        }
                    }
                }
            }
        }
        if (this.overall.bigAwardA != null) {
            let bagItemA = new BagItem();
            let date = {} as CurrencyRecord;
            date.currencyId = this.overall.bigAwardA.currencyId;
            if (date.currencyId == 151) {
                date.amount = CommonUtils.toCKb(this.overall.bigAwardA.amount);
            } else {
                date.amount = this.overall.bigAwardA.amount;
            }
            date.accountId = PlayerData.getInstance().accountId;
            bagItemA.category = ItemCategory.Currency;
            bagItemA.data = date;
            await this.bigAwards[0].init(bagItemA, false);
            this.bigAwards[0].setIsUse(false);
			//
            let bagItemB = new BagItem();
            let dateB = {} as CurrencyRecord;
            dateB.currencyId = this.overall.bigAwardB.currencyId;
            if (dateB.currencyId == 151) {
                dateB.amount = CommonUtils.toCKb(this.overall.bigAwardB.amount);
            } else {
                dateB.amount = this.overall.bigAwardB.amount;
            }
            dateB.accountId = PlayerData.getInstance().accountId;
            bagItemB.category = ItemCategory.Currency;
            bagItemB.data = dateB;
            await this.bigAwards[1].init(bagItemB, false);
            this.bigAwards[1].setIsUse(false);
			//
            if (debrisA >= 4) {
                this.debrisLabels[0].string = '已挖出';
                this.debrisLabels[0].node.color = new cc.Color(255, 229, 107);
                this.bigAwards[0].frame.init(this.bigAwards[0].article.getItemDisplay().val.quality, true);
            } else {
                this.debrisLabels[0].string = `碎片 ${debrisA}/4`;
                this.debrisLabels[0].node.color = new cc.Color(255, 255, 255);
                this.bigAwards[0].frame.init(this.bigAwards[0].article.getItemDisplay().val.quality, false);
            }
            if (debrisB >= 4) {
                this.debrisLabels[1].string = '已挖出';
                this.debrisLabels[1].node.color = new cc.Color(255, 229, 107);
                this.bigAwards[1].frame.init(this.bigAwards[1].article.getItemDisplay().val.quality, true);
            } else {
                this.debrisLabels[1].string = `碎片 ${debrisB}/4`;
                this.debrisLabels[1].node.color = new cc.Color(255, 255, 255);
                this.bigAwards[1].frame.init(this.bigAwards[1].article.getItemDisplay().val.quality, false);
            }
        }
    
        let value = this.addLifeConfig[0];
        this.costLabel.string = R.prop('price', value).toString();
        this.isRuning = false;
    }
    
    async onItem(index: number) {
        if (this.isRuning) {
            return;
        }
        let item = this.oreItems[index];
        let data = this.overall.map[Math.floor(index / 5)][index % 5];
        this.isRuning = true;
        if (this.overall.availableDig > 0 && data.type == -1) {
            if (item.canMining) {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/dig', [Math.floor(index / 5), index % 5]) as any;
                if (response.status === 0) {
                    this.overall = response.content;
                    this.digOre.push(index);
                    await item.toAnim();
                    await this.updateShow();
                    if (this.digOre.length >= 25 || this.overall.availableDig < 1) {
                        await this.openSettlementTips();
                    }
                }
            }
        } else if (this.overall.availableDig == 0 && this.overall.inGame) {
            await this.openSettlementTips();
        } else if (data.isOpen && data.type != 5) {
    
        } else if (this.overall.availableDig == 0 && !this.overall.inGame) {
            TipsManager.showMsgFromConfig(1190);
        }
        this.isRuning = false;
    
    }
    
    async setMyCurrency() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${151}`, []) as any;
        if (response.status === 0) {
            this.kbLabel.string = CommonUtils.toCKb(R.prop('amount', response.content));
        }
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${169}`, []) as any;
        if (response2.status === 0) {
            this.vouchersLabel.string = R.prop('amount', response2.content);
        }
    }
    
    isShowFriendRed() {
        this.friendRed.active = false;
        for (let data of this.overall.coupons) {
            if (!data.taken) {
                this.friendRed.active = true;
                return;
            }
        }
    }
    
    async openSettlementTips() {
        //打开结算界面
        await CommonUtils.wait(1);
        let panel = await CommonUtils.getPanel('gameplay/digOre/DigOreSettlementTips', DigOreSettlementTips) as DigOreSettlementTips;
        panel.init(this.overall, this.addLifeConfig[this.digOre.length]);
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    async onAward() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/get', []) as any;
        if (response.status === 0) {
            this.overall = response.content;
        }
        await this.updateShow();
        let isStart = cc.sys.localStorage.getItem('DigOreSetUp');
        if (isStart == 'true') {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/start', []) as any;
            if (response.status === 0) {
                this.overall = response.content;
                this.digOre = [];
                await this.updateShow();
            }
        }
    }


    async onFriendBtn() {
        let panel = await CommonUtils.getPanel('gameplay/digOre/DigOreFriendPanel', DigOreFriendPanel) as DigOreFriendPanel;
        panel.init(this.overall.coupons != null ? this.overall.coupons : []);
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    onSetUpToggle(toggle) {
        cc.sys.localStorage.setItem('DigOreSetUp', this.setUpGou.active);
    }
    
    async onStartDigBtn() {
        if (this.overall.inGame) {
            if (this.overall.availableDig > 0) {
                TipsManager.showMsgFromConfig(1214);
            } else if (this.overall.availableDig == 0) {
                TipsManager.showMsgFromConfig(1215);
            }
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/digOre/DigOreConfirmTips', DigOreConfirmTips) as DigOreConfirmTips;
        panel.init(parseInt(this.costLabel.string), true);
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    closePanel() {
        GameConfig.stopGambling();
        CommonUtils.safeRemove(this.node);
    }
    
    // update (dt) {}
}
