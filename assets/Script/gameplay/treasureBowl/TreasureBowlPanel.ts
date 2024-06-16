// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { Notify } from "../../config/Notify";
import { GameConfig } from "../../config/GameConfig";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import PlayerData from "../../data/PlayerData";
import TreasureBowlTodayPanel from "./TreasureBowlTodayPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TreasureBowlPanel extends cc.Component {
	
	@property(cc.Label)
	totalAward: cc.Label = null;
	@property(cc.Label)
	totalContribution: cc.Label = null;
	@property(cc.Label)
	totalToken: cc.Label = null;
	@property(cc.Label)
	myContribution: cc.Label = null;
	@property(cc.Label)
	myToken: cc.Label = null;
	@property(cc.Label)
	estimateAward: cc.Label = null;
	@property(cc.Label)
	notTakeAmount: cc.Label = null;
    @property(cc.Label)
    currentTime: cc.Label = null;
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	infoBtn: cc.Button = null;
	@property(cc.Button)
	attendBtn: cc.Button = null;
	@property(cc.Button)
	takeBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	
	@property(cc.Node)
	todayNode: cc.Node = null;
	
	treasureBowl = null;
	selfRecord = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
		this.init();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.exit.bind(this));
		this.infoBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 41));
		this.attendBtn.node.on(cc.Node.EventType.TOUCH_END, this.attend.bind(this));
		this.takeBtn.node.on(cc.Node.EventType.TOUCH_END, this.take.bind(this));
		this.todayNode.on(cc.Node.EventType.TOUCH_END, this.today.bind(this));
	}

	async init() {
		GameConfig.startGambling();
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/treasureBowl/get', []);
		if (response.status === 0) {
			this.refresh(response.content);
		}
		//
		this.schedule(this.auto, 1);
	}
	
	refresh(overall: any) {
		this.treasureBowl = overall.treasureBowl;
		this.selfRecord = overall.treasureBowlSelfRecord;
		//
		let tc = 0, tt = 0, mc = 0, mt = 0, ea = 0, ta = 0;
		if (this.treasureBowl.treasureBowlRecord != null) {
			for (let i = 0 ; i < this.treasureBowl.treasureBowlAttendRecords.length; i ++) {
				tc += this.treasureBowl.treasureBowlAttendRecords[i].totalContribution;
				tt += this.treasureBowl.treasureBowlAttendRecords[i].totalChangleToken;
				if (this.treasureBowl.treasureBowlAttendRecords[i].accountId == PlayerData.getInstance().accountId) {
					mc += this.treasureBowl.treasureBowlAttendRecords[i].totalContribution;
					mt += this.treasureBowl.treasureBowlAttendRecords[i].totalChangleToken;
				}
			}
			ta = this.treasureBowl.treasureBowlRecord.totalAward;
			if (tc != 0) {
				ea = Math.floor(ta * mc / tc);
			}
		}
		//
		this.totalContribution.string = tc;
		this.totalToken.string = tt;
		this.myContribution.string = mc;
		this.myToken.string = mt;
		this.estimateAward.string = ea;
		this.totalAward.string = ta;
		this.notTakeAmount.string = this.selfRecord.notTakeAmount;
		//
		let timeInfo = CommonUtils.getServerTimeInfo();
        let f = (val: number) => CommonUtils.prefixNum(2, val);
        this.currentTime.string = `当前时间 ${f(timeInfo.hour)}:${f(timeInfo.minute)}:${f(timeInfo.seconds)}`;
	}
	
	async today() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/treasureBowl/today', []);
		if (response.status === 0) {
			let panel = await CommonUtils.getPanel('gameplay/treasureBowl/TreasureBowlTodayPanel', TreasureBowlTodayPanel) as TreasureBowlTodayPanel;
			panel.init(response.content);
			EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
		}
	}
	
	async take() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/treasureBowl/take', []);
		if (response.status === 0) {
			this.refresh(response.content);
			TipsManager.showMessage('成功领取 ' + this.selfRecord.lastTakeAmount + `<img src='currency_icon_174'/>！`);
		}
	}
	
	async attend() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/treasureBowl/attend', []);
		if (response.status === 0) {
			this.refresh(response.content);
			TipsManager.showMessage('投入一枚长乐贡牌，宝气增加了<color=#fffa7c>' + this.selfRecord.lastAddContribution + '</color>！');
		}
	}
	
	async auto() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/treasureBowl/get', []);
		if (response.status === 0) {
			this.refresh(response.content);
		}
	}
	
	exit() {
		GameConfig.stopGambling();
		CommonUtils.safeRemove(this.node);
		this.unschedule(this.auto);
	}

    // update (dt) {}
}
