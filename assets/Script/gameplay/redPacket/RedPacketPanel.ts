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
import RedPacketOpenPanel from "./RedPacketOpenPanel";
import RedPacketTodayPanel from "./RedPacketTodayPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RedPacketPanel extends cc.Component {
	
	@property([cc.Label])
	bigRedPacketNames: Array<cc.Label> = [];
	@property([cc.Label])
	bigRedPacketOpens: Array<cc.Label> = [];
	@property([cc.Label])
	smallRedPacketNames: Array<cc.Label> = [];
	@property([cc.Label])
	smallRedPacketOpens: Array<cc.Label> = [];
	@property(cc.Label)
	notTakeAmount: cc.Label = null;

	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	infoBtn: cc.Button = null;
	@property(cc.Button)
	todayBtn: cc.Button = null;
	@property(cc.Button)
	takeBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property([cc.Sprite])
	bigRedPackets: Array<cc.Sprite> = [];
	@property([cc.Sprite])
	bigRedPacketAttends: Array<cc.Sprite> = [];
	@property([cc.Sprite])
	smallRedPackets: Array<cc.Sprite> = [];
	@property([cc.Sprite])
	smallRedPacketAttends: Array<cc.Sprite> = [];
	
	bigRedPacketDatas = [];
	smallRedPacketDatas = [];
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
		this.infoBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 40));
		this.todayBtn.node.on(cc.Node.EventType.TOUCH_END, this.today.bind(this));
		this.takeBtn.node.on(cc.Node.EventType.TOUCH_END, this.take.bind(this));
		//
		for (let i = 0 ; i < this.bigRedPackets.length; i ++) {
			this.bigRedPackets[i].node.on(cc.Node.EventType.TOUCH_END, this.detail.bind(this, i, true));
		}
		for (let i = 0 ; i < this.smallRedPackets.length; i ++) {
			this.smallRedPackets[i].node.on(cc.Node.EventType.TOUCH_END, this.detail.bind(this, i, false));
		}
	}

	async init() {
		GameConfig.startGambling();
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/redPacket/get', []);
		if (response.status === 0) {
			this.refresh(response.content);
		}
		//
		this.schedule(this.auto, 1);
	}
	
	refresh(overall: any) {
		this.bigRedPacketDatas = [];
		this.smallRedPacketDatas = [];
		for (let i = 0 ; i < overall.redPackets.length; i ++) {
			if (overall.redPackets[i].redPacketRecord.type == 0) {
				this.smallRedPacketDatas.push(overall.redPackets[i]);
			} else {
				this.bigRedPacketDatas.push(overall.redPackets[i]);
			}
		}
		this.selfRecord = overall.redPacketSelfRecord;
		//
		for (let i = 0 ; i < this.bigRedPacketDatas.length; i ++) {
			this.bigRedPacketNames[i].string = this.bigRedPacketDatas[i].redPacketRecord.creatorName + '的大红包';
			this.bigRedPacketOpens[i].string = '开抢人数 ' + this.bigRedPacketDatas[i].redPacketOpenRecords.length + '/6';
			this.bigRedPacketAttends[i].node.active = false;
			for (let j = 0 ; j < this.bigRedPacketDatas[i].redPacketOpenRecords.length; j ++) {
				if (this.bigRedPacketDatas[i].redPacketOpenRecords[j].accountId == PlayerData.getInstance().accountId) {
					this.bigRedPacketAttends[i].node.active = true;
					break;
				}
			}
		}
		//
		for (let i = 0 ; i < this.smallRedPacketDatas.length; i ++) {
			this.smallRedPacketNames[i].string = this.smallRedPacketDatas[i].redPacketRecord.creatorName + '的小红包';
			this.smallRedPacketOpens[i].string = '开抢人数 ' + this.smallRedPacketDatas[i].redPacketOpenRecords.length + '/6';
			this.smallRedPacketAttends[i].node.active = false;
			for (let j = 0 ; j < this.smallRedPacketDatas[i].redPacketOpenRecords.length; j ++) {
				if (this.smallRedPacketDatas[i].redPacketOpenRecords[j].accountId == PlayerData.getInstance().accountId) {
					this.smallRedPacketAttends[i].node.active = true;
					break;
				}
			}
		}
		//
		this.notTakeAmount.string = this.selfRecord.notTakeAmount / 1000 + '';
	}
	
	async detail(index: any, isBig: any) {
		let redPacket = null;
		if (isBig == true) {
			redPacket = this.bigRedPacketDatas[index];
		} else {
			redPacket = this.smallRedPacketDatas[index];
		}
		//
        let panel = await CommonUtils.getPanel('gameplay/redPacket/RedPacketOpenPanel', RedPacketOpenPanel) as RedPacketOpenPanel;
		panel.init(redPacket);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });		
	}
	
	async today() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/redPacket/today', []);
		if (response.status === 0) {
			let panel = await CommonUtils.getPanel('gameplay/redPacket/RedPacketTodayPanel', RedPacketTodayPanel) as RedPacketTodayPanel;
			panel.init(response.content);
			EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
		}
	}
	
	async take() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/redPacket/take', []);
		if (response.status === 0) {
			this.refresh(response.content);
			TipsManager.showMessage('成功领取 ' + this.selfRecord.lastTakeAmount / 1000 + `<img src='currency_icon_151'/>！`);
		}
	}
	
	async auto() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/redPacket/get', []);
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
