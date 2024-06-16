// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PKWaitReceivePanel extends cc.Component {

	@property(cc.RichText)
	descriptionLabel: cc.RichText = null;
	@property(cc.Label)
	countdownLabel: cc.Label = null;
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;

	playerBaseInfo = null;
	cd = 10;

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start() {

	}

	init(playerBaseInfo) {
		this.playerBaseInfo = playerBaseInfo;
		this.descriptionLabel.string = '<color=#571100>请等待</c><color=#900404> ' + this.playerBaseInfo.player.playerName + ' </c><color=#571100>回复您的切磋邀请</c>';
		//
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		EventDispatcher.on(Notify.PK_WAIT_RECEIVE_PANEL_CLOSE, this.forceClose);
		this.schedule(this.countdown, 1);
	}

	countdown() {
		this.countdownLabel.string = this.cd + '秒后自动视为拒绝邀请';
		if (this.cd <= 0) {
			this.closePanel();
			//
			let callback = async () => {
				let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pk/async', [this.playerBaseInfo.player.accountId]) as any;
				if (response.status == 0) {
				}
			}
			CommonUtils.showRichSCBox(
				`此位少侠现在不便切磋，是否与其幻影进行切磋练习？`,
				`切磋练习为非实时对战`,
				null,
				callback
			);
		} else {
			this.cd--;
		}
	}

	closePanel() {
		CommonUtils.safeRemove(this.node);
		this.unschedule(this.countdown);
		EventDispatcher.off(Notify.PK_WAIT_RECEIVE_PANEL_CLOSE, this.forceClose);
	}

	forceClose = function () {
		this.closePanel();
	}.bind(this);

	// update (dt) {}
}