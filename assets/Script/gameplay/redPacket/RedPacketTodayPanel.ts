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
import RedPacketOpenPanel from "./RedPacketOpenPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RedPacketTodayPanel extends cc.Component {

	@property([cc.Label])
	redPacketNames: Array<cc.Label> = [];
	@property([cc.Label])
	luckyStars: Array<cc.Label> = [];
	@property([cc.Label])
	gainAmount: Array<cc.Label> = [];
	@property(cc.Label)
	currentPage: cc.Label = null;
	
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
	
	redPackets = null;
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

	async init(redPackets : any) {
		this.redPackets = redPackets;
		//
		if (Math.floor(this.redPackets.length / 5) * 5 == this.redPackets.length && this.redPackets.length > 0) {
			this.maxIndex = Math.floor(this.redPackets.length / 5);
		} else {
			this.maxIndex = Math.floor(this.redPackets.length / 5 + 1);
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
			if (recordIndex < this.redPackets.length) {
				let record = this.redPackets[recordIndex];
				this.redPacketNames[i].string = record.redPacketRecord.creatorName + '的' + (record.redPacketRecord.type == 0 ? '小红包' : '大红包');
				this.luckyStars[i].node.active = false;
				this.gainAmount[i].string = '？？';
				for (let j = 0; j < record.redPacketOpenRecords.length; j ++) {
					if (record.redPacketOpenRecords[j].accountId == PlayerData.getInstance().accountId) {
						if (record.redPacketOpenRecords[j].luckyStar == true) {
							this.luckyStars[i].node.active = true;
						}
						if (record.redPacketOpenRecords[j].gainAmount > 0) {
							this.gainAmount[i].string = record.redPacketOpenRecords[j].gainAmount / 1000;
						}
						break;
					}
				}
			} else {
				this.redPacketNames[i].string = '？？？？';
				this.luckyStars[i].node.active = false;
				this.gainAmount[i].string = '？？';
			}
		}
	}
	
	async detail(index: any) {
		let redPacket = null;
		if ((this.currentIndex - 1) * 5 + index < this.redPackets.length) {
			redPacket = this.redPackets[(this.currentIndex - 1) * 5 + index];
		}
		//
		if (redPacket != null) {
			let panel = await CommonUtils.getPanel('gameplay/redPacket/RedPacketOpenPanel', RedPacketOpenPanel) as RedPacketOpenPanel;
			panel.init(redPacket);
			EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });		
		} else {
			TipsManager.showMessage('这里没有红包报名记录噢');
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
