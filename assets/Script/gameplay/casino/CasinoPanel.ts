import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { ChanglefangOverall } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import AccountantOfficePanel from "./AccountantOfficePanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CasinoData } from "./CasinoData";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class CasinoPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    totalAmountLabel: cc.Label = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    myAccountBtn: cc.Button = null;

    // 今日坊账
    @property(cc.Label)
    totalTicketAmountLabel: cc.Label = null;
    @property(cc.Label)
    myTicketAmountLabel: cc.Label = null;
    @property(cc.Label)
    ticketRewardLabel: cc.Label = null;
    @property(cc.Label)
    totalRewardLabel: cc.Label = null;
    
    @property(cc.Button)
    buyTicketBtn: cc.Button = null;
    
    @property(cc.Node)
    blockNode: cc.Node = null;
    
    // 确认购买
    @property(cc.Node)
    sConfirmNode: cc.Node = null;
    @property(cc.Button)
    sCloseBtn: cc.Button = null;
    @property(cc.EditBox)
    sInput: cc.EditBox = null;
    @property(cc.Label)
    sPriceLabel: cc.Label = null;
    @property(cc.Label)
    sTotalLabel: cc.Label = null;
    @property(cc.Label)
    sOwnLabel: cc.Label = null;
    @property(cc.Button)
    sConfirmBtn: cc.Button = null;
    @property(cc.Node)
    sBlockNode: cc.Node = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
    
    /////////////////////////////////////////////
    PRICE: number = 500;
    
    start() {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.buyTicketBtn.node.on(cc.Node.EventType.TOUCH_END, this.showSCBox.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 35));
        this.myAccountBtn.node.on(cc.Node.EventType.TOUCH_END, this.openAccountOfficePanel.bind(this));
    
        /////////////////////////////////////////
        this.sBlockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.sCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideSCBox.bind(this));
        this.sConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.buyTicket.bind(this));
		
		//
		const action = cc.repeatForever(cc.rotateTo(10, 360))
		this.bgLighting.node.runAction(action)
    
        /////////
        this.init();
    }
    
    async init() {
        let overall = await NetUtils.get<ChanglefangOverall>('/changlefang/get', []);
        if (overall.isRight) {
            CasinoData.info.setData(overall.right)
        }
    }
    
    render(overall: ChanglefangOverall) {
        let [总奖励, 总票数, 我的票数] = [
            overall.changlefangSharedRecord.dayEnergy,
            overall.changlefangSharedRecord.totalShare,
            overall.changlefangRecord.totalShare
        ];
        let 分红 = 总票数 == 0 ? 0 : 总奖励 / 总票数 / 100;
        this.totalAmountLabel.string = 总奖励.toLocaleString();
        this.totalTicketAmountLabel.string = String(总票数);
        this.myTicketAmountLabel.string = `${我的票数}+${overall.changlefangRecord.dayShare}`;
        this.ticketRewardLabel.string = String(Math.floor(分红));
        this.totalRewardLabel.string = String(Math.floor(分红 * 我的票数));
    }
    
    /******* start events *******/
    async buyTicket() {
        let amount = parseInt(this.sInput.string);
        if (isNaN(amount)) {
            TipsManager.showMsgFromConfig(1211);
            return;
        }
        let cost = this.PRICE * amount;
        if (cost > PlayerData.getInstance().kbAmount) {
            TipsManager.showMsgFromConfig(1127);
            return;
        }
    
        let overall = await NetUtils.post<ChanglefangOverall>('/changlefang/buy', [amount]);
        if (overall.isRight) {
            TipsManager.showMessage('购买成功');
            CasinoData.info.setData(overall.right)
            this.hideSCBox();
        }
    }
    
    async openAccountOfficePanel() {
        let panel = await CommonUtils.getPanel('gameplay/casino/accountantOfficePanel', AccountantOfficePanel) as AccountantOfficePanel;
        panel.from = this.node;
        this.node.active = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    
    async closePanel() {
        CommonUtils.safeRemove(this.node);
    }
    
    /////////////////////////////////////////
    showSCBox() {
        this.sConfirmNode.active = true;
        this.sOwnLabel.string = String(PlayerData.getInstance().kbAmount);
        this.center();
    }
    
    hideSCBox() {
        this.sConfirmNode.active = false;
    }
    
    center() {
        let amount = parseInt(this.sInput.string);
        if (!isNaN(amount)) {
            this.sInput.string = Math.floor(amount) + '';
            this.sTotalLabel.string = String(this.PRICE * amount)
        } else {
            this.sTotalLabel.string = '0';
        }
        this.sInput && CommonUtils.editBoxCenter(this.sInput);
    }
    
    initSCBox(price: number) {
        this.sPriceLabel.string = String(price);
        this.totalAmountLabel.string = '0';
        this.sInput.string = '';
    }
    
    /******** end events ********/
    
    update () {
        if (CasinoData.info.changed()) {
            this.render(CasinoData.info.data);
        }
    }

}