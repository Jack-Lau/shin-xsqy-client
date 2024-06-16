// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { ResUtils } from "../../utils/ResUtils";
import { TipsManager } from "../../base/TipsManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FishingResultPanel extends cc.Component {

	@property(cc.Label)
	gram: cc.Label = null;
	@property(cc.Label)
	currencyAmount: cc.Label = null;
	@property(cc.Label)
	fishName: cc.Label = null;
	@property(cc.Label)
	description: cc.Label = null;
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property(cc.Sprite)
	gainCurrencyType: cc.Sprite = null;
	@property(cc.Sprite)
	fishSprite: cc.Sprite = null;
	@property(cc.Sprite)
	lightSprite: cc.Sprite = null;
	
	fishCategory = null;
	fishingOnceRecord = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
	}
	
	async init(record : any) {
		this.fishingOnceRecord = record;
		this.fishCategory = await ConfigUtils.getConfigJson('FishCategory');
		//
		let fc = this.fishCategory[this.fishingOnceRecord.fishCategoryId];
		this.gram.string = this.fishingOnceRecord.gram + '两';
		this.currencyAmount.string = this.fishingOnceRecord.awardCurrencyId == 151 ? this.fishingOnceRecord.awardCurrencyAmount / 1000 : this.fishingOnceRecord.awardCurrencyAmount;
		this.fishName.string = fc.name;
		this.fishName.node.color = cc.Color.fromHEX(this.fishName.node.color, CommonUtils.getPetTipColorByColor(fc.color));
		this.description.string = fc.description;
		this.gainCurrencyType.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(this.fishingOnceRecord.awardCurrencyId);
		this.fishSprite.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/fish/' + this.fishingOnceRecord.fishCategoryId);
		if (fc.color >= 5) {
			this.lightSprite.node.active = true;
		} else {
			this.lightSprite.node.active = false;
		}
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.5, 255);
		this.node.runAction(fadeAction);
	}
	
	fadeOut() {
		let fadeAction = cc.fadeTo(0.5, 1);
		this.node.runAction(cc.sequence(fadeAction, cc.callFunc(this.closePanel.bind(this))));
	}
	
	closePanel() {
		CommonUtils.safeRemove(this.node);
		if (this.fishingOnceRecord.awardCurrencyId == 151) {
			TipsManager.showMessage("出售给了黄大虎，获得 " + this.fishingOnceRecord.awardCurrencyAmount / 1000 + '<color=#ff964f>仙石</c>！');
		} else {
			TipsManager.showMessage("出售给了黄大虎，获得 " + this.fishingOnceRecord.awardCurrencyAmount + '<color=#50D8FF>钓鱼点</c>！');
		}
	}

    // update (dt) {}
}
