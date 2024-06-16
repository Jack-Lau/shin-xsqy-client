// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import PlayerData from "../../data/PlayerData";
import TreasureBowlAttendPanel from "./TreasureBowlAttendPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TreasureBowlTodayPanel extends cc.Component {

	@property([cc.Label])
	totalContributions: Array<cc.Label> = [];
	@property([cc.Label])
	attendCounts: Array<cc.Label> = [];
	@property([cc.Label])
	totalTokens: Array<cc.Label> = [];
	@property(cc.Label)
	currentPage: cc.Label = null;
	@property(cc.Label)
	todayTotalAward: cc.Label = null;
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	prevBtn: cc.Button = null;
	@property(cc.Button)
	nextBtn: cc.Button = null;
	
	@property([cc.Sprite])
	recordBgs: Array<cc.Sprite> = [];
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	
	treasureBowls = null;
	currentIndex = 1;
	maxIndex = 1;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
		this.prevBtn.node.on(cc.Node.EventType.TOUCH_END, this.prevClick.bind(this));
		this.nextBtn.node.on(cc.Node.EventType.TOUCH_END, this.nextClick.bind(this));
		for (let i = 0 ; i < this.recordBgs.length; i ++) {
			this.recordBgs[i].node.on(cc.Node.EventType.TOUCH_END, this.detail.bind(this, i));
		}
	}

	async init(treasureBowls : any) {
		this.treasureBowls = treasureBowls;
		//
		if (Math.floor(this.treasureBowls.length / 5) * 5 == this.treasureBowls.length && this.treasureBowls.length > 0) {
			this.maxIndex = Math.floor(this.treasureBowls.length / 5);
		} else {
			this.maxIndex = Math.floor(this.treasureBowls.length / 5 + 1);
		}
		this.refreshPage();
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.2, 255);
		this.node.runAction(fadeAction);
	}

	async refreshPage() {
		this.currentPage.string = this.currentIndex + '/' + this.maxIndex;
		let recordStart = (this.currentIndex - 1) * 5;
		for (let i = 0; i < 5; i ++) {
			let recordIndex = recordStart + i;
			if (recordIndex < this.treasureBowls.length) {
				let record = this.treasureBowls[recordIndex];
				let tc = 0, tt = 0;
				for (let j = 0 ; j < record.treasureBowlAttendRecords.length; j ++) {
					tc += record.treasureBowlAttendRecords[j].totalContribution;
					tt += record.treasureBowlAttendRecords[j].totalChangleToken;
				}
				this.totalContributions[i].string = '总宝气 ' + tc;
				this.totalTokens[i].string = tt;
				this.attendCounts[i].string = '参与人数 ' +  record.treasureBowlAttendRecords.length;
			} else {
				this.totalContributions[i].string = '总宝气 ？？？？';
				this.totalTokens[i].string = '？？？？';
				this.attendCounts[i].string = '参与人数 ？？';
			}
		}
		//
		let tta = 0;
		for (let i = 0 ; i < this.treasureBowls.length; i ++) {
			for (let j = 0 ; j < this.treasureBowls[i].treasureBowlAttendRecords.length; j ++) {
				if (this.treasureBowls[i].treasureBowlAttendRecords[j].accountId == PlayerData.getInstance().accountId) {
					tta += this.treasureBowls[i].treasureBowlAttendRecords[j].totalAward;
				}
			}
		}
		this.todayTotalAward.string = tta;
	}
	
	async detail(index: any) {
		let treasureBowl = null;
		if ((this.currentIndex - 1) * 5 + index < this.treasureBowls.length) {
			treasureBowl = this.treasureBowls[(this.currentIndex - 1) * 5 + index];
		}
		//
		if (treasureBowl != null) {
			let panel = await CommonUtils.getPanel('gameplay/treasureBowl/TreasureBowlAttendPanel', TreasureBowlAttendPanel) as TreasureBowlAttendPanel;
			panel.init(treasureBowl.treasureBowlAttendRecords);
			EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });		
		} else {
			TipsManager.showMessage('该期聚宝盆分奖尚未开启噢');
		}
	}
	
	async prevClick() {
		this.currentIndex -- ;
		if (this.currentIndex < 1) {
			this.currentIndex = 1;
		}
		this.refreshPage();
	}
	
	async nextClick() {
		this.currentIndex ++ ;
		if (this.currentIndex > this.maxIndex) {
			this.currentIndex = this.maxIndex;
		}
		this.refreshPage();
	}
	
	fadeOut() {
		let fadeAction = cc.fadeTo(0.2, 1);
		this.node.runAction(cc.sequence(fadeAction, cc.callFunc(this.closePanel.bind(this))));
	}
	
	closePanel() {
		CommonUtils.safeRemove(this.node);
	}

    // update (dt) {}
}
