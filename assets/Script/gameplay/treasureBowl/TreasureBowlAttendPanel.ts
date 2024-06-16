// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import PlayerData from "../../data/PlayerData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TreasureBowlAttendPanel extends cc.Component {

	@property([cc.Label])
	playerNames: Array<cc.Label> = [];
	@property([cc.Label])
	playerContributions: Array<cc.Label> = [];
	@property([cc.Label])
	playerTokens: Array<cc.Label> = [];
	@property(cc.Label)
	currentPage: cc.Label = null;
	@property(cc.Label)
	myName: cc.Label = null;
	@property(cc.Label)
	myContribution: cc.Label = null;
	@property(cc.Label)
	myToken: cc.Label = null;
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	prevBtn: cc.Button = null;
	@property(cc.Button)
	nextBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	
	treasureBowlAttendRecords = null;
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
	}

	async init(treasureBowlAttendRecords : any) {
		this.treasureBowlAttendRecords = treasureBowlAttendRecords;
		//
		if (Math.floor(this.treasureBowlAttendRecords.length / 5) * 5 == this.treasureBowlAttendRecords.length && this.treasureBowlAttendRecords.length > 0) {
			this.maxIndex = Math.floor(this.treasureBowlAttendRecords.length / 5);
		} else {
			this.maxIndex = Math.floor(this.treasureBowlAttendRecords.length / 5 + 1);
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
			if (recordIndex < this.treasureBowlAttendRecords.length) {
				let record = this.treasureBowlAttendRecords[recordIndex];
				this.playerNames[i].string = record.playerName;
				this.playerContributions[i].string = '宝气 ' + record.totalContribution;
				this.playerTokens[i].string = record.totalChangleToken;
			} else {
				this.playerNames[i].string = '？？？？';
				this.playerContributions[i].string = '？？？？';
				this.playerTokens[i].string = '？？？？';
			}
		}
		//
		let mc = 0, mt = 0;
		for (let i = 0 ; i < this.treasureBowlAttendRecords.length; i ++) {
			if (this.treasureBowlAttendRecords[i].accountId == PlayerData.getInstance().accountId) {
				mc = this.treasureBowlAttendRecords[i].totalContribution;
				mt = this.treasureBowlAttendRecords[i].totalChangleToken;
			}
		}
		this.myName.string = PlayerData.getInstance().playerName;
		this.myContribution.string = '宝气 ' + mc;
		this.myToken.string = mt;
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
