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
import CommonPanel from "../../base/CommonPanel";
import PlayerData from "../../data/PlayerData";
import Optional from "../../cocosExtend/Optional";
import PlayerPrefab from "../../player/PlayerPrefab";
import { CurrencyId } from "../../config/CurrencyId";

const { ccclass, property } = cc._decorator;
@ccclass
export default class WorkPanel extends CommonPanel {
	
	@property(PlayerPrefab)
	player: PlayerPrefab = null;
	@property(cc.Sprite)
	workProgress: cc.Sprite = null;
	@property(cc.Label)
	workMinutes: cc.Label = null;
	@property(cc.Label)
	gainExp: cc.Label = null;
	@property(cc.Label)
	gainGold: cc.Label = null;
	@property(cc.Button)
	endBtn: cc.Button = null;
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;

	cd = 0;

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start() {
		this.initEvents();
		this.init();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.endBtn.node.on(cc.Node.EventType.TOUCH_END, this.end.bind(this));
		this.schedule(this.countdown, 1);
	}

	async init() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/work/update', []);
		if (response.status === 0) {
			if (response.content.working == true) {
				TipsManager.showMessage("欢迎回来，赶快结算您的打工收益吧！");
				this.workMinutes.string = "当前已打工 " + response.content.workingMinutes + "分钟";
				this.gainExp.string = response.content.expAward;
				this.gainGold.string = response.content.goldAward;
			}
			else {
				let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/work/start', []);
				if (response2.status === 0) {
					TipsManager.showMessage("少侠已开始打工，可以放心离开游戏了！");
					this.workMinutes.string = "当前已打工 " + response2.content.workingMinutes + "分钟";
					this.gainExp.string = response2.content.expAward;
					this.gainGold.string = response2.content.goldAward;
				}
			}
		}
		this.initPlayer();
	}

	countdown() {
		this.cd++;
		if (this.cd > 60) {
			this.cd = 0;
			this.upd();
		}
		this.workProgress.node.width = 488 * this.cd / 60;
	}

	async upd() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/work/update', []);
		if (response.status === 0) {
			this.workMinutes.string = "当前已打工 " + response.content.workingMinutes + "分钟";
			this.gainExp.string = response.content.expAward;
			this.gainGold.string = response.content.goldAward;
			this.player.randomChangeMoveStatus();
		}
	}

	async end() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/work/end', []);
		if (response.status === 0) {
			TipsManager.showMessage("成功结算了打工收益！");
			TipsManager.showGainCurrency({ currencyId: CurrencyId.经验, amount: response.content.expAward });
			TipsManager.showGainCurrency({ currencyId: CurrencyId.元宝, amount: response.content.goldAward });
		}
		this.closePanel();
	}

	initPlayer() {
		this.player.initNameLabel(
			new Optional<number>(PlayerData.getInstance().schoolId).getOrElse(0)
			, PlayerData.getInstance().playerName
		);
		this.player.initAnimation(
			PlayerData.getInstance().prefabId
			, PlayerData.getInstance().equipments['weapon'].fmap(CommonUtils.getEPId)
			, PlayerData.getInstance().fashion
			, PlayerData.getInstance().fashionDye
		);
	}

	closePanel() {
		CommonUtils.safeRemove(this.node);
		this.unschedule(this.countdown);
	}

	// update (dt) {}
}
