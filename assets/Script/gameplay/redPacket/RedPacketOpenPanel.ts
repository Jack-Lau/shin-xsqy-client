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

const {ccclass, property} = cc._decorator;

@ccclass
export default class RedPacketOpenPanel extends cc.Component {

	@property(cc.Label)
	redPacketName: cc.Label = null;
	@property(cc.Label)
	redPacketOpen: cc.Label = null;
	@property(cc.Label)
	redPacketPrice: cc.Label = null;
	@property([cc.Label])
	playerNames: Array<cc.Label> = [];
	@property([cc.Label])
	gainAmounts: Array<cc.Label> = [];
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	openBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property(cc.Sprite)
	opened: cc.Sprite = null;
	@property([cc.Sprite])
	luckyStars: Array<cc.Sprite> = [];

	redPacket = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
		this.openBtn.node.on(cc.Node.EventType.TOUCH_END, this.attend.bind(this));
	}

	async init(redPacket : any) {
		this.redPacket = redPacket;
		this.redPacketName.string = this.redPacket.redPacketRecord.creatorName + '的' + (this.redPacket.redPacketRecord.type == 0 ? '小红包' : '大红包');
		this.redPacketOpen.string = '开抢人数 ' + this.redPacket.redPacketOpenRecords.length + '/6';
		this.redPacketPrice.string = this.redPacket.redPacketRecord.type == 0 ? '1000' : '10000';
		this.openBtn.node.active = this.redPacket.redPacketRecord.finish == true ? false : true;
		this.opened.node.active = false;
		for (let i = 0 ; i < this.playerNames.length; i ++) {
			if (i < this.redPacket.redPacketOpenRecords.length) {
				this.playerNames[i].string = this.redPacket.redPacketOpenRecords[i].playerName;
				this.gainAmounts[i].string = this.redPacket.redPacketRecord.finish == true ? this.redPacket.redPacketOpenRecords[i].gainAmount / 1000 : '？？';
				this.luckyStars[i].node.active = this.redPacket.redPacketOpenRecords[i].luckyStar == true ? true : false;
				if (this.redPacket.redPacketOpenRecords[i].accountId == PlayerData.getInstance().accountId) {
					this.openBtn.node.active = false;
					this.opened.node.active = true;
				}
			} else {
				this.playerNames[i].string = '？？？？';
				this.gainAmounts[i].string = '？？';
				this.luckyStars[i].node.active = false;
			}
		}
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.2, 255);
		this.node.runAction(fadeAction);
	}
	
	async attend() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/redPacket/open', [this.redPacket.redPacketRecord.id]);
		if (response.status === 0) {
			TipsManager.showMessage("报名成功~敬请期待红包开奖吧！");
		}
		this.fadeOut();
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
