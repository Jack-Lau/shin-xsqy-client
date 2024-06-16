// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { GameConfig } from "../../config/GameConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PKHandleReceivePanel extends cc.Component {

	@property(cc.RichText)
	descriptionLabel: cc.RichText = null;
	@property(cc.RichText)
	levelAndSchoolLabel: cc.RichText = null;
	@property(cc.Node)
	autoRejectPK: cc.Node = null;
	@property(cc.Sprite)
	tick: cc.Sprite;
	@property(cc.Label)
	countdownLabel: cc.Label = null;
	@property(cc.Button)
	confirmButton: cc.Button = null;
	@property(cc.Button)
	rejectButton: cc.Button = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

	playerDetail = null;
	cd = 10;

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start() {

	}

	init(playerDetail) {
		this.playerDetail = playerDetail;
		this.descriptionLabel.string = '<color=#571100>少侠</c><color=#900404> ' + this.playerDetail.player.playerName + ' </c><color=#571100>邀请您切磋，是否接受？</c>';
		this.levelAndSchoolLabel.string = '等级 ' + this.playerDetail.player.playerLevel + '   ' + '门派 ' + this.getSchoolName(this.playerDetail.schoolId);
		//
		this.autoRejectPK.on(cc.Node.EventType.TOUCH_END, this.changeTick.bind(this));
		this.confirmButton.node.on(cc.Node.EventType.TOUCH_END, this.confirmPK.bind(this));
		this.rejectButton.node.on(cc.Node.EventType.TOUCH_END, this.rejectPK.bind(this));
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		//
		this.schedule(this.countdown, 1);
	}

	countdown() {
		this.countdownLabel.string = this.cd + '秒后自动视为拒绝邀请';
		if (this.cd <= 0) {
			this.closePanel();
		} else {
			this.cd--;
		}
	}

	closePanel() {
		CommonUtils.safeRemove(this.node);
		this.unschedule(this.countdown);
		GameConfig.autoRejectPK = this.tick.node.active;
	}

	changeTick() {
		this.tick.node.active = !this.tick.node.active;
	}

	async confirmPK() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pk/receive', [this.playerDetail.player.accountId, true]) as any;
		if (response.status == 0) {
			
		}
		this.closePanel();
	}

	async rejectPK() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pk/receive', [this.playerDetail.player.accountId, false]) as any;
		if (response.status == 0) {
			
		}
		this.closePanel();
	}

	getSchoolName(id: number) {
		switch (id) {
			case 101: return '凌霄殿';
			case 102: return '普陀山';
			case 103: return '盘丝洞';
			case 104: return '五庄观';
			default: return '无门派';
		}
	}

	// update (dt) {}
}
